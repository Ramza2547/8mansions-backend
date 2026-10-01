import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function PaymentInput() {
  const navigate = useNavigate();
  const [occupiedRooms, setOccupiedRooms] = useState([]);
  
  // 🌟 State สำหรับ Auto-Retry Loading
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [countdown, setCountdown] = useState(60);
  const [statusMessage, setStatusMessage] = useState('กำลังเชื่อมต่อฐานข้อมูลห้องพัก...');
  const retryCount = useRef(0);
  
  const [formData, setFormData] = useState({
    room: '', name: '', dueDate: '', roomRentalRemark: '', roomRental: '',
    oldElectric: '', newElectric: '', oldWater: '', newWater: '',
    hasOther: false, otherDetail: '', otherAmount: ''
  });

  const [alertData, setAlertData] = useState({ show: false, type: '', text: '' });

  const roomNames = ['A1', 'B1', 'C1', 'D1', 'A2', 'B2', 'C2', 'D2'];

  useEffect(() => {
    fetchCustomers();
    
    // Cleanup intervals เมื่อออกจากหน้าเว็บ
    return () => {
      if (window.payInterval) clearInterval(window.payInterval);
      if (window.payCountdown) clearInterval(window.payCountdown);
    };
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setLoadProgress(0);
    setCountdown(60);
    setStatusMessage(retryCount.current > 0 ? `กำลังลองเชื่อมต่อใหม่รอบที่ ${retryCount.current}...` : 'กำลังเตรียมรายชื่อห้องพัก...');

    // วิ่งหลอดโหลด
    window.payInterval = setInterval(() => {
      setLoadProgress((prev) => (prev < 90 ? prev + Math.floor(Math.random() * 5) + 2 : prev));
    }, 1000);

    // วิ่งเวลานับถอยหลัง
    window.payCountdown = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    try {
      // ให้เวลาดึง 60 วิ
      const response = await axios.get('https://eightmansions-backend-1.onrender.com/api/customers/', { timeout: 60000 });
      
      clearInterval(window.payInterval);
      clearInterval(window.payCountdown);
      setLoadProgress(100);
      setStatusMessage('โหลดข้อมูลสำเร็จ!');
      
      if (Array.isArray(response.data)) {
        const occupied = [];
        
        roomNames.forEach((room) => {
          const customerInRoom = response.data.find(c => {
            const dbRoom = String(c.room || c.room_number || c.room_name || "").toUpperCase().trim();
            return dbRoom === room.toUpperCase();
          });

          if (customerInRoom) {
            occupied.push({ room: room, name: customerInRoom.name });
          }
        });
        
        setOccupiedRooms(occupied);
      }
      
      // หน่วงเวลาให้เห็นหลอด 100% สักแปปค่อยซ่อนหน้าจอโหลด
      setTimeout(() => setIsLoading(false), 800);
      retryCount.current = 0; // รีเซ็ตตัวนับเมื่อสำเร็จ
      
    } catch (error) {
      clearInterval(window.payInterval);
      clearInterval(window.payCountdown);
      
      setStatusMessage('เซิร์ฟเวอร์ยังไม่ตอบสนอง... กำลังเริ่มดึงข้อมูลใหม่');
      retryCount.current += 1;
      
      // Auto-Retry ในอีก 3 วินาที
      setTimeout(() => fetchCustomers(), 3000);
    }
  };

  const handleRoomChange = (e) => {
    const selectedRoom = e.target.value;
    const customer = occupiedRooms.find(r => r.room === selectedRoom);
    setFormData({ ...formData, room: selectedRoom, name: customer ? customer.name : '' });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleOtherCheck = (e) => setFormData({ ...formData, hasOther: e.target.checked, otherDetail: '', otherAmount: '' });

  const handleDateChange = (date) => {
    if (!date || isNaN(date.getTime())) {
      setFormData({ ...formData, dueDate: '' });
      return;
    }
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setFormData({ ...formData, dueDate: dateStr });
  };

  const getValidDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  const isDeposit = formData.hasOther && formData.otherDetail === 'Deposit';
  const isWithholding = formData.hasOther && formData.otherDetail === 'Withholding Deposit';
  const isRefund = formData.hasOther && formData.otherDetail === 'Refund';
  
  const disableRoomRental = isWithholding; 
  const disableUtils = isWithholding || isDeposit; 

  const handleNext = () => {
    if (!formData.room) return setAlertData({ show: true, type: 'warning', text: 'กรุณาเลือกห้องพัก' });
    if (!formData.dueDate) return setAlertData({ show: true, type: 'warning', text: 'กรุณาระบุวันครบกำหนดชำระ (Due Date)' });
    
    if (formData.hasOther) {
      if (!formData.otherDetail) return setAlertData({ show: true, type: 'warning', text: 'กรุณาเลือกรายละเอียดในช่อง Other' });
      if (!formData.otherAmount) return setAlertData({ show: true, type: 'warning', text: 'กรุณากรอกจำนวนเงินในช่อง Other' });
    }
    
    if (!disableRoomRental && (formData.roomRental === '' || formData.roomRental === undefined)) {
      return setAlertData({ show: true, type: 'warning', text: 'กรุณากรอกยอดเงินในช่อง Room Rental (หากไม่มีให้ใส่ -)' });
    }
    
    if (!disableUtils) {
      if (!formData.oldElectric || !formData.newElectric || !formData.oldWater || !formData.newWater) {
        return setAlertData({ show: true, type: 'warning', text: 'กรุณากรอกมิเตอร์ให้ครบทุกช่อง' });
      }
      if (Number(formData.newElectric) < Number(formData.oldElectric)) {
        return setAlertData({ show: true, type: 'warning', text: 'มิเตอร์ไฟใหม่ ต้องมากกว่าหรือเท่ากับมิเตอร์เก่าครับ!' });
      }
      if (Number(formData.newWater) < Number(formData.oldWater)) {
        return setAlertData({ show: true, type: 'warning', text: 'มิเตอร์น้ำใหม่ ต้องมากกว่าหรือเท่ากับมิเตอร์เก่าครับ!' });
      }
    }
    
    navigate('/admin/payment/review', { state: formData });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F7F9] font-sans relative">
      {/* 🟢 Navbar แบบ Responsive (ไม่ได้แก้ไข คงเดิม 100%) */}
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex items-center justify-between min-h-[60px] flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 sm:gap-6 pl-3 sm:pl-8 py-2 font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] overflow-x-auto whitespace-nowrap">
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/admin')}>Home</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/data')}>Data</span>
            <span className="cursor-pointer px-1 sm:px-2 underline">Payment</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-gray-700 transition-colors" onClick={() => navigate('/admin/feedback')}>Feedback</span>
          </div>
          <div className="flex items-center ml-auto">
            <span onClick={() => navigate('/')} className="mr-3 sm:mr-8 cursor-pointer font-bold hover:text-red-700 text-[13px] sm:text-[16px]">Log out</span>
            <div className="bg-black min-h-[60px] px-3 sm:px-6 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="h-[25px] sm:h-[40px]" />
            </div>
          </div>
        </div>
      </nav>

      {/* 🔵 Content Area */}
      <div className="flex-1 flex justify-center items-start py-8 sm:py-12 px-4 animate-fade-in">
        
        {/* 🌟 1. UI ส่วนของการ์ดฟอร์ม (White Card) */}
        <div className="w-full max-w-3xl bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden min-h-[450px]">
          
          {/* 🌟 UI ส่วนของ Auto-Retry Loading */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center py-10 rounded-2xl">
              <div className="w-16 h-16 border-4 border-[#8FAFC1] border-t-[#2C3E50] rounded-full animate-spin mb-4 shadow-lg"></div>
              <h3 className="text-xl font-extrabold text-[#2C3E50] mb-2">{statusMessage}</h3>
              
              <div className="w-64 bg-gray-200 rounded-full h-2.5 my-3 overflow-hidden">
                <div 
                  className="bg-[#2C3E50] h-full rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${loadProgress}%` }}
                ></div>
              </div>
              
              <p className="text-[#1A1A1A] font-bold text-sm font-mono mt-1">
                ใช้เวลาประมาณ: <span className="text-red-600">{countdown}</span> วินาที
              </p>
              <p className="text-gray-500 font-medium text-center px-4 text-[11px] mt-4">
                (ระบบจะพยายามเชื่อมต่อใหม่อัตโนมัติ โดยไม่ต้องรีเฟรชหน้าเว็บ)
              </p>
            </div>
          )}

          {/* 🌟 2. Form Header */}
          <div className="mb-8 border-b border-gray-100 pb-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] flex items-center gap-3">
              <div className="p-2 bg-[#8FAFC1]/20 rounded-lg text-[#2C3E50]">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              Create Payment Invoice
            </h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Please fill in the billing details for the selected room carefully.</p>
          </div>

          <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-2xl mx-auto">
            
            {/* Section 1: Room & Resident Info */}
            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
              <label className="text-gray-800 font-bold text-sm sm:text-base">Choose Room</label>
              <select 
                value={formData.room} 
                onChange={handleRoomChange} 
                disabled={isLoading}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8FAFC1] focus:bg-white transition-all disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm text-gray-800 font-medium"
              >
                <option value="" disabled>-- Select a room --</option>
                {occupiedRooms.map((r, idx) => <option key={idx} value={r.room}>{r.room} - {r.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
              <label className="text-gray-800 font-bold text-sm sm:text-base">Resident Name</label>
              <input 
                type="text" 
                value={formData.name} 
                readOnly 
                disabled={isLoading}
                placeholder="Auto-filled name"
                className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed text-gray-600 font-medium" 
              />
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
              <label className="text-red-600 font-extrabold text-sm sm:text-base">Due Date (ครบกำหนด)</label>
              <div className="relative w-full">
                <DatePicker
                  selected={getValidDate(formData.dueDate)}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD / MM / YYYY"
                  disabled={isLoading}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8FAFC1] focus:bg-white outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm font-medium"
                  wrapperClassName="w-full"
                />
                <svg className="w-5 h-5 text-gray-400 absolute right-4 top-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>

            {/* 🌟 3. Add Other Box (ปรับใหม่ให้พรีเมียมขึ้น) */}
            <div className="mt-2 p-5 bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] border border-[#e2e8f0] rounded-xl shadow-sm transition-all duration-300">
              <label className="flex items-center gap-3 text-[#1e293b] font-bold cursor-pointer text-sm sm:text-base select-none">
                <input 
                  type="checkbox" 
                  checked={formData.hasOther} 
                  onChange={handleOtherCheck} 
                  disabled={isLoading}
                  className="w-5 h-5 accent-[#3b82f6] cursor-pointer rounded disabled:cursor-not-allowed" 
                />
                Add Other (เพิ่มรายการอื่นๆ)
              </label>

              {formData.hasOther && (
                <div className="flex flex-col gap-4 mt-5 pt-4 border-t border-[#cbd5e1] animate-fade-in-up">
                  <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
                    <label className="text-[#334155] font-bold text-sm sm:text-base">Other Detail</label>
                    <select 
                      name="otherDetail" 
                      value={formData.otherDetail} 
                      onChange={handleChange} 
                      disabled={isLoading}
                      className="w-full p-3 bg-white border border-[#cbd5e1] rounded-lg outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm"
                    >
                      <option value="" disabled>-- เลือกลักษณะรายการ --</option>
                      <option value="Deposit">Deposit</option>
                      <option value="Withholding Deposit">Withholding Deposit</option>
                      <option value="Outstanding Payment">Outstanding Payment</option>
                      <option value="Refund">Refund </option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
                    <label className="text-[#334155] font-bold text-sm sm:text-base">Amount (THB)</label>
                    <div className="relative w-full">
                      {isRefund && <span className="absolute left-3 top-3.5 font-extrabold text-red-600">-</span>}
                      <input 
                        type="number" 
                        name="otherAmount" 
                        value={formData.otherAmount} 
                        onChange={handleChange} 
                        disabled={isLoading}
                        className={`w-full p-3 bg-white border border-[#cbd5e1] rounded-lg outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm ${isRefund ? 'pl-7 text-red-600 font-bold' : ''}`} 
                        placeholder="ระบุจำนวนเงิน..." 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section Divider */}
            <hr className="border-gray-100 my-2" />

            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
              <label className={`font-bold text-sm sm:text-base ${disableRoomRental ? 'text-gray-400' : 'text-gray-800'}`}>Room Rental (THB)</label>
              <div className="flex gap-2 w-full">
                {isRefund && (
                  <input 
                    type="text" 
                    name="roomRentalRemark" 
                    value={disableRoomRental ? '' : formData.roomRentalRemark} 
                    onChange={handleChange} 
                    disabled={disableRoomRental || isLoading} 
                    placeholder="Remark..." 
                    className={`w-1/2 p-3 border rounded-xl outline-none text-sm transition-all shadow-sm ${disableRoomRental || isLoading ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#8FAFC1] focus:bg-white'}`} 
                  />
                )}
                <input 
                  type="text" 
                  name="roomRental" 
                  value={disableRoomRental ? '' : formData.roomRental} 
                  onChange={handleChange} 
                  disabled={disableRoomRental || isLoading} 
                  placeholder="ยอดค่าเช่า..."
                  className={`${isRefund ? 'w-1/2' : 'w-full'} p-3 border rounded-xl outline-none transition-all shadow-sm font-medium ${disableRoomRental || isLoading ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#8FAFC1] focus:bg-white'}`} 
                />
              </div>
            </div>

            {/* Utility Meters */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex flex-col gap-4 mt-2">
              <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
                <label className={`font-bold text-sm sm:text-base flex items-center gap-2 ${disableUtils ? 'text-gray-400' : 'text-gray-800'}`}>
                  ⚡ Old Electric (Unit)
                </label>
                <input type="number" step="0.1" name="oldElectric" value={disableUtils ? '' : formData.oldElectric} onChange={handleChange} disabled={disableUtils || isLoading} className={`w-full p-3 border rounded-xl outline-none transition-all shadow-sm ${disableUtils || isLoading ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-200 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
              </div>
              <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
                <label className={`font-bold text-sm sm:text-base flex items-center gap-2 ${disableUtils ? 'text-gray-400' : 'text-gray-800'}`}>
                  ⚡ New Electric (Unit)
                </label>
                <input type="number" step="0.1" name="newElectric" value={disableUtils ? '' : formData.newElectric} onChange={handleChange} disabled={disableUtils || isLoading} className={`w-full p-3 border rounded-xl outline-none transition-all shadow-sm ${disableUtils || isLoading ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-200 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
              </div>
            </div>

            <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-100/50 flex flex-col gap-4">
              <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
                <label className={`font-bold text-sm sm:text-base flex items-center gap-2 ${disableUtils ? 'text-gray-400' : 'text-gray-800'}`}>
                  💧 Old Water (Unit)
                </label>
                <input type="number" step="0.1" name="oldWater" value={disableUtils ? '' : formData.oldWater} onChange={handleChange} disabled={disableUtils || isLoading} className={`w-full p-3 border rounded-xl outline-none transition-all shadow-sm ${disableUtils || isLoading ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-200 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
              </div>
              <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
                <label className={`font-bold text-sm sm:text-base flex items-center gap-2 ${disableUtils ? 'text-gray-400' : 'text-gray-800'}`}>
                  💧 New Water (Unit)
                </label>
                <input type="number" step="0.1" name="newWater" value={disableUtils ? '' : formData.newWater} onChange={handleChange} disabled={disableUtils || isLoading} className={`w-full p-3 border rounded-xl outline-none transition-all shadow-sm ${disableUtils || isLoading ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-200 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
              </div>
            </div>

            {/* 🌟 4. Next Button (ปรับให้ดูพรีเมียม กว้างขึ้น และมีแอนิเมชันตอนชี้) */}
            <div className="flex justify-end mt-6">
              <button 
                onClick={handleNext} 
                disabled={isLoading} 
                className="w-full sm:w-auto min-w-[200px] bg-[#2C3E50] hover:bg-black text-white font-extrabold py-3.5 px-10 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 text-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
              >
                Continue Review 
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 🎯 Custom Alert Popup (คงเดิม) */}
      {alertData.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[110] p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col items-center text-center transform transition-all scale-100">
            
            {alertData.type === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500 shadow-sm border-4 border-red-50">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
            )}
            {alertData.type === 'warning' && (
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-500 shadow-sm border-4 border-yellow-50">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
            )}
            
            <h3 className={`text-xl font-extrabold mb-2 
              ${alertData.type === 'error' ? 'text-red-700' : ''}
              ${alertData.type === 'warning' ? 'text-yellow-600' : ''}
            `}>
              {alertData.type === 'error' && 'เกิดข้อผิดพลาด!'}
              {alertData.type === 'warning' && 'แจ้งเตือน'}
            </h3>
            
            <p className="text-gray-600 mb-6 font-medium leading-relaxed">{alertData.text}</p>
            
            <button
              onClick={() => setAlertData({ show: false, type: '', text: '' })}
              className={`px-8 py-3 font-bold text-white rounded-xl transition-transform active:scale-95 w-full shadow-md 
                ${alertData.type === 'error' ? 'bg-[#E74C3C] hover:bg-[#C0392B]' : ''}
                ${alertData.type === 'warning' ? 'bg-[#F39C12] hover:bg-[#D68910]' : ''}
              `}
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentInput;