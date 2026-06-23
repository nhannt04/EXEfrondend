import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { useLanguage } from '../../../context/LanguageContext';
import axiosClient from '../../../services/axiosClient';
import { Loader2, Users, Map, BookOpen, Activity, Target, PieChart, TrendingUp, Compass, Coffee, Utensils, Home, PlayCircle } from 'lucide-react';

export default function AnalyticsDashboard() {
  const { language } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axiosClient.get('/analytics/dashboard');
        if (response && response.success) {
          setData(response.data);
        }
      } catch (e) {
        console.error("Failed to load analytics dashboard", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50/50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">Đang tải dữ liệu phân tích...</p>
        </div>
      </div>
    );
  }

  if (!data) return (
    <div className="flex justify-center items-center h-96 text-red-500 font-medium bg-red-50 rounded-xl m-6">
      Không thể tải dữ liệu phân tích. Vui lòng kiểm tra lại kết nối.
    </div>
  );

  // Calculate summary metrics
  const totalUsers = data.pieChart?.series?.reduce((a, b) => a + b, 0) || 0;
  const totalSpots = data.donutChart?.series?.reduce((a, b) => a + b, 0) || 0;
  const totalDiaries = data.columnChart?.series?.reduce((a, b) => a + b, 0) || 0;
  const totalItineraries = data.barChart?.series?.reduce((a, b) => a + b, 0) || 0;

  const chartOptions = {
    chart: { toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { labels: { style: { colors: '#6B7280', fontSize: '12px' } } },
    yaxis: { labels: { style: { colors: '#6B7280', fontSize: '12px' } } },
    grid: { borderColor: '#F3F4F6', strokeDashArray: 4 },
    theme: { mode: 'light' },
    tooltip: { theme: 'light', x: { show: true } }
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: Activity },
    { id: 'user', label: 'Người dùng', icon: Users },
    { id: 'dish', label: 'Món ăn', icon: Utensils },
    { id: 'cafe', label: 'Cafe', icon: Coffee },
    { id: 'entertainment', label: 'Vui chơi', icon: PlayCircle },
    { id: 'stay', label: 'Nghỉ dưỡng', icon: Home }
  ];

  const generateDescription = (dataSeries, labels, categoryName) => {
    if (!dataSeries || dataSeries.length === 0) return "Chưa có đủ dữ liệu để thống kê.";
    const total = dataSeries.reduce((a,b)=>a+b, 0);
    const maxVal = Math.max(...dataSeries);
    const maxIdx = dataSeries.indexOf(maxVal);
    const peakMonth = labels ? labels[maxIdx] : "";
    
    let text = `Trong 12 tháng qua, tổng khối lượng liên quan đến ${categoryName} đạt ${total.toLocaleString()} lượt. `;
    if (total > 0 && maxVal > 0) {
        text += `Giai đoạn hoạt động sôi nổi nhất là ${peakMonth} với ${maxVal.toLocaleString()} lượt được ghi nhận. `;
        if (dataSeries.length >= 2) {
            const lastMonth = dataSeries[dataSeries.length - 1];
            const prevMonth = dataSeries[dataSeries.length - 2];
            if (prevMonth > 0) {
                const growth = Math.round(((lastMonth - prevMonth) / prevMonth) * 100);
                if (growth > 0) {
                    text += `Đặc biệt, so với tháng trước đó, chỉ số đang có sự tăng trưởng mạnh mẽ khoảng ${growth}%.`;
                } else if (growth < 0) {
                    text += `Tuy nhiên, so với tháng trước đó, chỉ số đã có phần sụt giảm ${Math.abs(growth)}%. Cần có chiến lược thúc đẩy phù hợp.`;
                } else {
                    text += `Hiện tại chỉ số đang duy trì mức độ ổn định so với tháng trước đó.`;
                }
            }
        }
    }
    return text;
  };

  const StatCard = ({ icon: Icon, title, value, colorClass, bgClass }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${bgClass} ${colorClass}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
        <h4 className="text-3xl font-bold text-gray-800">{value.toLocaleString()}</h4>
      </div>
    </div>
  );

  const ChartCard = ({ title, description, children }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="mb-4">
        <h3 className="font-bold text-gray-800 text-lg leading-tight">{title}</h3>
        {description && <p className="text-xs text-gray-500 mt-1.5">{description}</p>}
      </div>
      <div className="flex-grow flex items-center justify-center w-full">
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );

  const renderCategoryTab = (categoryId, categoryName) => {
    const stats = data.categoryStats?.[categoryId];
    if (!stats || !stats.series) return <div className="text-gray-500 mt-8 text-center bg-white p-8 rounded-xl border border-gray-100">Chưa có dữ liệu thống kê cho hạng mục này.</div>;
    
    const descText = generateDescription(stats.series, stats.labels, categoryName);

    return (
      <div className="space-y-6 mt-6 animate-in fade-in duration-500">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" /> Phân Tích Chuyên Sâu: {categoryName}
          </h3>
          <p className="text-blue-800 text-base leading-relaxed">{descText}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title={`Tăng trưởng ${categoryName} (Biểu đồ Đường)`} description={`Sự thay đổi của ${categoryName} qua các tháng`}>
            <Chart options={{...chartOptions, xaxis: {categories: stats.labels}}} series={[{name: categoryName, data: stats.series}]} type="line" height={350} />
          </ChartCard>
          
          <ChartCard title={`Phân bổ ${categoryName} (Biểu đồ Cột)`} description={`So sánh khối lượng ${categoryName} giữa các tháng trong năm`}>
            <Chart options={{...chartOptions, plotOptions: {bar: {borderRadius: 6, columnWidth: '45%'}}, xaxis: {categories: stats.labels}}} series={[{name: categoryName, data: stats.series}]} type="bar" height={350} />
          </ChartCard>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-8 mt-6 animate-in fade-in duration-500">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} title="Tổng Số Tài Khoản" value={totalUsers} colorClass="text-blue-600" bgClass="bg-blue-100" />
        <StatCard icon={Map} title="Tổng Số Điểm Đến" value={totalSpots} colorClass="text-emerald-600" bgClass="bg-emerald-100" />
        <StatCard icon={Compass} title="Lịch Trình Đã Tạo" value={totalItineraries} colorClass="text-amber-600" bgClass="bg-amber-100" />
        <StatCard icon={BookOpen} title="Bài Đăng Nhật Ký" value={totalDiaries} colorClass="text-purple-600" bgClass="bg-purple-100" />
      </div>

      {/* SECTION 1: Tổng quan & Mục tiêu */}
      <section className="pt-4">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
          <Target className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Tổng Quan & Mục Tiêu Hệ Thống</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ChartCard title="Mục tiêu Bài Đăng" description="Tiến độ đạt mốc KPI bài đăng tháng">
            <Chart options={{...chartOptions, plotOptions: {radialBar: {hollow: {size: '65%'}, track: {background: '#F3F4F6'}, dataLabels: {value: {color: '#374151', fontSize: '24px'}}}}}} series={[data.progressBar || 0]} type="radialBar" height={280} />
          </ChartCard>
          
          <ChartCard title="Tỉ lệ User Có Lịch Trình" description="Tỉ lệ người dùng đã sử dụng AI Trip Planner">
            <Chart options={{...chartOptions, colors: ['#10B981'], plotOptions: {radialBar: {startAngle: -135, endAngle: 135, hollow: {size: '65%'}, dataLabels: {name: {show: false}, value: {fontSize: '30px', color: '#111827'}}}}}} series={[data.gaugeChart || 0]} type="radialBar" height={280} />
          </ChartCard>
          
          <ChartCard title="Mở Rộng Dữ Liệu" description="Tích lũy địa điểm vào hệ thống qua từng giai đoạn">
            <Chart options={{...chartOptions, colors: ['#8B5CF6'], fill: {type: 'gradient', gradient: {shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.9, stops: [0, 90, 100]}}, stroke: {curve: 'stepline'}}} series={[{name: 'Total Spots', data: data.burnupChart || []}]} type="area" height={250} />
          </ChartCard>

          <ChartCard title="Tỉ lệ Người Dùng Mới" description="Lượng tài khoản Guest chưa đăng ký tài khoản">
            <Chart options={{...chartOptions, colors: ['#EF4444'], stroke: {curve: 'straight'}}} series={[{name: 'Remaining Guests', data: data.burndownChart || []}]} type="line" height={250} />
          </ChartCard>
        </div>
      </section>

      {/* SECTION 2: Hành vi Người dùng & Lưu lượng */}
      <section className="pt-4">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Hành Vi Người Dùng & Truy Cập</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartCard title="Lưu lượng Truy cập Tổng quan" description="Thống kê lượng người dùng truy cập web theo thời gian">
              <Chart options={{...chartOptions, fill: {type: 'gradient'}, xaxis: {categories: data.areaChart?.labels || []}}} series={[{name: 'Page Views', data: data.areaChart?.series || []}]} type="area" height={320} />
            </ChartCard>
          </div>
          <ChartCard title="Nguồn Đăng Ký" description="Tỉ lệ người dùng sử dụng Google vs Email">
            <Chart options={{...chartOptions, labels: data.pieChart?.labels || [], legend: {position: 'bottom'}}} series={data.pieChart?.series || []} type="pie" height={320} />
          </ChartCard>

          <div className="lg:col-span-2">
            <ChartCard title="Hoạt động Theo Giờ (Heatmap)" description="Khung giờ người dùng hoạt động mạnh nhất trên hệ thống">
              <Chart options={{...chartOptions, plotOptions: {heatmap: {colorScale: {ranges: [{from: 0, to: 10, color: '#DBEAFE', name: 'Low'}, {from: 11, to: 50, color: '#3B82F6', name: 'Medium'}, {from: 51, to: 1000, color: '#1E3A8A', name: 'High'}]}}}}} series={data.heatmap || []} type="heatmap" height={300} />
            </ChartCard>
          </div>
          <ChartCard title="Tăng trưởng Người Dùng" description="Lượng tài khoản đăng ký mới theo tháng">
            <Chart options={{...chartOptions, markers: {size: 4}, xaxis: {categories: data.lineChart?.labels || []}}} series={[{name: 'New Users', data: data.lineChart?.series || []}]} type="line" height={300} />
          </ChartCard>
        </div>
      </section>

      {/* SECTION 3: Phân tích Lịch trình AI */}
      <section className="pt-4">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
          <Compass className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Phân Tích Khởi Tạo Lịch Trình (AI Planner)</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Lịch Trình Theo Tháng" description="Số lượng lịch trình được khởi tạo bởi AI qua các tháng">
            <Chart options={{...chartOptions, plotOptions: {bar: {borderRadius: 4, horizontal: true}}, xaxis: {categories: data.barChart?.labels || []}}} series={[{name: 'Itineraries', data: data.barChart?.series || []}]} type="bar" height={300} />
          </ChartCard>
          
          <ChartCard title="Tương quan Ngân Sách và Số Ngày" description="Phân bổ ngân sách dự kiến của du khách theo độ dài chuyến đi">
            <Chart options={{...chartOptions, markers: {size: 6}, xaxis: {type: 'numeric', title: {text: 'Số ngày'}}, yaxis: {title: {text: 'Ngân sách (VNĐ)'}}}} series={[{name: 'Lịch trình', data: data.scatterPlot || []}]} type="scatter" height={300} />
          </ChartCard>
          
          <ChartCard title="Phân bổ Các Loại Hình Lựa Chọn" description="Thống kê các danh mục được người dùng chọn nhiều nhất khi lên lịch">
            <Chart options={{...chartOptions, plotOptions: {bar: {horizontal: false, columnWidth: '55%', endingShape: 'rounded'}}, xaxis: {categories: data.groupedBarChart?.categories || []}}} series={data.groupedBarChart?.series || []} type="bar" height={320} />
          </ChartCard>
          
          <ChartCard title="Đánh Giá Ngân Sách Thực Tế (Bullet Chart)" description="Ngân sách người dùng đặt ra so với các mốc tiêu chuẩn">
            <Chart options={{...chartOptions, plotOptions: {bar: {horizontal: true, barHeight: '50%'}}, colors: ['#3B82F6']}} series={[{name: 'Trung bình', data: [data.bulletChart?.measures?.[0] || 0]}]} type="bar" height={320} />
          </ChartCard>
        </div>
      </section>

      {/* SECTION 4: Điểm Đến & Cộng Đồng */}
      <section className="pt-4 pb-8">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
          <PieChart className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Điểm Đến & Sinh Hoạt Cộng Đồng</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Cấu Trúc Kho Dữ Liệu" description="Tỉ trọng các loại hình điểm đến trong hệ thống">
            <Chart options={{...chartOptions, labels: data.donutChart?.labels || [], legend: {position: 'right'}}} series={data.donutChart?.series || []} type="donut" height={320} />
          </ChartCard>

          <ChartCard title="Độ Phổ Biến Theo Tags (Treemap)" description="Những từ khóa (Tags) điểm đến được gắn nhiều nhất">
            <Chart options={{...chartOptions, colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']}} series={[{data: data.treemap || []}]} type="treemap" height={320} />
          </ChartCard>

          <ChartCard title="Hoạt Động Cộng Đồng" description="Số lượng bài viết nhật ký được chia sẻ theo thời gian">
            <Chart options={{...chartOptions, plotOptions: {bar: {borderRadius: 6, columnWidth: '40%'}}, xaxis: {categories: data.columnChart?.labels || []}}} series={[{name: 'Diaries', data: data.columnChart?.series || []}]} type="bar" height={300} />
          </ChartCard>

          <ChartCard title="Chủ Đề Nhật Ký Phổ Biến" description="Phân loại nội dung người dùng chia sẻ trên cộng đồng">
            <Chart options={{...chartOptions, chart: {stacked: true}, xaxis: {categories: data.stackedChart?.labels || []}}} series={data.stackedChart?.series || []} type="bar" height={300} />
          </ChartCard>
        </div>
      </section>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Công cụ theo dõi</h1>
            <p className="text-gray-500 mt-2">Bảng điều khiển phân tích số liệu hệ thống theo từng hạng mục.</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Dữ liệu được cập nhật trực tiếp từ hệ thống
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all border-b-2 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-blue-600' 
                    : 'text-gray-500 border-transparent hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Rendering */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab !== 'overview' && renderCategoryTab(activeTab, tabs.find(t => t.id === activeTab)?.label || '')}

      </div>
    </div>
  );
}
