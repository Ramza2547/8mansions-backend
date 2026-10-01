import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminFeedback() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  
  const [filterMonth, setFilterMonth] = useState(''); 
  const [filterStatus, setFilterStatus] = useState(''); 
  // 🎯 State ตัวใหม่ สำหรับกรองห้องพัก
  const [filterRoom, setFilterRoom] = useState(''); 
  
  const [cardStatuses, setCardStatuses] = useState({}); 

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [countdown, setCountdown] = useState(60);
  const [statusMessage, setStatusMessage] = useState('กำลังเชื่อมต่อฐานข้อมูลคอมเมนต์...');
  const retryCount = useRef(0);

  // 🎯 รายชื่อห้องพักทั้งหมดที่มีในระบบ
  const roomNames = ['A1', 'B1', 'C1', 'D1', 'A2', 'B2', 'C2', 'D2'];

  useEffect(() => { 
    fetchFeedbacks(); 

    return () => {
      if (window.feedbackInterval) clearInterval(window.feedbackInterval);
      if (window.feedbackCountdown) clearInterval(window.feedbackCountdown);
    };
  }, []);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    setLoadProgress(0);
    setCountdown(60);
    setStatusMessage(retryCount.current > 0 ? `กำลังลองเชื่อมต่อใหม่รอบที่ ${retryCount.current}...` : 'กำลังเตรียมข้อมูล Feedback...');

    window.feedbackInterval = setInterval(() => {
      setLoadProgress((prev) => (prev < 90 ? prev + Math.floor(Math.random() * 5) + 2 : prev));
    }, 1000);

    window.feedbackCountdown = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    try {
      const response = await axios.get('https://eightmansions-backend-1.onrender.com/api/feedbacks/', { timeout: 60000 });
      
      const sortedData = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setFeedbacks(sortedData);

      setStatusMessage('กำลังวิเคราะห์ Sentiment ของข้อความ...');

      const statuses = {};
      const promises = sortedData.map(async (fb) => {
        try {
           const res = await axios.post('https://eightmansions-backend-1.onrender.com/api/sentiment/', { text: fb.comment });
           let label = "NEUTRAL";
           let color = "bg-gray-100 text-gray-600"; 

           if (res.data.sentiment.includes('เชิงบวก')) { label = "POSITIVE"; color = "bg-green-100 text-green-700"; }
           else if (res.data.sentiment.includes('เชิงลบ')) { label = "NEGATIVE"; color = "bg-red-100 text-red-700"; }
           else if (res.data.sentiment.includes('แจ้งซ่อม')) { label = "REPAIR"; color = "bg-orange-100 text-orange-700"; }

           statuses[fb.id] = { label, color };
        } catch(e) {
           statuses[fb.id] = { label: "ERROR", color: "bg-red-100 text-red-700" };
        }
      });
      await Promise.all(promises);
      setCardStatuses(statuses); 

      clearInterval(window.feedbackInterval);
      clearInterval(window.feedbackCountdown);
      setLoadProgress(100);
      setStatusMessage('โหลดข้อมูลสำเร็จ!');
      
      setTimeout(() => setIsLoading(false), 800);
      retryCount.current = 0;

    } catch (error) { 
      console.error("ดึงข้อมูลคอมเมนต์ไม่สำเร็จ", error); 
      
      clearInterval(window.feedbackInterval);
      clearInterval(window.feedbackCountdown);
      
      setStatusMessage('เซิร์ฟเวอร์ยังไม่ตอบสนอง... กำลังเริ่มดึงข้อมูลใหม่');
      retryCount.current += 1;
      
      setTimeout(() => fetchFeedbacks(), 3000);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const generateMonthOptions = () => {
    const options = [];
    let current = new Date(2026, 0); 
    const currentDate = new Date();
    while (current <= currentDate) {
      options.push({ value: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`, label: `${current.toLocaleString('en-US', { month: 'short' })} ${current.getFullYear()}` });
      current.setMonth(current.getMonth() + 1);
    }
    return options.reverse(); 
  };

  // 🎯 ลอจิกการกรอง (รวม Month, Status และ Room)
  const filteredFeedbacks = feedbacks.filter(fb => {
    let monthMatch = true;
    if (filterMonth) {
      const fbDate = new Date(fb.created_at);
      monthMatch = `${fbDate.getFullYear()}-${String(fbDate.getMonth() + 1).padStart(2, '0')}` === filterMonth;
    }

    let statusMatch = true;
    if (filterStatus) {
      const statusObj = cardStatuses[fb.id];
      if (!statusObj) {
        statusMatch = false; 
      } else {
        statusMatch = statusObj.label === filterStatus;
      }
    }

    let roomMatch = true;
    if (filterRoom) {
      roomMatch = String(fb.room).toUpperCase().trim() === filterRoom;
    }

    return monthMatch && statusMatch && roomMatch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] font-sans relative">
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

      <div className="flex-1 p-4 sm:p-8 md:p-12 max-w-7xl mx-auto w-full relative">
        
        {isLoading && (
          <div className="absolute inset-0 bg-[#EAEAEA]/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center py-20 rounded-lg">
            <div className="w-16 h-16 border-4 border-[#8FAFC1] border-t-[#2C3E50] rounded-full animate-spin mb-4 shadow-lg"></div>
            <h3 className="text-xl font-extrabold text-[#2C3E50] mb-2 text-center px-4">{statusMessage}</h3>
            
            <div className="w-64 bg-gray-300 rounded-full h-2.5 my-3">
              <div 
                className="bg-[#2C3E50] h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${loadProgress}%` }}
              ></div>
            </div>
            
            <p className="text-[#1A1A1A] font-bold text-sm font-mono mt-1">
              ใช้เวลาประมาณ: <span className="text-red-600">{countdown}</span> วินาที
            </p>
            <p className="text-gray-500 font-medium text-center px-4 text-[11px] mt-4">
              (ระบบจะพยายามดึงข้อมูลและวิเคราะห์ Sentiment ใหม่อัตโนมัติ โดยไม่ต้องรีเฟรชหน้าเว็บ)
            </p>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] whitespace-nowrap">Feedback Center</h1>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-300 w-full md:w-auto">
            
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <label className="font-bold text-gray-700 text-sm sm:text-base hidden sm:block">Month:</label>
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} disabled={isLoading} className="p-2 border border-gray-300 rounded outline-none cursor-pointer bg-white text-gray-800 font-medium w-full sm:w-auto min-w-[130px] text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed">
                <option value="">-- All Months --</option>
                {generateMonthOptions().map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <label className="font-bold text-gray-700 text-sm sm:text-base hidden sm:block ml-1">Status:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} disabled={isLoading} className="p-2 border border-gray-300 rounded outline-none cursor-pointer bg-white text-gray-800 font-medium w-full sm:w-auto min-w-[130px] text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed">
                <option value="">-- All Types --</option>
                <option value="POSITIVE">Positive</option>
                <option value="NEGATIVE">Negative</option>
                <option value="REPAIR">Repair</option>
                <option value="NEUTRAL">Neutral</option>
              </select>
            </div>

            {/* 🎯 ตัวกรองห้องพัก (Room Filter) */}
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <label className="font-bold text-gray-700 text-sm sm:text-base hidden sm:block ml-1">Room:</label>
              <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} disabled={isLoading} className="p-2 border border-gray-300 rounded outline-none cursor-pointer bg-white text-gray-800 font-medium w-full sm:w-auto min-w-[110px] text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed">
                <option value="">-- All Rooms --</option>
                {roomNames.map((room) => <option key={room} value={room}>Room {room}</option>)}
              </select>
            </div>

            {/* 🎯 อัปเดตปุ่ม Clear ให้ล้างค่า Filter Room ด้วย */}
            {(filterMonth || filterStatus || filterRoom) && (
              <button onClick={() => { setFilterMonth(''); setFilterStatus(''); setFilterRoom(''); }} disabled={isLoading} className="text-sm text-red-500 font-bold px-2 py-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="mb-4 text-gray-600 font-medium text-sm sm:text-base">
          Showing {isLoading ? '0' : filteredFeedbacks.length} feedbacks
        </div>

        {!isLoading && filteredFeedbacks.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-400 mx-2 sm:mx-0">
            <p className="text-gray-400 text-base sm:text-lg">No feedback available for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-h-[300px]">
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
                   <span className={`text-[9px] sm:text-[10px] px-2 py-1 rounded font-extrabold tracking-wider ${cardStatuses[fb.id]?.color || 'bg-gray-100 text-gray-400'}`}>
                      STATUS: {cardStatuses[fb.id] ? cardStatuses[fb.id].label : 'ANALYZING...'}
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-8 sm:mt-12">
          <button 
            onClick={() => navigate('/admin/feedback/dashboard')}
            disabled={isLoading || feedbacks.length === 0}
            className={`w-full sm:w-auto py-3 px-16 rounded font-bold transition-all shadow-md 
              ${(isLoading || feedbacks.length === 0) ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-400' : 'bg-[#1A1A1A] hover:bg-gray-800 text-white active:scale-95'}`}
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminFeedback;