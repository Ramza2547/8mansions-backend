import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function RecommendRoom() {
  const navigate = useNavigate();
  const location = useLocation();

  const guestFormData = location.state?.formData;
  const leaseDuration = location.state?.duration || 12;
  const hasSecondTenant = location.state?.hasSecondTenant || false;

  const getInitialData = () => {
    let initialBirthDate = null;
    let initialAge = '';

    if (guestFormData && guestFormData.date_of_birth) {
      const [d, m, y] = guestFormData.date_of_birth.split('/');
      initialBirthDate = new Date(y, m - 1, d);
      
      const currentYear = new Date().getFullYear();
      const birthYear = parseInt(y, 10);
      initialAge = currentYear - birthYear;
    }
    return { initialBirthDate, initialAge };
  };

  const { initialBirthDate, initialAge } = getInitialData();

  const [birthDate, setBirthDate] = useState(initialBirthDate);
  // 🎯 เพิ่ม occupants และ duration เป็นตัวกรอง
  const [formData, setFormData] = useState({ 
    age: initialAge, 
    gender: 0, 
    budget: 15000,
    occupants: hasSecondTenant ? 2 : 1,
    duration: parseInt(leaseDuration)
  });
  
  const [rooms, setRooms] = useState([]);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDateChange = (date) => {
    setBirthDate(date);
    if (date) {
      const currentYear = new Date().getFullYear();
      const calculatedAge = currentYear - date.getFullYear();
      setFormData({ ...formData, age: calculatedAge });
    } else {
      setFormData({ ...formData, age: '' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!formData.age || formData.age <= 0) return alert("กรุณาระบุอายุให้ถูกต้องครับ");

    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const response = await axios.post('https://eightmansions-backend-1.onrender.com/api/recommend-room/', formData);
      setRooms(response.data.recommended_rooms || []);
      setAiPrediction(response.data.ai_prediction);
    } catch (error) {
      console.error("Error fetching recommendation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFormData({ age: '', gender: 0, budget: 15000, occupants: 1, duration: 12 });
    setBirthDate(null);
    setRooms([]);
    setAiPrediction(null);
    setHasSearched(false);
  };

  const handleSelectRoom = (selectedRoom) => {
    navigate('/booking-confirm', {
      state: {
        formData: guestFormData,
        duration: leaseDuration,
        hasSecondTenant: hasSecondTenant,
        roomDetails: selectedRoom
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] font-sans">
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex justify-between items-stretch w-full min-h-[60px] sm:min-h-[80px]">
          <div className="flex gap-4 sm:gap-10 items-center px-[5%]">
            <span onClick={() => navigate('/')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium text-black hover:underline">Home</span>
            <span className="cursor-pointer text-[14px] sm:text-[18px] font-medium text-black underline underline-offset-4 decoration-2">Booking</span>
            <span onClick={() => navigate('/comment')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium text-black hover:underline">Comment</span>
          </div>
          <div className="bg-black px-4 sm:px-[30px] flex items-center justify-center">
            <img src="/logo.png" alt="8 Mansions Logo" className="h-[40px] sm:h-[70px] w-auto" />
          </div>
        </div>
      </nav>

      <div className="flex-1 p-4 sm:p-8 flex flex-col items-center">
        <div className="text-center mb-8">
          {/* 🎯 ถอดคำว่า Smart ออก เหลือแค่นี้ครับ */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">Room Recommendation</h1>
          <p className="text-gray-600 mt-2">ให้ระบบ AI วิเคราะห์และแนะนำห้องพักที่เหมาะสมกับคุณ</p>
        </div>

        {/* 🎯 ปรับให้กว้างขึ้น เพื่อวางตัวกรอง 5 ช่องให้พอดี */}
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-6xl mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
            
            <div className="w-full sm:w-1/6">
              <label className="block text-gray-700 font-bold mb-2 text-xs">Date of Birth</label>
              <DatePicker selected={birthDate} onChange={handleDateChange} dateFormat="dd/MM/yyyy" placeholderText="วันเกิด" showMonthDropdown showYearDropdown dropdownMode="select" yearDropdownItemNumber={100} scrollableYearDropdown maxDate={new Date()} className="w-full p-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none text-sm" wrapperClassName="w-full"/>
            </div>

            <div className="w-full sm:w-1/6">
              <label className="block text-gray-700 font-bold mb-2 text-xs">Age (อายุ)</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none text-sm" />
            </div>

            <div className="w-full sm:w-1/6">
              <label className="block text-gray-700 font-bold mb-2 text-xs">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none cursor-pointer text-sm">
                <option value={0}>Male</option>
                <option value={1}>Female</option>
              </select>
            </div>

            {/* 🎯 เพิ่มตัวกรอง Occupants และ Duration */}
            <div className="w-full sm:w-1/6">
              <label className="block text-gray-700 font-bold mb-2 text-xs">Occupants (คน)</label>
              <select name="occupants" value={formData.occupants} onChange={handleChange} className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none cursor-pointer text-sm">
                <option value={1}>1 Person</option>
                <option value={2}>2 Persons</option>
              </select>
            </div>

            <div className="w-full sm:w-1/6">
              <label className="block text-gray-700 font-bold mb-2 text-xs">Duration (ด.)</label>
              <select name="duration" value={formData.duration} onChange={handleChange} className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none cursor-pointer text-sm">
                <option value={1}>1 Month</option>
                <option value={6}>6 Months</option>
                <option value={12}>1 Year</option>
              </select>
            </div>

            <div className="w-full sm:w-1/6">
              <label className="block text-gray-700 font-bold mb-2 text-xs">Max Budget</label>
              <input type="number" name="budget" value={formData.budget} onChange={handleChange} className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none text-sm" />
            </div>

            <div className="w-full sm:w-1/6 flex gap-2">
              <button type="submit" disabled={isLoading} className="w-full bg-[#1A1A1A] hover:bg-gray-800 text-white font-bold py-2 rounded shadow transition-colors flex justify-center items-center text-sm">
                {isLoading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : 'Find'}
              </button>
            </div>
          </form>
        </div>

        {hasSearched && aiPrediction && (
          <div className="w-full max-w-6xl mb-6 p-4 bg-[#8FAFC1] bg-opacity-20 border border-[#8FAFC1] rounded-lg flex items-center justify-between animate-fade-in">
            <div>
              <span className="font-bold text-[#1A1A1A]">🧠 AI Prediction:</span>
              <span className="ml-2 text-gray-700">
                The model predicts you might like <b>Floor {aiPrediction.preferred_floor}</b> with a <b>{aiPrediction.preferred_view}</b> view. 
                <span className="text-gray-500 text-sm ml-2">
                  (โมเดลวิเคราะห์ว่าคุณน่าจะชอบห้อง <b>ชั้น {aiPrediction.preferred_floor}</b> และวิวแบบ <b>{aiPrediction.preferred_view}</b>)
                </span>
              </span>
            </div>
          </div>
        )}

        <div className="w-full max-w-6xl">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-10 w-10 border-4 border-[#8FAFC1] border-t-[#1A1A1A] rounded-full"></div>
            </div>
          ) : hasSearched && rooms.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow text-center flex flex-col items-center">
              <span className="text-4xl mb-4">💸</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Rooms Available</h3>
              <p className="text-gray-500 mb-6">ขออภัยครับ ไม่พบห้องพักที่ตรงกับงบประมาณ หรือห้องพักถูกเช่าเต็มหมดแล้ว</p>
              <button onClick={clearFilters} className="text-[#8FAFC1] font-bold hover:underline">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {rooms.map((room, index) => (
                <div key={room.Room_ID} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col relative transform transition hover:-translate-y-1 hover:shadow-lg border-t-4 border-[#8FAFC1]">
                  
                  {index === 0 && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-[10px] font-extrabold px-2 py-1 rounded-bl-lg shadow-sm">
                      ✨ BEST MATCH
                    </div>
                  )}

                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-black text-[#1A1A1A]">ROOM {room.Room_ID}</h3>
                      {/* 🎯 แสดงคะแนน 0-100 */}
                      <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        Score: {room.Matching_Score}/100
                      </span>
                    </div>
                    <div className="text-gray-600 text-sm mb-4 space-y-1">
                      <p><b>Floor:</b> {room.Floor}</p>
                      <p><b>View:</b> {room.View_Type}</p>
                    </div>
                    <div className="text-sm font-bold text-orange-600 border-t pt-3">
                      {room.Price.toLocaleString()} THB / Month
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSelectRoom(room)}
                    className="w-full py-2 bg-[#8FAFC1] hover:bg-[#7a96a8] text-[#1A1A1A] font-bold transition-colors"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecommendRoom;