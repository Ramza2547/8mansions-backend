import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function GuestBooking() {
  const navigate = useNavigate();
  
  // 🎯 ตัวแปรตรงกับ Django Backend เป๊ะๆ 100%
  const [formData, setFormData] = useState({
    name: '',
    nationality: '',
    date_of_birth: '', 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      await axios.post('https://eightmansions-backend.onrender.com/api/customers/', formData);
      alert('Registration Successful! ลงทะเบียนข้อมูลสำเร็จ 🎉');
      navigate('/'); 
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F0] font-sans">
      
      {/* 🟢 Navbar Section */}
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex justify-between items-stretch w-full min-h-[80px]">
          <div className="flex gap-6 sm:gap-10 items-center px-[5%]">
            <span onClick={() => navigate('/')} className="cursor-pointer text-[16px] sm:text-[18px] font-medium text-black hover:underline underline-offset-4 decoration-2">Home</span>
            <span className="cursor-pointer text-[16px] sm:text-[18px] font-medium text-black underline underline-offset-4 decoration-2">Booking</span>
            <span className="cursor-pointer text-[16px] sm:text-[18px] font-medium text-black hover:underline underline-offset-4 decoration-2">Comment</span>
          </div>
          <div className="bg-black px-4 sm:px-[30px] flex items-center justify-center">
            <img src="/logo.png" alt="8 Mansions Logo" className="h-[50px] sm:h-[70px] w-auto block object-contain" />
          </div>
        </div>
      </nav>

      {/* 🔵 พื้นที่ฟอร์มลงทะเบียน */}
      <div className="flex-1 flex justify-center items-center p-6">
        <div className="bg-white p-8 md:p-10 rounded-lg shadow-xl w-full max-w-lg">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#1A1A1A]">Customer Registration</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* ช่องกรอก Name */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">Name (ชื่อ-นามสกุล)</label>
              <input 
                type="text" name="name" required
                value={formData.name} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#92B0C3] focus:ring-2 focus:ring-[#92B0C3] transition-all"
                placeholder="Enter your full name"
              />
            </div>

            {/* ช่องกรอก Nationality */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">Nationality (สัญชาติ)</label>
              <input 
                type="text" name="nationality" required
                value={formData.nationality} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#92B0C3] focus:ring-2 focus:ring-[#92B0C3] transition-all"
                placeholder="e.g. Thai, American, Japanese"
              />
            </div>

            {/* ช่องกรอก Date of Birth */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">Date of Birth (วันเกิด)</label>
              <input 
                type="date" name="date_of_birth" required
                value={formData.date_of_birth} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#92B0C3] focus:ring-2 focus:ring-[#92B0C3] transition-all"
              />
            </div>

            <button 
              type="submit" 
              className="mt-4 w-full bg-[#92B0C3] hover:bg-[#7fa1b5] text-white font-bold text-lg py-3 rounded shadow-md transition-colors active:scale-95"
            >
              Submit Registration
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

export default GuestBooking;