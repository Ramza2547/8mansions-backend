import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function RecommendRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const guestData = location.state; // รับข้อมูลฟอร์มมาจาก GuestForm (Frame 15)

  const [bookedRooms, setBookedRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🎯 1. รายละเอียดข้อมูลห้องพักทั้ง 8 ห้องตามที่ระบุมาเป๊ะๆ
  const roomDetails = [
    { id: 'A1', description: 'Floor 1, Sunset view', price: '12,000 Baht', img: 'https://via.placeholder.com/300x200?text=Room+A1' },
    { id: 'B1', description: 'Floor 1, Sunrise view', price: '13,000 Baht', img: 'https://via.placeholder.com/300x200?text=Room+B1' },
    { id: 'C1', description: 'Floor 1, No sunlight', price: '11,000 Baht', img: 'https://via.placeholder.com/300x200?text=Room+C1' },
    { id: 'D1', description: 'Floor 1, No sunlight', price: '11,000 Baht', img: 'https://via.placeholder.com/300x200?text=Room+D1' },
    { id: 'A2', description: 'Floor 2, Sunset view', price: '14,000 Baht', img: 'https://via.placeholder.com/300x200?text=Room+A2' },
    { id: 'B2', description: 'Floor 2, Sunrise view', price: '15,000 Baht', img: 'https://via.placeholder.com/300x200?text=Room+B2' },
    { id: 'C2', description: 'Floor 2, No sunlight', price: '12,000 Baht', img: 'https://via.placeholder.com/300x200?text=Room+C2' },
    { id: 'D2', description: 'Floor 2, No sunlight', price: '12,000 Baht', img: 'https://via.placeholder.com/300x200?text=Room+D2' },
  ];

  // 🎯 2. ดึงข้อมูลจากฐานข้อมูลเดียวกับ DataPage.jsx เพื่อตรวจสอบสถานะห้องว่างแบบ Real-time
  useEffect(() => {
    const fetchBookedRooms = async () => {
      try {
        const response = await axios.get('https://eightmansions-backend.onrender.com/api/customers/');
        if (Array.isArray(response.data)) {
          // ล็อคห้องโดยแกะรหัสห้องพัก แปลงเป็นตัวพิมพ์ใหญ่เพื่อป้องกันข้อมูลเหลื่อมล้ำ
          const booked = response.data.map(c => {
            return String(c.room || c.room_number || c.room_name || c.roomRental || "").toUpperCase().trim();
          }).filter(r => r !== "");
          setBookedRooms(booked);
        }
      } catch (error) {
        console.error('Error fetching room statuses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookedRooms();
  }, []);

  const handleChooseRoom = (roomId) => {
    // ส่งผ่านข้อมูลผู้เช่า + รหัสห้องที่เลือก ไปที่หน้ายืนยัน (Frame 17)
    navigate('/booking-confirm', { state: { ...guestData, room: roomId } });
  };

  // 🎯 3. กรองห้องพัก: คัดเลือกเฉพาะห้องที่ไม่อยู่ใน Array ของ bookedRooms (ซ่อนห้องที่มีคนเช่าแล้ว)
  const availableRooms = roomDetails.filter(room => !bookedRooms.includes(room.id.toUpperCase()));

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F0] font-sans">
      {/* Navbar ตามสเปกเดิม */}
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex justify-between items-stretch w-full min-h-[80px]">
          <div className="flex gap-10 items-center px-[5%]">
            <span onClick={() => navigate('/')} className="cursor-pointer text-[18px] font-medium hover:underline">Home</span>
            <span onClick={() => navigate('/booking')} className="cursor-pointer text-[18px] font-medium underline">Booking</span>
            <span onClick={() => navigate('/comment')} className="cursor-pointer text-[18px] font-medium hover:underline">Comment</span>
          </div>
          <div className="bg-black px-[30px] flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="h-[70px] w-auto block" />
          </div>
        </div>
      </nav>

      {/* Frame 16 Content */}
      <div className="flex-1 flex flex-col items-center p-6 w-full max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold my-6 text-[#1A1A1A]">Recommend Room</h2>
        <p className="text-gray-500 mb-8">นี่คือห้องพักที่ยังว่างอยู่และพร้อมให้คุณเข้าจองในขณะนี้</p>

        {isLoading ? (
          <div className="text-center py-12 font-medium text-gray-500 animate-pulse">
            กำลังตรวจสอบสถานะห้องพักว่าง...
          </div>
        ) : availableRooms.length > 0 ? (
          /* จัดการ Render เฉพาะห้องที่ว่าง */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full px-4">
            {availableRooms.map(room => (
              <div key={room.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-[#8FAFC1] py-2 px-4 text-center font-bold text-white text-lg">
                  Room {room.id}
                </div>
                <img src={room.img} alt={room.description} className="w-full h-40 object-cover" />
                <div className="p-4 text-center">
                  <p className="font-semibold text-gray-700 text-sm mb-1">{room.description}</p>
                  <p className="font-bold text-orange-600 text-base mb-4">{room.price}</p>
                  <button onClick={() => handleChooseRoom(room.id)} 
                    className="w-full bg-[#8FAFC1] hover:bg-[#7fa1b5] text-white font-bold py-2 rounded-lg transition-colors active:scale-95 shadow-sm">
                    Choose
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ดักเคสกรณีหอพักเต็มทักห้อง */
          <div className="text-center py-12 bg-white rounded-xl shadow p-8 max-w-md">
            <p className="text-red-500 font-bold text-xl mb-2">⚠️ ขออภัยด้วยครับ หอพักเต็มแล้ว</p>
            <p className="text-gray-500 text-sm">ขณะนี้ไม่มีห้องว่างระบบไม่สามารถเปิดรับจองเพิ่มได้ชั่วคราว</p>
          </div>
        )}

        <button onClick={() => navigate(-1)} className="mt-12 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-10 rounded-lg shadow transition-colors active:scale-95">
          Back
        </button>
      </div>
    </div>
  );
}

export default RecommendRoom;