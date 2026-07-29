import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function PaymentInput() {
  const navigate = useNavigate();
  const [occupiedRooms, setOccupiedRooms] = useState([]);
  
  const [formData, setFormData] = useState({
    room: '', name: '', dueDate: '', roomRentalRemark: '', roomRental: '',
    oldElectric: '', newElectric: '', oldWater: '', newWater: '',
    hasOther: false, otherDetail: '', otherAmount: ''
  });

  // 🎯 เพิ่ม State สำหรับแจ้งเตือน (Custom Alert)
  const [alertData, setAlertData] = useState({ show: false, type: '', text: '' });

  const roomNames = ['A1', 'B1', 'C1', 'D1', 'A2', 'B2', 'C2', 'D2'];

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('https://eightmansions-backend-1.onrender.com/api/customers/');
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
      } catch (error) { 
        console.error("ดึงข้อมูลไม่สำเร็จ", error); 
        // 🎯 ดักจับ Error ตอนดึงข้อมูล
        setAlertData({ show: true, type: 'error', text: 'ไม่สามารถโหลดข้อมูลห้องได้ กรุณาลองใหม่อีกครั้ง' });
      }
    };
    fetchCustomers();
  }, []);

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

  // 🎯 เปลี่ยนลอจิกการแจ้งเตือนจาก alert() มาเรียก setAlertData แทน
  const handleNext = () => {
    if (!formData.room) return setAlertData({ show: true, type: 'warning', text: 'กรุณาเลือกห้องพัก' });
    if (!formData.dueDate) return setAlertData({ show: true, type: 'warning', text: 'กรุณาระบุวันครบกำหนดชำระ (Due Date)' });
    
    if (formData.hasOther) {
      if (!formData.otherDetail) return setAlertData({ show: true, type: 'warning', text: 'กรุณาเลือกรายละเอียดในช่อง Other' });
      if (!formData.otherAmount) return setAlertData({ show: true, type: 'warning', text: 'กรุณากรอกจำนวนเงินในช่อง Other' });
    }
    
    // ดักจับกรณีผู้ใช้ไม่ได้กรอกอะไรเลยใน Room Rental
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
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] font-sans relative">
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

      <div className="flex-1 flex justify-center items-center py-8 sm:py-10 px-4">
        <div className="w-full max-w-3xl bg-white sm:bg-transparent p-4 sm:p-0 rounded-lg shadow-sm sm:shadow-none">
          <div className="flex flex-col gap-4 sm:gap-5 w-full max-w-xl mx-auto">
            
            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-1 sm:gap-4">
              <label className="text-gray-700 font-medium text-sm sm:text-base">Choose Room</label>
              <select value={formData.room} onChange={handleRoomChange} className="w-full p-2 bg-gray-50 sm:bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8FAFC1]">
                <option value="" disabled>เลือกห้อง</option>
                {occupiedRooms.map((r, idx) => <option key={idx} value={r.room}>{r.room} - {r.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-1 sm:gap-4">
              <label className="text-gray-700 font-medium text-sm sm:text-base">Name</label>
              <input type="text" value={formData.name} readOnly className="w-full p-2 bg-gray-200 border border-gray-300 rounded cursor-not-allowed"  />
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-1 sm:gap-4">
              <label className="text-red-600 font-bold text-sm sm:text-base">Due Date (ครบกำหนด)</label>
              <div className="relative w-full">
                <DatePicker
                  selected={getValidDate(formData.dueDate)}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="วว / ดด / ปปปป"
                  className="w-full p-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none"
                  wrapperClassName="w-full"
                />
                <svg className="w-5 h-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>

            <div className="mt-2 sm:mt-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
              <label className="flex items-center gap-3 text-gray-800 font-bold cursor-pointer mb-2 sm:mb-4 text-sm sm:text-base">
                <input type="checkbox" checked={formData.hasOther} onChange={handleOtherCheck} className="w-4 h-4 sm:w-5 sm:h-5" />
                Add Other (เพิ่มรายการอื่นๆ)
              </label>

              {formData.hasOther && (
                <div className="flex flex-col gap-3 sm:gap-4 mt-3 animate-fade-in-up">
                  <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-1 sm:gap-4">
                    <label className="text-gray-700 font-medium text-sm sm:text-base">Other Detail</label>
                    <select name="otherDetail" value={formData.otherDetail} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded outline-none">
                      <option value="" disabled>เลือกลักษณะรายการ</option>
                      <option value="Deposit">Deposit</option>
                      <option value="Withholding Deposit">Withholding Deposit</option>
                      <option value="Outstanding Payment">Outstanding Payment</option>
                      <option value="Refund">Refund </option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-1 sm:gap-4">
                    <label className="text-gray-700 font-medium text-sm sm:text-base">Amount (THB)</label>
                    <div className="relative w-full">
                      {isRefund && <span className="absolute left-3 top-2.5 font-bold text-red-600">-</span>}
                      <input 
                        type="number" 
                        name="otherAmount" 
                        value={formData.otherAmount} 
                        onChange={handleChange} 
                        className={`w-full p-2 bg-white border border-gray-300 rounded outline-none ${isRefund ? 'pl-6 text-red-600 font-bold' : ''}`} 
                        placeholder="ระบุจำนวนเงิน (THB)" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-1 sm:gap-4 mt-2">
              <label className={`font-medium text-sm sm:text-base ${disableRoomRental ? 'text-gray-400' : 'text-gray-700'}`}>Room Rental (THB)</label>
              <div className="flex gap-2 w-full">
                {isRefund && (
                  <input 
                    type="text" 
                    name="roomRentalRemark" 
                    value={disableRoomRental ? '' : formData.roomRentalRemark} 
                    onChange={handleChange} 
                    disabled={disableRoomRental} 
                    placeholder="Detail" 
                    className={`w-1/2 p-2 border rounded outline-none text-sm ${disableRoomRental ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} 
                  />
                )}
                <input 
                  type="text" 
                  name="roomRental" 
                  value={disableRoomRental ? '' : formData.roomRental} 
                  onChange={handleChange} 
                  disabled={disableRoomRental} 
                  className={`${isRefund ? 'w-1/2' : 'w-full'} p-2 border rounded outline-none ${disableRoomRental ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} 
                />
              </div>
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-1 sm:gap-4">
              <label className={`font-medium text-sm sm:text-base ${disableUtils ? 'text-gray-400' : 'text-gray-700'}`}>Old Electric meter (Unit)</label>
              <input type="number" step="0.1" name="oldElectric" value={disableUtils ? '' : formData.oldElectric} onChange={handleChange} disabled={disableUtils} className={`w-full p-2 border rounded outline-none ${disableUtils ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-1 sm:gap-4">
              <label className={`font-medium text-sm sm:text-base ${disableUtils ? 'text-gray-400' : 'text-gray-700'}`}>New Electric meter (Unit)</label>
              <input type="number" step="0.1" name="newElectric" value={disableUtils ? '' : formData.newElectric} onChange={handleChange} disabled={disableUtils} className={`w-full p-2 border rounded outline-none ${disableUtils ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-1 sm:gap-4">
              <label className={`font-medium text-sm sm:text-base ${disableUtils ? 'text-gray-400' : 'text-gray-700'}`}>Old Water meter (Unit)</label>
              <input type="number" step="0.1" name="oldWater" value={disableUtils ? '' : formData.oldWater} onChange={handleChange} disabled={disableUtils} className={`w-full p-2 border rounded outline-none ${disableUtils ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-1 sm:gap-4">
              <label className={`font-medium text-sm sm:text-base ${disableUtils ? 'text-gray-400' : 'text-gray-700'}`}>New Water meter (Unit)</label>
              <input type="number" step="0.1" name="newWater" value={disableUtils ? '' : formData.newWater} onChange={handleChange} disabled={disableUtils} className={`w-full p-2 border rounded outline-none ${disableUtils ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>

            <div className="flex justify-center mt-6">
              <button onClick={handleNext} className="w-full sm:w-auto bg-[#8FAFC1] hover:bg-[#7a96a8] text-black font-bold py-3 px-16 rounded shadow-md transition-transform active:scale-95 text-lg">
                Next
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 🎯 ส่วนของ Custom Alert Popup */}
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
            
            <p className="text-gray-600 mb-6 font-medium">{alertData.text}</p>
            
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