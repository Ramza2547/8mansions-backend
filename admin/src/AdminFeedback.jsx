import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// 🎯 Import เครื่องมือวาดกราฟจาก recharts
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function AdminFeedback() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [filterMonth, setFilterMonth] = useState(''); 
  
  // 🎯 State สำหรับระบบ Dashboard & Sentiment
  const [showDashboard, setShowDashboard] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // กำหนดสีกราฟตามอารมณ์
  const COLORS = {
    'Positive': '#2ECC71', // เขียว
    'Negative': '#E74C3C', // แดง
    'Neutral': '#95A5A6',  // เทา
    'Repair': '#E67E22'    // ส้ม (แจ้งซ่อม)
  };

  useEffect(() => { fetchFeedbacks(); }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get('https://eightmansions-backend-1.onrender.com/api/feedbacks/');
      setFeedbacks(response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) { console.error("ดึงข้อมูลคอมเมนต์ไม่สำเร็จ", error); }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const generateMonthOptions = () => {
    const options = [];
    let current = new Date(2021, 0);
    const currentDate = new Date();
    while (current <= currentDate) {
      options.push({
        value: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
        label: `${current.toLocaleString('en-US', { month: 'short' })} ${current.getFullYear()}`
      });
      current.setMonth(current.getMonth() + 1);
    }
    return options.reverse(); 
  };

  const filteredFeedbacks = feedbacks.filter(fb => {
    if (!filterMonth) return true; 
    const fbDate = new Date(fb.created_at);
    return `${fbDate.getFullYear()}-${String(fbDate.getMonth() + 1).padStart(2, '0')}` === filterMonth;
  });

  // 🎯 ฟังก์ชันวิเคราะห์ Sentiment เมื่อกดปุ่ม Dashboard
  const handleOpenDashboard = async () => {
    if (filteredFeedbacks.length === 0) return;
    setIsAnalyzing(true);
    setShowDashboard(true);

    let counts = { Positive: 0, Negative: 0, Neutral: 0, Repair: 0 };

    try {
      // ส่งข้อความไปให้ AI หลังบ้านวิเคราะห์ทีละอันพร้อมๆ กัน
      const analysisPromises = filteredFeedbacks.map(fb => 
        axios.post('https://eightmansions-backend-1.onrender.com/api/sentiment/', { text: fb.comment })
      );
      
      const results = await Promise.all(analysisPromises);
      
      // นับผลลัพธ์ที่ได้
      results.forEach(res => {
        const sentimentStr = res.data.sentiment;
        if (sentimentStr.includes('เชิงบวก')) counts.Positive++;
        else if (sentimentStr.includes('เชิงลบ')) counts.Negative++;
        else if (sentimentStr.includes('แจ้งซ่อม')) counts.Repair++;
        else counts.Neutral++;
      });

      // จัดฟอร์แมตข้อมูลเตรียมป้อนให้ Pie Chart
      const finalChartData = [
        { name: 'Positive', value: counts.Positive },
        { name: 'Negative', value: counts.Negative },
        { name: 'Neutral', value: counts.Neutral },
        { name: 'Repair', value: counts.Repair }
      ].filter(item => item.value > 0); // โชว์เฉพาะอันที่มีค่ามากกว่า 0

      setChartData(finalChartData);
    } catch (error) {
      console.error("วิเคราะห์ Sentiment ผิดพลาด:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] font-sans relative">
      
      {/* 🎯 Popup Dashboard Modal */}
      {showDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl relative flex flex-col items-center">
            <button 
              onClick={() => setShowDashboard(false)} 
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 font-bold text-xl"
            >
              ✕
            </button>
            <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-2">Sentiment Analysis Report</h2>
            <p className="text-gray-500 mb-6 font-medium">
              {filterMonth ? `Data for ${filterMonth}` : 'All-time Data'} ({filteredFeedbacks.length} Feedbacks)
            </p>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-12 h-12 border-4 border-[#8FAFC1] border-t-black rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-bold animate-pulse">AI is analyzing feedbacks...</p>
              </div>
            ) : chartData.length > 0 ? (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-red-500 py-10">Unable to generate chart data.</p>
            )}
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex items-center justify-between min-h-[60px] flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 sm:gap-6 pl-3 sm:pl-8 py-2 font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] overflow-x-auto whitespace-nowrap">
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/admin')}>Home</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/data')}>Data</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/admin/payment')}>Payment</span>
            <span className="cursor-pointer px-1 sm:px-2 underline text-gray-900">Feedback</span>
          </div>
          <div className="flex items-center ml-auto">
            <span onClick={() => navigate('/')} className="mr-3 sm:mr-8 cursor-pointer font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] whitespace-nowrap hover:text-red-700">Log out</span>
            <div className="bg-black min-h-[60px] px-3 sm:px-6 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="h-[25px] sm:h-[40px]" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 p-4 sm:p-8 md:p-12 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">Feedback Center</h1>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-300 w-full sm:w-auto">
            <label className="font-bold text-gray-700 text-sm sm:text-base">Filter by Month:</label>
            <select 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="p-2 border border-gray-300 rounded outline-none cursor-pointer bg-white text-gray-800 font-medium flex-1 sm:flex-none min-w-[140px] text-sm sm:text-base"
            >
              <option value="">-- All Months --</option>
              {generateMonthOptions().map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            {filterMonth && <button onClick={() => setFilterMonth('')} className="text-sm text-red-500 font-bold ml-2">Clear</button>}
          </div>
        </div>

        <div className="mb-4 text-gray-600 font-medium text-sm sm:text-base">
          Showing {filteredFeedbacks.length} feedbacks
        </div>

        {filteredFeedbacks.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-400 mx-2 sm:mx-0">
            <p className="text-gray-400 text-base sm:text-lg">No feedback available for this month.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredFeedbacks.map((fb) => (
              <div key={fb.id} className="bg-white p-5 sm:p-6 rounded-xl shadow-md border-t-4 border-[#8FAFC1] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b pb-2 sm:pb-3 mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">Room {fb.room}</h3>
                    <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium uppercase">{formatDateTime(fb.created_at)}</span>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed italic">"{fb.comment}"</p>
                </div>
                <div className="mt-4 sm:mt-6 pt-2 sm:pt-3 border-t border-gray-100 flex justify-between items-center">
                   <span className="text-[9px] sm:text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-400 font-semibold">STATUS: NEW</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🎯 ปลดล็อคปุ่ม Dashboard ตรงนี้ */}
        <div className="flex justify-center mt-8 sm:mt-12 relative group">
          <button 
            onClick={handleOpenDashboard}
            disabled={filteredFeedbacks.length === 0}
            className={`w-full sm:w-auto py-3 px-16 rounded font-bold transition-all shadow-md 
              ${filteredFeedbacks.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-400' 
                : 'bg-[#1A1A1A] hover:bg-gray-800 text-white active:scale-95'}`}
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminFeedback;