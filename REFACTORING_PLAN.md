# Kế hoạch Tái cấu trúc Thư mục (Directory Refactoring Plan) - Travelist App

Tài liệu này đề xuất một cấu trúc thư mục mới tối ưu hơn cho dự án **Travelist**, giúp tăng khả năng bảo trì, mở rộng dự án và đưa ra một quy trình thực hiện từng bước (incremental migration) để tránh gây đứt gãy đường dẫn import hoặc phát sinh lỗi xung đột mã nguồn.

---

## 1. Phân tích Hiện trạng & Vấn đề (Current Issues)

Hiện tại cấu trúc thư mục của dự án đang gặp một số điểm bất lợi cho việc phát triển lâu dài:
1.  **Nhập nhèm giữa toàn cục (Global) và cục bộ (Feature-specific)**:
    *   Tệp `AddressDropdown.jsx` nằm trực tiếp ở `src/components/`, trong khi các thành phần bố cục nằm ở `src/components/layout/`.
    *   Các thư mục con như `src/features/entertainment/` hay `src/features/navigation/` gần như trống hoặc chứa rất ít logic, gây nhiễu cấu trúc.
2.  **Đường dẫn tương đối quá sâu (Relative Import Hell)**:
    *   Sử dụng nhiều cấp `../../..` để trỏ về `context/` hoặc `services/`. Khi di chuyển tệp, việc sửa lại các đường dẫn này thủ công rất dễ sót và gây lỗi runtime.
3.  **Tệp thành phần quá lớn (Monolithic Components)**:
    *   [TripPlannerStudio.jsx](file:///home/michael/code/EXE/EXEfrondend/src/features/trip-planner/components/TripPlannerStudio.jsx) dài hơn 3.800 dòng, kiêm nhiệm từ render giao diện Form, Timeline, Lịch trình, Bản đồ Leaflet đến quản lý giả lập dẫn đường và chi phí. 
    *   [LandingPage.jsx](file:///home/michael/code/EXE/EXEfrondend/src/features/trip-planner/components/LandingPage.jsx) dài hơn 1.400 dòng.

---

## 2. Cấu trúc Thư mục Đề xuất (Proposed Architecture)

Cấu trúc mới áp dụng mô hình **Feature-Based (Screaming Architecture)**. Những phần dùng chung nằm ở ngoài, những phần thuộc nghiệp vụ riêng biệt sẽ gom cụm vào từng Feature.

```
src/
├── assets/             # Ảnh, Video, Phông chữ toàn cục
├── components/         # Các Component dùng chung cho toàn dự án
│   ├── ui/             # Component nguyên tử (Button, Input, Dropdown, Modal)
│   └── layout/         # Khung giao diện (Header, Footer)
├── context/            # Quản lý State toàn cục (LanguageContext, AuthContext)
├── features/           # Các mô-đun nghiệp vụ độc lập
│   ├── trip-planner/   # Nghiệp vụ Lập kế hoạch & Bản đồ
│   │   ├── components/ # Sub-components (Timeline, SavedList, RadarPanel)
│   │   ├── hooks/      # Custom Hook riêng của module (useGpsNavigator)
│   │   └── utils/      # Trình định dạng hoặc logic riêng
│   ├── social/         # Mạng xã hội & Bảng tin cộng đồng
│   ├── admin/          # Bảng điều khiển quản trị viên
│   └── chatbot/        # Trợ lý ảo AI
├── hooks/              # Custom Hook dùng chung (useLocalStorage, useDevice)
├── services/           # Lớp kết nối API toàn cục
│   ├── api.js          # Cấu hình Axios Client
│   ├── auth.js         # API tài khoản
│   └── spots.js        # API địa điểm du lịch
├── utils/              # Các hàm trợ giúp chung (date, currency formatter)
├── App.jsx             # Bộ phân tuyến Router & Quản lý Layout chính
├── main.jsx            # Điểm gắn kết DOM
└── index.css           # Cấu hình Tailwind & CSS toàn cục
```

---

## 3. Chiến lược Tránh lỗi & Xung đột (Safe Migration Strategy)

Để đảm bảo việc tái cấu trúc diễn ra an toàn, không làm hỏng ứng dụng, chúng ta sẽ áp dụng 4 nguyên tắc phòng ngừa sau:

### Bước 1: Cấu hình Path Alias (Bắt buộc trước khi di chuyển tệp)
Thay thế toàn bộ đường dẫn import tương đối `../../` phức tạp bằng ký tự đại diện `@/` trỏ thẳng vào thư mục `src`. Điều này cho phép di chuyển tệp đi bất cứ đâu mà không cần sửa lại mã nguồn import bên trong tệp đó.

*   Cấu hình trong `vite.config.js`:
    ```javascript
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import path from 'path';

    export default defineConfig({
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
    });
    ```
*   Cấu hình trong tệp mới `jsconfig.json` ở thư mục gốc (để VS Code hiểu và tự gợi ý):
    ```json
    {
      "compilerOptions": {
        "baseUrl": ".",
        "paths": {
          "@/*": ["src/*"]
        }
      },
      "include": ["src/**/*"]
    }
    ```

### Bước 2: Chuyển đổi import sang dạng Alias theo từng nhóm
*   Trước khi di chuyển các tệp tin, đổi tất cả các dòng import thư viện nội bộ từ:
    `import authService from '../../services/authService';`
    thành:
    `import authService from '@/services/authService';`
*   Việc này được thực hiện trước khi di chuyển thư mục để đảm bảo mã chạy bình thường.

### Bước 3: Di chuyển tệp tin theo từng giai đoạn (Incremental Steps)
Không di chuyển hàng loạt. Chia thành các đợt nhỏ:
1.  **Đợt 1**: Cấu hình Vite Alias và kiểm tra dự án vẫn chạy bình thường.
2.  **Đợt 2**: Gom nhóm và chuyển toàn bộ thư mục `services/` và `context/` sang dạng `@/services/...` và `@/context/...`. Chạy `npm run build` để kiểm tra.
3.  **Đợt 3**: Di chuyển các component dùng chung như `AddressDropdown.jsx` vào thư mục `src/components/ui/` tương ứng.
4.  **Đợt 4**: Dọn dẹp các thư mục rỗng (`entertainment`, `navigation`).

### Bước 5: Tách nhỏ các Component khổng lồ (De-monolithing)
*   Tách dần các phần logic độc lập khỏi `TripPlannerStudio.jsx`.
    *   Ví dụ: Chuyển phần hiển thị bản đồ nhỏ trong Studio sang một component con riêng biệt.
    *   Chuyển phần phân tích chi phí (Budget Breakdown) ra một component con.
*   Mỗi lần tách ra một file nhỏ, tiến hành import vào file cha và chạy build kiểm tra lỗi lập tức.

---

## 4. Kế hoạch Hành động Chi tiết (Action Plan)

| Giai đoạn | Nhiệm vụ | Tệp tác động | Công cụ kiểm tra | Mức độ rủi ro |
| :--- | :--- | :--- | :--- | :--- |
| **Giai đoạn 1** | Tạo cấu hình Alias `@/*` | `vite.config.js`, `jsconfig.json` (tạo mới) | `npm run dev` | Thấp |
| **Giai đoạn 2** | Thay thế import trong `App.jsx`, `Header.jsx`, `LandingPage.jsx` sang `@/...` | Các tệp layout chính | `npm run build` | Trung bình |
| **Giai đoạn 3** | Di chuyển và đổi tên tệp dịch vụ nghiệp vụ | `src/services/` | `npm run build` | Trung bình |
| **Giai đoạn 4** | Khai tử các thư mục trống và tệp không dùng | `entertainment/`, `navigation/`, `PocketHandbook.jsx` | `git status` | Thấp |
| **Giai đoạn 5** | Tách nhỏ `TripPlannerStudio.jsx` (Lập kế hoạch) | `TripPlannerStudio.jsx` | `npm run build` | Cao |
