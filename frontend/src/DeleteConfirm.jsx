import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function DeleteConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🎯 รับค่า id ลูกค้า และชื่อห้องที่ส่งมาจากหน้า DataPage
  const { id, room } = location.state || {};

  const handleYes = async () => {
    try {
      // สั่งลบข้อมูลผ่าน API
      await axios.put(`https://eightmansions-backend.onrender.com/api/customers/${id}/delete/`);
      
      // ลบประวัติ History Log ทิ้งด้วย
      localStorage.removeItem(`history_log_${id}`);
      
      // ลบเสร็จ เด้งไปหน้า Frame 33
      navigate('/admin/delete-success');
    } catch (error) {
      console.error('Delete error:', error);
      alert('ลบข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    }
  };

    const handleNo = () => {
    // กดยกเลิก ให้กลับไปหน้า DataPage แบบเดิม
    navigate('/data'); // 🎯 ลบคำว่า /admin ออกให้ตรงกับ App.jsx ครับ
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] font-sans">
      {/* Navbar เหมือนหน้า DataPage */}
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex items-center justify-between min-h-[60px] flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 sm:gap-6 pl-3 sm:pl-8 py-2 font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] overflow-x-auto whitespace-nowrap">
            <span className="cursor-pointer px-1 sm:px-2" onClick={() => navigate('/admin')}>Home</span>
            <span className="cursor-pointer px-1 sm:px-2" onClick={() => navigate('/admin/data')}>Data</span>
            <span className="cursor-pointer px-1 sm:px-2">Payment</span>
            <span className="cursor-pointer px-1 sm:px-2">Feedback</span>
          </div>
          <div className="flex items-center ml-auto">
            <span onClick={() => navigate('/')} className="mr-3 sm:mr-8 cursor-pointer font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] whitespace-nowrap hover:text-red-700 transition-colors">Log out</span>
            <div className="bg-black min-h-[60px] px-3 sm:px-6 flex items-center justify-center">
              <img src="/logo.png" alt="8 Mansions Logo" className="h-[25px] sm:h-[40px]" />
            </div>
          </div>
        </div>
      </nav>

      {/* Content ยืนยันการลบ (Frame 32) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-12">
          Are you sure you want to delete the room {room} data?
        </h1>
        
        <div className="flex gap-8 md:gap-16">
          <button 
            onClick={handleYes} 
            className="bg-[#92B0C3] hover:bg-[#7a96a8] text-black font-bold text-xl md:text-2xl py-3 px-12 md:px-16 shadow-md transition-transform active:scale-95"
          >
            Yes
          </button>
          
          <button 
            onClick={handleNo} 
            className="bg-[#FF0000] hover:bg-[#cc0000] text-black font-bold text-xl md:text-2xl py-3 px-12 md:px-16 shadow-md transition-transform active:scale-95"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirm;