import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function GuestBooking() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    room: '', // เพิ่มฟิลด์เก็บชื่อห้อง
    name: '', nationality: '', date_of_birth: '',
    lease_start: '', lease_end: '', 
    name_2: '', nationality_2: '', date_of_birth_2: '',
  });

  const [duration, setDuration] = useState(''); 
  const [hasSecondTenant, setHasSecondTenant] = useState(false);
  const [bookedRooms, setBookedRooms] = useState([]); // State เก็บรายชื่อห้องที่โดนจองแล้ว

  // รายละเอียดห้องพักทั้งหมด
  const roomDetails = [
    { id: 'A1', description: 'Floor 1, Sunset view' },
    { id: 'B1', description: 'Floor 1, Sunrise view' },
    { id: 'C1', description: 'Floor 1, No sunlight' },
    { id: 'D1', description: 'Floor 1, No sunlight' },
    { id: 'A2', description: 'Floor 2, Sunset view' },
    { id: 'B2', description: 'Floor 2, Sunrise view' },
    { id: 'C2', description: 'Floor 2, No sunlight' },
    { id: 'D2', description: 'Floor 2, No sunlight' },
  ];

  // ดึงข้อมูลลูกค้าเพื่อเช็คว่าห้องไหนถูกจองไปแล้วบ้าง
  useEffect(() => {
    const fetchBookedRooms = async () => {
      try {
        const response = await axios.get('https://eightmansions-backend.onrender.com/api/customers/');
        if (Array.isArray(response.data)) {
          // ดึงเฉพาะชื่อห้องที่ถูกจองแล้วมาเก็บไว้ใน Array (แปลงเป็นตัวพิมพ์ใหญ่เพื่อความชัวร์)
          const booked = response.data.map(c => {
            return String(c.room || c.room_number || c.room_name || c.roomRental || "").toUpperCase().trim();
          }).filter(r => r !== "");
          setBookedRooms(booked);
        }
      } catch (error) {
        console.error('Error fetching booked rooms:', error);
      }
    };
    fetchBookedRooms();
  }, []);

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
    
    const dataToSubmit = { ...formData };
    if (!hasSecondTenant) {
      dataToSubmit.name_2 = '';
      dataToSubmit.nationality_2 = '';
      dataToSubmit.date_of_birth_2 = null; 
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
      {/* 🎯 Navbar Responsive */}
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex justify-between items-stretch w-full min-h-[60px] sm:min-h-[80px]">
          <div className="flex gap-4 sm:gap-10 items-center px-[5%]">
            <span onClick={() => navigate('/')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium text-black hover:underline underline-offset-4 decoration-2">Home</span>
            <span onClick={() => navigate('/booking')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium text-black underline underline-offset-4 decoration-2">Booking</span>
            <span onClick={() => navigate('/comment')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium text-black hover:underline underline-offset-4 decoration-2">Comment</span>
          </div>
          <div className="bg-black px-4 sm:px-[30px] flex items-center justify-center">
            <img src="/logo.png" alt="8 Mansions Logo" className="h-[40px] sm:h-[70px] w-auto block object-contain" />
          </div>
        </div>
      </nav>

      <div className="flex-1 flex justify-center items-center p-4 sm:p-6">
        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-xl w-full max-w-lg my-6 sm:my-8 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-[#1A1A1A]">Customer Registration</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* 🎯 ส่วนเลือกห้องพัก (เพิ่มใหม่) */}
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex flex-col gap-3 sm:gap-4">
              <h3 className="font-bold text-orange-800 border-b border-orange-200 pb-2">Room Selection (เลือกห้องพัก)</h3>
              <div>
                <label className="block text-gray-700 font-bold mb-1 sm:mb-2 text-sm sm:text-base">Select Room</label>
                <select name="room" required value={formData.room} onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-orange-400 bg-white text-sm sm:text-base cursor-pointer">
                  <option value="" disabled>-- Select a room --</option>
                  {roomDetails.map((room) => {
                    const isBooked = bookedRooms.includes(room.id);
                    return (
                      <option key={room.id} value={room.id} disabled={isBooked} className={isBooked ? "text-gray-400 bg-gray-100" : "text-black"}>
                        Room {room.id} - {room.description} {isBooked ? ' (Booked)' : ' (Available)'}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* ข้อมูลผู้เช่าคนที่ 1 */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col gap-3 sm:gap-4">
              <h3 className="font-bold text-[#2C3E50] border-b pb-2">Tenant 1 (ผู้เช่าหลัก)</h3>
              <div>
                <label className="block text-gray-700 font-bold mb-1 sm:mb-2 text-sm sm:text-base">Name (ชื่อ-นามสกุล)</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#92B0C3] text-sm sm:text-base" />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1 sm:mb-2 text-sm sm:text-base">Nationality (สัญชาติ)</label>
                <input type="text" name="nationality" required value={formData.nationality} onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#92B0C3] text-sm sm:text-base" />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1 sm:mb-2 text-sm sm:text-base">Date of Birth (วันเกิด)</label>
                <input type="date" name="date_of_birth" required value={formData.date_of_birth} onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#92B0C3] text-sm sm:text-base" />
              </div>
            </div>

            {/* ปุ่ม Checkbox */}
            <div className="flex items-center gap-3 py-1 sm:py-2">
              <input 
                type="checkbox" id="secondTenantCheck" checked={hasSecondTenant} onChange={(e) => setHasSecondTenant(e.target.checked)}
                className="w-4 h-4 sm:w-5 sm:h-5 text-[#8FAFC1] border-gray-300 rounded focus:ring-[#8FAFC1]" 
              />
              <label htmlFor="secondTenantCheck" className="font-bold text-[#2C3E50] cursor-pointer text-sm sm:text-base">
                Add 2nd Tenant (เพิ่มผู้เช่าคนที่ 2)
              </label>
            </div>

            {/* ฟอร์มคนที่ 2 */}
            {hasSecondTenant && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex flex-col gap-3 sm:gap-4 animate-fade-in-up">
                <h3 className="font-bold text-green-800 border-b border-green-200 pb-2">Tenant 2 (ผู้เช่าร่วม)</h3>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 sm:mb-2 text-sm sm:text-base">Name (ชื่อ-นามสกุล)</label>
                  <input type="text" name="name_2" required={hasSecondTenant} value={formData.name_2} onChange={handleChange}
                    className="w-full p-2 sm:p-3 border border-green-300 rounded focus:ring-2 focus:ring-green-400 text-sm sm:text-base" />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 sm:mb-2 text-sm sm:text-base">Nationality (สัญชาติ)</label>
                  <input type="text" name="nationality_2" required={hasSecondTenant} value={formData.nationality_2} onChange={handleChange}
                    className="w-full p-2 sm:p-3 border border-green-300 rounded focus:ring-2 focus:ring-green-400 text-sm sm:text-base" />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 sm:mb-2 text-sm sm:text-base">Date of Birth (วันเกิด)</label>
                  <input type="date" name="date_of_birth_2" required={hasSecondTenant} value={formData.date_of_birth_2} onChange={handleChange}
                    className="w-full p-2 sm:p-3 border border-green-300 rounded focus:ring-2 focus:ring-green-400 text-sm sm:text-base" />
                </div>
              </div>
            )}

            {/* ข้อมูลสัญญาเช่า */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex flex-col gap-3 sm:gap-4">
              <h3 className="font-bold text-[#2C3E50] border-b pb-2">Lease Details (ข้อมูลสัญญาเช่า)</h3>
              <div>
                <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Lease Start Date (วันเริ่มสัญญา)</label>
                <input type="date" name="lease_start" required value={formData.lease_start} onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#92B0C3] text-sm sm:text-base" />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Lease Duration (ระยะเวลาเช่า)</label>
                <select name="duration" required value={duration} onChange={handleChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#92B0C3] bg-white text-sm sm:text-base">
                  <option value="" disabled>Select Duration (เลือกระยะเวลา)</option>
                  <option value="1">1 Month (1 เดือน)</option>
                  <option value="6">6 Months (6 เดือน)</option>
                  <option value="12">1 Year (1 ปี)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Lease End Date (วันหมดสัญญา)</label>
                <input type="date" name="lease_end" required readOnly value={formData.lease_end}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base" 
                  title="Calculated automatically (คำนวณอัตโนมัติจากระยะเวลาเช่า)" />
              </div>
            </div>

            <button type="submit" className="mt-4 w-full bg-[#92B0C3] hover:bg-[#7fa1b5] text-white font-bold text-base sm:text-lg py-3 rounded shadow-md transition-colors active:scale-95">
              Submit Registration
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GuestBooking;