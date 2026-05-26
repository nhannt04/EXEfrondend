# TÀI LIỆU KHẢO SÁT & ĐẶC TẢ THIẾT KẾ BACKEND JAVA (SPRING BOOT) - HISTRA

Tài liệu này đặc tả toàn bộ kiến trúc, cơ sở dữ liệu PostgreSQL, cơ chế Gợi ý Lịch trình (Recommendation Engine), quy tắc quản lý hình ảnh Cloudflare Images, thứ tự Migrations và hợp đồng API chuẩn cho dự án **HISTRA**.

---

## 🏛️ I. KIẾN TRÚC HỆ THỐNG & TECH STACK

*   **Ngôn ngữ lập trình:** Java 17 hoặc 21 (LTS)
*   **Framework chính:** Spring Boot 3.x (Spring Web, Spring Security, Spring Data JPA, Spring Boot Starter Validation)
*   **Xác thực:** RESTful Stateless Security sử dụng **JWT (JSON Web Token)**
*   **Cơ sở dữ liệu:** **PostgreSQL 15+**
*   **Database Migration Tool:** **Flyway**
*   **Dịch vụ CDN & Media Storage:** **Cloudflare Images** (quản lý thông qua HTTP REST Client trong Spring Boot)

---

## 📊 II. THIẾT KẾ CƠ SỞ DỮ LIỆU POSTGRESQL (DDL SCHEMA)

Để bộ máy gợi ý hoạt động hiệu quả, bảng địa điểm (`spots`) được thiết kế với đầy đủ metadata chuyên sâu để chấm điểm và phân bổ buổi hợp lý.

```sql
-- V1__create_users.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER', -- 'USER', 'EXPERT', 'ADMIN'
    avatar_cf_id VARCHAR(255),       -- Cloudflare Image ID để quản lý/xóa
    avatar_url VARCHAR(500),         -- URL phân phối trực tiếp từ Cloudflare
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- V2__create_spots.sql
CREATE TABLE spots (
    id BIGSERIAL PRIMARY KEY,
    name_vi VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,            -- 'sightseeing', 'food', 'cafe', 'activity', 'stay'
    tags VARCHAR(255) NOT NULL,              -- "culture,photo,romantic,couple,chill"
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    average_cost INTEGER DEFAULT 0,           -- Chi phí trung bình (VND/người)
    estimated_duration_minutes INTEGER DEFAULT 60,
    opening_time TIME DEFAULT '08:00:00',
    closing_time TIME DEFAULT '22:00:00',
    crowd_level VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high'
    rating DOUBLE PRECISION DEFAULT 5.0,
    suitable_for VARCHAR(100) NOT NULL,       -- "couple,family,solo,friends"
    time_of_day VARCHAR(50) NOT NULL,         -- "morning", "afternoon", "evening", "all"
    image_cf_id VARCHAR(255),                 -- Cloudflare Image ID để quản lý/xóa
    image_url VARCHAR(500),                   -- URL phân phối trực tiếp từ Cloudflare
    description_vi TEXT,
    description_en TEXT
);

-- V3__create_refresh_tokens.sql
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expiry_date TIMESTAMP NOT NULL
);

-- V4__create_itineraries.sql
CREATE TABLE itineraries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    destination VARCHAR(100) DEFAULT 'Hội An',
    total_days INTEGER NOT NULL,
    total_budget DOUBLE PRECISION NOT NULL,
    travel_style VARCHAR(50) NOT NULL,        -- 'cultural', 'food', 'healing', 'adventure'
    group_type VARCHAR(50) NOT NULL,          -- 'couple', 'family', 'solo', 'friends'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- V5__create_itinerary_details.sql
CREATE TABLE itinerary_details (
    id BIGSERIAL PRIMARY KEY,
    itinerary_id BIGINT REFERENCES itineraries(id) ON DELETE CASCADE,
    spot_id BIGINT REFERENCES spots(id) ON DELETE RESTRICT,
    day_number INTEGER NOT NULL,              -- 1, 2, 3...
    time_slot VARCHAR(50) NOT NULL,           -- 'MORNING', 'LUNCH', 'AFTERNOON', 'EVENING'
    order_index INTEGER NOT NULL              -- Thứ tự sắp xếp trong buổi
);

-- V6__create_diaries.sql
CREATE TABLE diaries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,            -- 'healing', 'food', 'adventure', 'scenic'
    spot_id BIGINT REFERENCES spots(id) ON DELETE SET NULL,
    content_vi TEXT NOT NULL,
    content_en TEXT NOT NULL,
    image_cf_id VARCHAR(255),
    image_url VARCHAR(500),
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- V7__create_diary_likes.sql
CREATE TABLE diary_likes (
    diary_id BIGINT REFERENCES diaries(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (diary_id, user_id)
);

-- V8__create_comments.sql
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    diary_id BIGINT REFERENCES diaries(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE, -- Đệ quy cho bình luận con
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- V9__create_experts.sql
CREATE TABLE experts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    expertise VARCHAR(255) NOT NULL,
    description_vi TEXT,
    description_en TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    rating DOUBLE PRECISION DEFAULT 5.0
);

-- V10__create_expert_inquiries.sql
CREATE TABLE expert_inquiries (
    id BIGSERIAL PRIMARY KEY,
    expert_id BIGINT REFERENCES experts(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---

## 🧠 III. BỘ MÁY GỢI Ý & TỐI ƯU HÓA LỘ TRÌNH (CORE RECOMMENDATION ENGINE)

Quy trình xử lý sinh lịch trình thông minh trong `TripService` tuân theo luồng logic tuần tự:

```
[Request từ Frontend]
        ↓
1. SQL Query: Lọc danh sách spots có category phù hợp
        ↓
2. Scoring: Chấm điểm từng Spot (độ khớp Tags, Rating, Ngân sách, Group Type)
        ↓
3. Sorting: Sắp xếp giảm dần, lọc lấy Top N Spot có điểm cao nhất
        ↓
4. Routing: Tối ưu thứ tự di chuyển qua thuật toán Haversine Greedy từ điểm khởi hành
        ↓
5. Staggering: Phân bổ vào các buổi (Morning -> Lunch -> Afternoon -> Evening) dựa trên Opening/Closing & Category
        ↓
6. Budget Validation: Ước tính chi phí hoạt động, khách sạn, di chuyển và đối chiếu ngân sách
        ↓
[Trả JSON về Frontend]
```

### 1. Công thức Chấm điểm Điểm đến (Scoring Engine)

Mỗi địa điểm (`Spot`) trong cơ sở dữ liệu sẽ được chấm điểm dựa trên các tham số khảo sát từ người dùng (`TripRequest` bao gồm: `interests` (danh sách tags), `budget`, `days`, `people`, `groupType`, `style`).

```java
package vn.histra.service;

import org.springframework.stereotype.Service;
import vn.histra.model.Spot;
import vn.histra.dto.TripRequest;
import java.util.Arrays;
import java.util.List;

@Service
public class ScoringService {

    public double calculateScore(Spot spot, TripRequest request) {
        double score = 0.0;

        // 1. Độ trùng khớp sở thích (Preference Match) - Chiếm trọng số cao nhất
        if (spot.getTags() != null && !spot.getTags().isEmpty()) {
            List<String> spotTags = Arrays.asList(spot.getTags().split(","));
            long matchCount = request.getInterests().stream()
                .filter(interest -> spotTags.stream().anyMatch(tag -> tag.equalsIgnoreCase(interest)))
                .count();
            score += matchCount * 25.0; // Mỗi sở thích trùng khớp cộng 25 điểm
        }

        // 2. Điểm đánh giá thực tế (Rating Score)
        score += spot.getRating() * 8.0; // Tối đa 5.0 sao tương đương cộng thêm 40 điểm

        // 3. Khớp định mức ngân sách (Budget Fit Score)
        // Tính ngân sách trung bình mỗi người một ngày
        int budgetPerPersonPerDay = request.getBudget() / request.getPeople() / request.getDays();
        
        if (spot.getAverageCost() <= budgetPerPersonPerDay * 0.3) {
            score += 20.0; // Mức chi phí lý tưởng (dưới 30% ngân sách ngày), cộng 20 điểm
        } else if (spot.getAverageCost() > budgetPerPersonPerDay * 0.5) {
            score -= 15.0; // Điểm đến đắt đỏ so với ngân sách ngày, trừ 15 điểm để hạn chế chọn
        }

        // 4. Đối tượng nhóm phù hợp (Group Type Fit)
        if (spot.getSuitableFor() != null && spot.getSuitableFor().contains(request.getGroupType())) {
            score += 15.0; // Cộng 15 điểm nếu địa điểm được gắn nhãn phù hợp với đối tượng (ví dụ: 'couple', 'family')
        }

        // 5. Tránh đông đúc khi chọn du lịch chữa lành (Healing Style Fit)
        if ("healing".equalsIgnoreCase(request.getStyle()) && "high".equalsIgnoreCase(spot.getCrowdLevel())) {
            score -= 20.0; // Trừ mạnh 20 điểm nếu người dùng muốn 'healing' tĩnh dưỡng nhưng địa điểm lại quá xô bồ
        }

        return score;
    }
}
```

### 2. Thuật toán Tối ưu hóa Thứ tự Di chuyển (Haversine Greedy)

Sau khi chọn được danh sách Top các địa điểm có điểm số cao nhất từ `ScoringService`, backend tiến hành sắp xếp thứ tự đi qua thuật toán tham lam (Nearest Neighbor) sử dụng công thức **Haversine** để tính toán khoảng cách thực tế trên bề mặt trái đất.

```java
package vn.histra.service;

import org.springframework.stereotype.Service;
import vn.histra.model.Spot;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class RouteOptimizationService {

    public List<Spot> optimizeRoute(List<Spot> spots, double startLat, double startLng) {
        List<Spot> result = new ArrayList<>();
        List<Spot> remaining = new ArrayList<>(spots);
        
        double currentLat = startLat;
        double currentLng = startLng;

        while (!remaining.isEmpty()) {
            final double tempLat = currentLat;
            final double tempLng = currentLng;
            
            // Tìm địa điểm gần vị trí hiện tại nhất
            Spot nearest = remaining.stream()
                .min(Comparator.comparingDouble(spot -> 
                    haversine(tempLat, tempLng, spot.getLatitude(), spot.getLongitude())))
                .orElseThrow();

            result.add(nearest);
            remaining.remove(nearest);
            
            // Cập nhật vị trí hiện tại đến điểm vừa chọn
            currentLat = nearest.getLatitude();
            currentLng = nearest.getLongitude();
        }
        return result;
    }

    /**
     * Tính toán khoảng cách giữa hai điểm tọa độ theo km
     */
    private double haversine(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371; // Bán kính trái đất (km)
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLng / 2) * Math.sin(dLng / 2);
                 
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
```

### 3. Bộ Phân bổ Lịch trình Theo Buổi (Schedule Generator)

Để tạo lập một ngày đi hoàn thiện, hệ thống thực hiện phân phối các địa điểm đã tối ưu đường đi vào các buổi phù hợp với trạng thái mở cửa (`opening_time`, `closing_time`) và danh mục (`category`):

*   **Buổi Sáng (08:00):** Ưu tiên các điểm tham quan ngoài trời thoáng mát (`sightseeing` gắn nhãn `time_of_day` chứa `morning`).
*   **Buổi Trưa (12:00):** Phân bổ bắt buộc một địa điểm ăn uống đặc sản địa phương (`category = 'food'`).
*   **Buổi Chiều (15:00):** Dành cho hoạt động vui chơi hoặc quán cafe thư giãn (`cafe`, `activity` hoặc `afternoon`).
*   **Buổi Tối (19:00):** Chợ đêm, ngắm đèn lồng ven sông hoặc cafe tối (`evening`).

---

## ☁️ IV. QUY TRÌNH QUẢN LÝ HÌNH ẢNH QUA CLOUDFLARE IMAGES

Để tiết kiệm chi phí băng thông và tối ưu tốc độ phân phối ảnh qua CDN, HISTRA sử dụng **Cloudflare Images REST API** thay vì lưu ảnh thô vào Database hoặc dùng Amazon S3.

### 1. Luồng Upload Ảnh Chuẩn
```
[Frontend gửi Multipart File]
             ↓
[Spring Boot Controller tiếp nhận]
             ↓
[CloudflareImageService gọi HTTP POST sang Cloudflare Images API]
             ↓
[Lấy về JSON chứa image_cf_id và variants URL]
             ↓
[Lưu đồng thời: image_cf_id + image_url vào bảng tương ứng trong Database]
```

### 2. Triển khai Service Java Spring Boot

```java
package vn.histra.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudflareImageService {

    @Value("${cloudflare.images.api-token}")
    private String apiToken;

    @Value("${cloudflare.images.account-id}")
    private String accountId;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> uploadImage(MultipartFile file) throws IOException {
        String url = "https://api.cloudflare.com/client/v4/accounts/" + accountId + "/images/v1";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setBearerAuth(apiToken);

        // Chuyển file Multipart sang Resource hợp lệ cho REST Client
        ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileResource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
        
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            Map<String, Object> result = (Map<String, Object>) response.getBody().get("result");
            String cfId = (String) result.get("id");
            // Định dạng URL truy xuất công khai chuẩn của Cloudflare
            String deliveryUrl = "https://imagedelivery.net/" + accountId + "/" + cfId + "/public";
            
            return Map.of("cfId", cfId, "url", deliveryUrl);
        }
        
        throw new RuntimeException("Lỗi upload ảnh lên Cloudflare Images");
    }

    public void deleteImage(String cfId) {
        String url = "https://api.cloudflare.com/client/v4/accounts/" + accountId + "/images/v1/" + cfId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiToken);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
        restTemplate.exchange(url, HttpMethod.DELETE, requestEntity, Void.class);
    }
}
```

---

## 🤝 V. HỢP ĐỒNG API VÀ ĐỊNH DẠNG DỮ LIỆU THỐNG NHẤT

Toàn bộ các API trong hệ thống HISTRA bắt buộc phải bọc trong một cấu trúc phản hồi đồng bộ để dễ dàng xử lý lỗi ở Frontend.

### 1. Định dạng Phản hồi Thành Công (Success Envelope)
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "email": "traveler@histra.vn",
    "fullName": "Nguyễn Văn A"
  },
  "timestamp": "2026-05-26T17:21:40Z"
}
```

### 2. Định dạng Phản hồi Lỗi (Error Envelope)
```json
{
  "success": false,
  "message": "Email đã được đăng ký trong hệ thống",
  "errorCode": "EMAIL_ALREADY_EXISTS",
  "timestamp": "2026-05-26T17:22:15Z"
}
```

---

## 📅 VI. LỘ TRÌNH PHÁT TRIỂN & FLYWAY MIGRATION

Để hỗ trợ kiểm thử chất lượng sinh gợi ý chuẩn xác, dự án sẽ chia làm các bước Flyway Migration để khởi tạo cấu trúc dữ liệu và nạp dữ liệu mẫu chất lượng cao ngay lập tức.

### 1. Thứ tự File SQL Flyway Migrations
*   `V1__create_users.sql` (Khởi tạo tài khoản)
*   `V2__create_spots.sql` (Khởi tạo bảng địa điểm Hội An)
*   `V3__create_refresh_tokens.sql` (Lưu khóa phiên JWT)
*   `V4__create_itineraries.sql` (Bảng lịch trình)
*   `V5__create_itinerary_details.sql` (Chi tiết ngày hoạt động)
*   `V6__create_diaries.sql` (Mạng xã hội du ký)
*   `V7__create_diary_likes.sql` (Lưu thả tim)
*   `V8__create_comments.sql` (Bình luận phân cấp đệ quy)
*   `V9__create_experts.sql` (Hướng dẫn viên địa phương)
*   `V10__create_expert_inquiries.sql` (Tin nhắn hỏi đáp chuyên gia)
*   `V11__seed_spots_hoi_an.sql` (Bắt buộc chèn **30–50 địa điểm thực tế** tại Hội An đầy đủ vĩ độ, kinh độ, tags, và chi phí trung bình để chạy thử thuật toán).

### 2. Thứ tự triển khai Backend (Sprints)
*   **Sprint 1:** Cài đặt khung Spring Security, cấu hình xác thực JWT, cơ chế Refresh Token và Flyway Migration tự động tạo bảng.
*   **Sprint 2:** Chèn dữ liệu mẫu 45 điểm đến chất lượng cao của Hội An đầy đủ metadata chi phí, khoảng cách và thời gian thích hợp đi trong ngày.
*   **Sprint 3:** Viết Core Recommendation Engine (Tính điểm Scoring, tối ưu tuyến đường Haversine Greedy, Schedule phân bổ buổi và validate ngân sách tổng).
*   **Sprint 4:** Hoàn thành các tính năng cộng đồng (Diary posts, bình luận đệ quy đa cấp, upload/xóa ảnh qua Cloudflare REST API).
*   **Sprint 5:** Phát triển phân hệ Chuyên gia (Experts, gửi yêu cầu chat nhanh), viết tài liệu Swagger API, hoàn thiện tích hợp Frontend.

