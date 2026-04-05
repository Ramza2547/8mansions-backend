import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 🎯 อย่าลืม import axios

function AdminFeedback() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [filterMonth, setFilterMonth] = useState(''); 

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // 🎯 ฟังก์ชันดึงข้อมูลจาก Backend
  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get('https://eightmansions-backend.onrender.com/api/feedbacks/');
      // สมมติว่า Backend ส่งกลับมาเป็น Array และเราอยากเรียงอันใหม่สุดขึ้นก่อน
      const sortedData = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setFeedbacks(sortedData);
    } catch (error) {
      console.error("ดึงข้อมูลคอมเมนต์ไม่สำเร็จ", error);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredFeedbacks = feedbacks.filter(fb => {
    if (!filterMonth) return true; 
    
    // 🎯 ใช้ created_at เป็นตัวเทียบวันที่ (ต้องตรงกับชื่อฟิลด์ใน Django)
    const fbDate = new Date(fb.created_at);
    const fbYearMonth = `${fbDate.getFullYear()}-${String(fbDate.getMonth() + 1).padStart(2, '0')}`;
    return fbYearMonth === filterMonth;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] font-sans">
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex items-center justify-between min-h-[60px]">
          <div className="flex items-center gap-6 pl-8 py-2 font-bold text-[#1A1A1A]">
            <span className="cursor-pointer px-2 hover:text-white" onClick={() => navigate('/admin')}>Home</span>
            <span className="cursor-pointer px-2 hover:text-white" onClick={() => navigate('/data')}>Data</span>
            <span className="cursor-pointer px-2 hover:text-white" onClick={() => navigate('/admin/payment')}>Payment</span>
            <span className="cursor-pointer px-2 underline text-gray-900">Feedback</span>
          </div>
          <div className="flex items-center ml-auto">
            <span onClick={() => navigate('/')} className="mr-8 cursor-pointer font-bold hover:text-red-700">Log out</span>
            <div className="bg-black min-h-[60px] px-6 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="h-[40px]" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 p-8 md:p-12 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-[#1A1A1A]">Feedback Center</h1>
          
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-300">
            <label className="font-bold text-gray-700">Filter by Month:</label>
            <input 
              type="month" 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="p-2 border border-gray-300 rounded outline-none cursor-pointer"
            />
            {filterMonth && (
              <button onClick={() => setFilterMonth('')} className="text-sm text-red-500 font-bold">Clear</button>
            )}
          </div>
        </div>

        <div className="mb-4 text-gray-600 font-medium">
          Showing {filteredFeedbacks.length} feedbacks
        </div>

        {filteredFeedbacks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-400">
            <p className="text-gray-400 text-lg">No feedback available. Try sending one from the Tenant side!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeedbacks.map((fb) => (
              <div key={fb.id} className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#8FAFC1] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Room {fb.room}</h3>
                    {/* 🎯 แสดงผลเวลาจาก Backend */}
                    <span className="text-[10px] text-gray-400 font-medium uppercase">{formatDateTime(fb.created_at)}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed italic">"{fb.comment}"</p>
                </div>
                <div className="mt-6 pt-3 border-t border-gray-100 flex justify-between items-center">
                   <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-400">STATUS: NEW</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-12">
          <button onClick={() => navigate('/admin')} className="bg-[#8FAFC1] hover:bg-[#7a96a8] py-3 px-16 rounded font-bold shadow-md transition-transform active:scale-95">
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminFeedback;