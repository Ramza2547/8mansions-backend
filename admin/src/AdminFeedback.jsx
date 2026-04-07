import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminFeedback() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [filterMonth, setFilterMonth] = useState(''); 

  useEffect(() => { fetchFeedbacks(); }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get('https://eightmansions-backend.onrender.com/api/feedbacks/');
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

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] font-sans">
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
        {/* 🎯 จัด Flex ให้ตกบรรทัดอัตโนมัติบนมือถือ */}
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

        <div className="flex justify-center mt-8 sm:mt-12 relative group">
          <button disabled className="w-full sm:w-auto bg-gray-300 text-gray-500 py-3 px-16 rounded font-bold shadow-none cursor-not-allowed border border-gray-400">
            Dashboard
          </button>
          <span className="absolute top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs px-3 py-1 rounded shadow-lg text-center w-[200px] left-1/2 -translate-x-1/2">
            Data Visualization Dashboard (Coming Soon)
          </span>
        </div>
      </div>
    </div>
  );
}

export default AdminFeedback;