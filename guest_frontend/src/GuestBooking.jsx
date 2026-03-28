import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function GuestBooking() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    nationality: '',
    date_of_birth: '',
    lease_start: '',
    lease_end: '', 
  });

  const [duration, setDuration] = useState(''); 

  const calculateEndDate = (startDate, months) => {
    if (!startDate || !months) return '';
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + parseInt(months));
    return date.toISOString().split('T')[0]; 
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'lease_start') {
      const newEndDate = calculateEndDate(value, duration);
      setFormData({ ...formData, lease_start: value, lease_end: newEndDate });
    } else if (name === 'duration') {
      setDuration(value);
      const newEndDate = calculateEndDate(formData.lease_start, value);
      setFormData({ ...formData, lease_end: newEndDate });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      await axios.post('https://eightmansions-backend.onrender.com/api/customers/', formData);
      // 🎯 เปลี่ยนแจ้งเตือนเป็น Eng-Thai
      alert('Registration Successful! (ลงทะเบียนสำเร็จ 🎉)');
      navigate('/'); 
    } catch (error) {
      console.error('Error submitting form:', error);
      // 🎯 เปลี่ยนแจ้งเตือนเป็น Eng-Thai
      alert('Registration failed. Please try again. (เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง)');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F0] font-sans">
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

      <div className="flex-1 flex justify-center items-center p-6">
        <div className="bg-white p-8 md:p-10 rounded-lg shadow-xl w-full max-w-lg my-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#1A1A1A]">Customer Registration</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Name (ชื่อ-นามสกุล)</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#92B0C3]" />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Nationality (สัญชาติ)</label>
              <input type="text" name="nationality" required value={formData.nationality} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#92B0C3]" />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Date of Birth (วันเกิด)</label>
              <input type="date" name="date_of_birth" required value={formData.date_of_birth} onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#92B0C3]" />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex flex-col gap-4">
              <h3 className="font-bold text-[#2C3E50] border-b pb-2">Lease Details (ข้อมูลสัญญาเช่า)</h3>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Lease Start Date (วันเริ่มสัญญา)</label>
                <input type="date" name="lease_start" required value={formData.lease_start} onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#92B0C3]" />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Lease Duration (ระยะเวลาเช่า)</label>
                <select name="duration" required value={duration} onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#92B0C3] bg-white">
                  {/* 🎯 แก้ให้เป็น English หลัก ตามด้วย (Thai) */}
                  <option value="" disabled>Select Duration (เลือกระยะเวลา)</option>
                  <option value="1">1 Month (1 เดือน)</option>
                  <option value="6">6 Months (6 เดือน)</option>
                  <option value="12">1 Year (1 ปี)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Lease End Date (วันหมดสัญญา)</label>
                <input type="date" name="lease_end" required readOnly value={formData.lease_end}
                  className="w-full p-3 border border-gray-300 rounded bg-gray-100 text-gray-500 cursor-not-allowed" 
                  title="Calculated automatically (คำนวณอัตโนมัติจากระยะเวลาเช่า)" />
              </div>
            </div>

            <button type="submit" className="mt-4 w-full bg-[#92B0C3] hover:bg-[#7fa1b5] text-white font-bold text-lg py-3 rounded shadow-md transition-colors active:scale-95">
              Submit Registration
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GuestBooking;