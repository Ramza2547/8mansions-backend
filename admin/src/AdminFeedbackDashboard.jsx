import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function AdminFeedbackDashboard() {
  const navigate = useNavigate();
  const [allFeedbacks, setAllFeedbacks] = useState([]); // 🎯 เก็บข้อมูลทั้งหมด
  const [filterMonth, setFilterMonth] = useState(''); // 🎯 เก็บค่า Dropdown เดือน/ปี ที่เลือก
  const [chartData, setChartData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const COLORS = {
    'Positive': '#2ECC71',
    'Negative': '#E74C3C',
    'Neutral': '#95A5A6',
    'Repair': '#E67E22'
  };

  // 1. ดึงข้อมูลทั้งหมดมาเก็บไว้ก่อน (ทำแค่รอบเดียวตอนเปิดหน้า)
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get('https://eightmansions-backend-1.onrender.com/api/feedbacks/');
        setAllFeedbacks(response.data);
        if (response.data.length === 0) setIsAnalyzing(false);
      } catch (error) {
        console.error("Fetch Error:", error);
        setIsAnalyzing(false);
      }
    };
    fetchFeedbacks();
  }, []);

  // 2. วิเคราะห์ AI ใหม่ทุกครั้งที่เปลี่ยน Dropdown
  useEffect(() => {
    const analyzeData = async () => {
      if (allFeedbacks.length === 0) return;
      setIsAnalyzing(true);

      // 🎯 กรองข้อมูลตามเดือนที่เลือกจาก Dropdown
      const filtered = allFeedbacks.filter(fb => {
        if (!filterMonth) return true;
        const fbDate = new Date(fb.created_at);
        return `${fbDate.getFullYear()}-${String(fbDate.getMonth() + 1).padStart(2, '0')}` === filterMonth;
      });

      if (filtered.length === 0) {
        setChartData(null);
        setIsAnalyzing(false);
        return;
      }

      let counts = { Positive: 0, Negative: 0, Neutral: 0, Repair: 0 };

      try {
        const analysisPromises = filtered.map(fb =>
          axios.post('https://eightmansions-backend-1.onrender.com/api/sentiment/', { text: fb.comment })
        );
        const results = await Promise.all(analysisPromises);
        
        results.forEach(res => {
          const sentimentStr = res.data.sentiment;
          if (sentimentStr.includes('เชิงบวก')) counts.Positive++;
          else if (sentimentStr.includes('เชิงลบ')) counts.Negative++;
          else if (sentimentStr.includes('แจ้งซ่อม')) counts.Repair++;
          else counts.Neutral++;
        });

        const finalLabels = [];
        const finalValues = [];
        const finalColors = [];

        ['Positive', 'Negative', 'Neutral', 'Repair'].forEach(key => {
          if (counts[key] > 0) {
            finalLabels.push(key);
            finalValues.push(counts[key]);
            finalColors.push(COLORS[key]);
          }
        });

        setChartData({
          labels: finalLabels,
          datasets: [{
            data: finalValues,
            backgroundColor: finalColors,
            borderColor: '#ffffff',
            borderWidth: 2,
          }],
        });
      } catch (error) {
        console.error("Dashboard Analysis Error:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    if (allFeedbacks.length > 0) {
      analyzeData();
    }
  }, [allFeedbacks, filterMonth]); // 🎯 ถ้ารายชื่อเต็ม หรือตัวเลือก Dropdown เปลี่ยน ให้ทำงานฟังก์ชันนี้ใหม่

  // ฟังก์ชันสร้างตัวเลือกเดือนใน Dropdown
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

  // นับจำนวนรีวิวที่ถูกกรองแล้ว
  const filteredLength = allFeedbacks.filter(fb => {
    if (!filterMonth) return true;
    const fbDate = new Date(fb.created_at);
    return `${fbDate.getFullYear()}-${String(fbDate.getMonth() + 1).padStart(2, '0')}` === filterMonth;
  }).length;

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] font-sans">
      
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex items-center justify-between min-h-[60px] flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 sm:gap-6 pl-3 sm:pl-8 py-2 font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] overflow-x-auto whitespace-nowrap">
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/admin')}>Home</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/data')}>Data</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/admin/payment')}>Payment</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/admin/feedback')}>Feedback</span>
          </div>
          <div className="flex items-center ml-auto">
            <span onClick={() => navigate('/')} className="mr-3 sm:mr-8 cursor-pointer font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] whitespace-nowrap hover:text-red-700">Log out</span>
            <div className="bg-black min-h-[60px] px-3 sm:px-6 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="h-[25px] sm:h-[40px]" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8">
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl w-full max-w-4xl text-center">
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4 gap-4">
             <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">Sentiment Overview</h2>
             
             <div className="flex items-center gap-4">
                {/* 🎯 Dropdown เลือกเดือน/ปี */}
                <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg p-1 shadow-sm">
                  <span className="text-sm font-bold text-gray-600 px-3">Filter:</span>
                  <select 
                    value={filterMonth} 
                    onChange={(e) => setFilterMonth(e.target.value)} 
                    className="p-2 bg-transparent text-gray-800 font-bold outline-none cursor-pointer"
                  >
                    <option value="">-- All-Time --</option>
                    {generateMonthOptions().map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <button onClick={() => navigate('/admin/feedback')} className="text-gray-500 hover:text-white hover:bg-[#8FAFC1] font-bold px-4 py-2 bg-gray-100 rounded-lg transition-colors">
                  Back
                </button>
             </div>
          </div>
          
          <p className="text-gray-500 mb-8 font-medium">
            {filterMonth ? `Data for ${filterMonth}` : 'All-time Data'} ({filteredLength} Feedbacks)
          </p>

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-[#8FAFC1] border-t-black rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-bold animate-pulse text-lg">AI is analyzing {filterMonth ? 'filtered' : 'all'} data...</p>
            </div>
          ) : chartData ? (
            <div className="w-full flex justify-center h-[350px] sm:h-[450px]">
              <Pie 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 14, weight: 'bold' } } },
                    tooltip: { titleFont: { size: 16 }, bodyFont: { size: 14 } }
                  }
                }} 
              />
            </div>
          ) : (
            <p className="text-red-500 py-20 font-bold text-xl">No sentiment data for this month.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminFeedbackDashboard;