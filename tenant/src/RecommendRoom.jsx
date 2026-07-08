import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function RecommendRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const guestData = location.state; 

  const [bookedRooms, setBookedRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🎯 State สำหรับระบบแนะนำห้องพัก
  const [viewPreference, setViewPreference] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [displayRooms, setDisplayRooms] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const roomDetails = [
    { id: 'A1', description: 'Floor 1, Sunset view', price: 12000, img: 'https://via.placeholder.com/300x200?text=Room+A1' },
    { id: 'B1', description: 'Floor 1, Sunrise view', price: 13000, img: 'https://via.placeholder.com/300x200?text=Room+B1' },
    { id: 'C1', description: 'Floor 1, No sunlight', price: 11000, img: 'https://via.placeholder.com/300x200?text=Room+C1' },
    { id: 'D1', description: 'Floor 1, No sunlight', price: 11000, img: 'https://via.placeholder.com/300x200?text=Room+D1' },
    { id: 'A2', description: 'Floor 2, Sunset view', price: 14000, img: 'https://via.placeholder.com/300x200?text=Room+A2' },
    { id: 'B2', description: 'Floor 2, Sunrise view', price: 15000, img: 'https://via.placeholder.com/300x200?text=Room+B2' },
    { id: 'C2', description: 'Floor 2, No sunlight', price: 12000, img: 'https://via.placeholder.com/300x200?text=Room+C2' },
    { id: 'D2', description: 'Floor 2, No sunlight', price: 12000, img: 'https://via.placeholder.com/300x200?text=Room+D2' },
  ];

  // ดึงข้อมูลห้องที่ถูกจองไปแล้ว
  useEffect(() => {
    const fetchBookedRooms = async () => {
      try {
        const response = await axios.get('https://eightmansions-backend-1.onrender.com/api/customers/');
        if (Array.isArray(response.data)) {
          const booked = response.data.map(c => String(c.room || "").toUpperCase().trim()).filter(r => r !== "");
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

  // 🎯 ฟังก์ชันค้นหาห้องพักผ่าน API ตัวใหม่
  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      // 1. ส่งข้อมูลที่ลูกค้าอยากได้ไปถาม API 
      const res = await axios.post('https://eightmansions-backend-1.onrender.com/api/recommend-room/', {
        view_preference: viewPreference,
        max_price: maxPrice ? parseInt(maxPrice) : 999999
      });
      
      // 2. เอาไอดีห้องที่ API แนะนำมาแยกไว้
      const recommendedIds = res.data.recommended_rooms.map(r => r.Room_ID);
      
      // 3. กรองข้อมูล: ต้องเป็นห้องที่ API แนะนำ "และ" ต้องไม่ถูกจองไปแล้ว
      const finalRooms = roomDetails.filter(room => 
        recommendedIds.includes(room.id) && !bookedRooms.includes(room.id.toUpperCase())
      );
      
      setDisplayRooms(finalRooms);
    } catch (error) {
      console.error("Error fetching recommendations", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleChooseRoom = (roomId) => {
    navigate('/booking-confirm', { state: { ...guestData, room: roomId } });
  };

  // ก่อนกดค้นหา ให้โชว์ห้องว่างทั้งหมดไปก่อน
  const availableRooms = roomDetails.filter(room => !bookedRooms.includes(room.id.toUpperCase()));
  const roomsToShow = hasSearched ? displayRooms : availableRooms;

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F0] font-sans">
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

      <div className="flex-1 flex flex-col items-center p-6 w-full max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold mt-6 mb-2 text-[#1A1A1A]">Room Recommendation</h2>
        <p className="text-gray-500 mb-8 font-medium">ค้นหาและแนะนำห้องพักที่ตรงกับไลฟ์สไตล์ของคุณที่สุด</p>

        {/* 🎯 แผงควบคุม (Filter Panel) สำหรับดึงข้อมูล AI */}
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-4xl mb-10 flex flex-col sm:flex-row gap-4 items-end border-t-4 border-[#8FAFC1]">
          <div className="flex-1 w-full">
            <label className="block text-gray-700 font-bold mb-2 text-sm">View Preference (วิวที่ชอบ)</label>
            <select 
              value={viewPreference} 
              onChange={(e) => setViewPreference(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FAFC1] outline-none cursor-pointer"
            >
              <option value="">Any View (วิวอะไรก็ได้)</option>
              <option value="Sunrise">Sunrise View (วิวพระอาทิตย์ขึ้น)</option>
              <option value="Sunset">Sunset View (วิวพระอาทิตย์ตก)</option>
              <option value="No sunlight">Standard (ไม่เน้นวิว)</option>
            </select>
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-gray-700 font-bold mb-2 text-sm">Max Budget (งบประมาณสูงสุด)</label>
            <input 
              type="number" 
              placeholder="e.g. 13000" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FAFC1] outline-none"
            />
          </div>

          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full sm:w-auto bg-[#1A1A1A] hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg transition-transform active:scale-95 shadow-md h-[50px] flex items-center justify-center min-w-[120px]"
          >
            {isSearching ? 'Searching...' : 'Find Room'}
          </button>
        </div>

        {/* พื้นที่แสดงผลการ์ดห้องพัก */}
        {isLoading ? (
          <div className="text-center py-12 font-medium text-gray-500 animate-pulse">
            กำลังโหลดข้อมูลห้องพัก...
          </div>
        ) : roomsToShow.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full px-4">
            {roomsToShow.map(room => (
              <div key={room.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-[#8FAFC1] py-2 px-4 text-center font-extrabold text-white text-lg tracking-wider">
                  ROOM {room.id}
                </div>
                <img src={room.img} alt={room.description} className="w-full h-40 object-cover" />
                <div className="p-4 text-center">
                  <p className="font-semibold text-gray-700 text-sm mb-1">{room.description}</p>
                  <p className="font-extrabold text-[#E67E22] text-lg mb-4">{room.price.toLocaleString()} THB</p>
                  <button onClick={() => handleChooseRoom(room.id)} 
                    className="w-full bg-[#8FAFC1] hover:bg-[#7fa1b5] text-white font-bold py-2.5 rounded-lg transition-colors active:scale-95 shadow-sm">
                    Select Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-8 max-w-md">
            <p className="text-gray-500 font-bold text-xl mb-2">🤷‍♂️ No Rooms Found</p>
            <p className="text-gray-400 text-sm">ไม่พบห้องพักว่างที่ตรงกับเงื่อนไขของคุณในขณะนี้ ลองปรับงบประมาณหรือเปลี่ยนวิวดูนะครับ</p>
            {hasSearched && (
              <button onClick={() => { setViewPreference(''); setMaxPrice(''); setHasSearched(false); }} className="mt-4 text-[#8FAFC1] font-bold hover:underline">
                Clear Filters
              </button>
            )}
          </div>
        )}

        <button onClick={() => navigate(-1)} className="mt-12 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-12 rounded-lg shadow-md transition-colors active:scale-95">
          Back
        </button>
      </div>
    </div>
  );
}

export default RecommendRoom;