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
    let initialBirthDate2 = null;
    let initialAge = '';
    let initialAge2 = '';

    const currentYear = new Date().getFullYear();

    if (guestFormData && guestFormData.date_of_birth) {
      const [d, m, y] = guestFormData.date_of_birth.split('/');
      initialBirthDate = new Date(y, m - 1, d);
      initialAge = currentYear - parseInt(y, 10);
    }
    
    if (guestFormData && guestFormData.date_of_birth_2) {
      const [d2, m2, y2] = guestFormData.date_of_birth_2.split('/');
      initialBirthDate2 = new Date(y2, m2 - 1, d2);
      initialAge2 = currentYear - parseInt(y2, 10);
    }

    return { initialBirthDate, initialBirthDate2, initialAge, initialAge2 };
  };

  const { initialBirthDate, initialBirthDate2, initialAge, initialAge2 } = getInitialData();

  const [birthDate, setBirthDate] = useState(initialBirthDate);
  const [birthDate2, setBirthDate2] = useState(initialBirthDate2); // 🎯 เพิ่ม State วันเกิดคนที่ 2
  
  const [formData, setFormData] = useState({ 
    age: initialAge, 
    gender: 0, 
    budget: 15000,
    occupants: hasSecondTenant ? 2 : 1,
    duration: parseInt(leaseDuration),
    age2: initialAge2,
    gender2: 1 
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

  // 🎯 เพิ่มฟังก์ชันจัดการปฏิทินคนที่ 2
  const handleDateChange2 = (date) => {
    setBirthDate2(date);
    if (date) {
      const currentYear = new Date().getFullYear();
      const calculatedAge = currentYear - date.getFullYear();
      setFormData({ ...formData, age2: calculatedAge });
    } else {
      setFormData({ ...formData, age2: '' });
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
    setFormData({ age: '', gender: 0, budget: 15000, occupants: 1, duration: 12, age2: '', gender2: 1 });
    setBirthDate(null);
    setBirthDate2(null);
    setRooms([]);
    setAiPrediction(null);
    setHasSearched(false);
  };

  const handleSelectRoom = (selectedRoom) => {
    navigate('/booking-confirm', {
      state: {
        formData: guestFormData,
        duration: leaseDuration,
        hasSecondTenant: formData.occupants === 2, // 🎯 อัปเดตตามที่กดในหน้า AI
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">Room Recommendation</h1>
          <p className="text-gray-600 mt-2">ให้ระบบ AI วิเคราะห์และแนะนำห้องพักที่เหมาะสมกับคุณ</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-6xl mb-8">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            
            {/* 🎯 แถวแรก: Tenant 1 และ ข้อมูลห้องที่ใช้ร่วมกัน */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              
              <div className="w-full sm:w-1/6">
                <label className="block text-[#1A1A1A] font-bold mb-2 text-xs">Tenant 1 DOB</label>
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

              {/* เส้นแบ่งสายตาบางๆ */}
              <div className="hidden sm:block h-10 border-l border-gray-300 mx-2"></div>

              <div className="w-full sm:w-1/6">
                <label className="block text-[#2C3E50] font-bold mb-2 text-xs">Occupants (คน)</label>
                <select name="occupants" value={formData.occupants} onChange={handleChange} className="w-full p-2 bg-blue-50 border border-blue-200 rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none cursor-pointer text-sm font-bold text-blue-900">
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

              <div className="w-full sm:w-1/6 flex flex-col gap-2">
                <label className="block text-gray-700 font-bold text-xs">Max Budget</label>
                <input type="number" name="budget" value={formData.budget} onChange={handleChange} className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none text-sm font-bold text-orange-600" />
              </div>

              <div className="w-full sm:w-1/6 flex items-end">
                <button type="submit" disabled={isLoading} className="w-full bg-[#1A1A1A] hover:bg-gray-800 text-white font-bold py-2 rounded shadow transition-colors flex justify-center items-center text-sm h-[38px]">
                  {isLoading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : 'Find'}
                </button>
              </div>
            </div>

            {/* 🎯 แถวที่สอง: Tenant 2 (จะโชว์เมื่อ occupants == 2) */}
            {formData.occupants === 2 && (
              <div className="flex flex-col sm:flex-row gap-4 items-end pt-4 mt-2 border-t border-dashed border-gray-300 animate-fade-in">
                
                <div className="w-full sm:w-1/6">
                  <label className="block text-green-700 font-bold mb-2 text-xs">Tenant 2 DOB</label>
                  <DatePicker selected={birthDate2} onChange={handleDateChange2} dateFormat="dd/MM/yyyy" placeholderText="วันเกิดคนที่ 2" showMonthDropdown showYearDropdown dropdownMode="select" yearDropdownItemNumber={100} scrollableYearDropdown maxDate={new Date()} className="w-full p-2 bg-green-50 border border-green-200 rounded focus:ring-2 focus:ring-green-400 outline-none text-sm" wrapperClassName="w-full"/>
                </div>

                <div className="w-full sm:w-1/6">
                  <label className="block text-gray-700 font-bold mb-2 text-xs">Age (อายุ)</label>
                  <input type="number" name="age2" value={formData.age2} onChange={handleChange} className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:ring-2 focus:ring-green-400 outline-none text-sm" />
                </div>

                <div className="w-full sm:w-1/6">
                  <label className="block text-gray-700 font-bold mb-2 text-xs">Gender</label>
                  <select name="gender2" value={formData.gender2} onChange={handleChange} className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:ring-2 focus:ring-green-400 outline-none cursor-pointer text-sm">
                    <option value={0}>Male</option>
                    <option value={1}>Female</option>
                  </select>
                </div>

                {/* สร้างช่องว่าง (Empty Space) ดันให้ปุ่มด้านบนไม่เบี้ยว */}
                <div className="hidden sm:block h-10 border-l border-transparent mx-2"></div>
                <div className="hidden sm:block w-full sm:w-1/6"></div>
                <div className="hidden sm:block w-full sm:w-1/6"></div>
                <div className="hidden sm:block w-full sm:w-1/6"></div>
                <div className="hidden sm:block w-full sm:w-1/6"></div>
              </div>
            )}

          </form>
        </div>

        {hasSearched && aiPrediction && (
          <div className="w-full max-w-6xl mb-6 p-4 bg-[#8FAFC1] bg-opacity-20 border border-[#8FAFC1] rounded-lg flex items-center justify-between animate-fade-in">
            <div>
              <span className="font-bold text-[#1A1A1A]">🧠 AI Blended Prediction:</span>
              <span className="ml-2 text-gray-700">
                The model predicts you might like <b>Floor {aiPrediction.preferred_floor}</b> with a <b>{aiPrediction.preferred_view}</b> view. 
                <span className="text-gray-500 text-sm ml-2 block sm:inline mt-1 sm:mt-0">
                  (โมเดลวิเคราะห์ความต้องการ{formData.occupants === 2 ? 'แบบคู่' : ''}แล้วพบว่าน่าจะชอบชั้น <b>{aiPrediction.preferred_floor}</b> และวิว <b>{aiPrediction.preferred_view}</b>)
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