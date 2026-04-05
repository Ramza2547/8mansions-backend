import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function GuestBooking() {
  const navigate = useNavigate();
  
  // 🎯 1. เพิ่ม State สำหรับฟอร์มคนที่ 2
  const [formData, setFormData] = useState({
    name: '',
    nationality: '',
    date_of_birth: '',
    lease_start: '',
    lease_end: '', 
    // ฟิลด์คนที่ 2
    name_2: '',
    nationality_2: '',
    date_of_birth_2: '',
  });

  const [duration, setDuration] = useState(''); 
  // 🎯 2. State ตัวเปิด/ปิด ฟอร์มคนที่ 2
  const [hasSecondTenant, setHasSecondTenant] = useState(false);

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

  // 🎯 จัดการข้อมูลก่อนส่ง
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    // ถ้าไม่ได้ติ๊กคนที่ 2 ให้เคลียร์ค่าให้ว่าง เผื่อลูกค้าพิมพ์ค้างไว้
    const dataToSubmit = { ...formData };
    if (!hasSecondTenant) {
      dataToSubmit.name_2 = '';
      dataToSubmit.nationality_2 = '';
      dataToSubmit.date_of_birth_2 = null; // ส่ง null ให้ Django ถ้าเป็น DateField
    }

    try {
      await axios.post('https://eightmansions-backend.onrender.com/api/customers/', dataToSubmit);
      alert('Registration Successful! (ลงทะเบียนสำเร็จ 🎉)');
      navigate('/'); 
    } catch (error) {
      console.error('Error submitting form:', error);
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
            {/* ข้อมูลผู้เช่าคนที่ 1 */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col gap-4">
              <h3 className="font-bold text-[#2C3E50] border-b pb-2">Tenant 1 (ผู้เช่าหลัก)</h3>
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
            </div>

            {/* 🎯 ปุ่ม Checkbox เปิดผู้เช่าคนที่ 2 */}
            <div className="flex items-center gap-3 py-2">
              <input 
                type="checkbox" 
                id="secondTenantCheck" 
                checked={hasSecondTenant} 
                onChange={(e) => setHasSecondTenant(e.target.checked)}
                className="w-5 h-5 text-[#8FAFC1] border-gray-300 rounded focus:ring-[#8FAFC1]" 
              />
              <label htmlFor="secondTenantCheck" className="font-bold text-[#2C3E50] cursor-pointer">
                Add 2nd Tenant (เพิ่มผู้เช่าคนที่ 2)
              </label>
            </div>

            {/* 🎯 ฟอร์มคนที่ 2 (จะโชว์ก็ต่อเมื่อติ๊กถูก) */}
            {hasSecondTenant && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex flex-col gap-4 animate-fade-in-up">
                <h3 className="font-bold text-green-800 border-b border-green-200 pb-2">Tenant 2 (ผู้เช่าร่วม)</h3>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Name (ชื่อ-นามสกุล)</label>
                  <input type="text" name="name_2" required={hasSecondTenant} value={formData.name_2} onChange={handleChange}
                    className="w-full p-3 border border-green-300 rounded focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Nationality (สัญชาติ)</label>
                  <input type="text" name="nationality_2" required={hasSecondTenant} value={formData.nationality_2} onChange={handleChange}
                    className="w-full p-3 border border-green-300 rounded focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Date of Birth (วันเกิด)</label>
                  <input type="date" name="date_of_birth_2" required={hasSecondTenant} value={formData.date_of_birth_2} onChange={handleChange}
                    className="w-full p-3 border border-green-300 rounded focus:ring-2 focus:ring-green-400" />
                </div>
              </div>
            )}

            {/* ข้อมูลสัญญาเช่า */}
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