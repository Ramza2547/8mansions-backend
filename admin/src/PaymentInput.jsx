import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PaymentInput() {
  const navigate = useNavigate();
  const [occupiedRooms, setOccupiedRooms] = useState([]);
  
  const [formData, setFormData] = useState({
    room: '',
    name: '',
    dueDate: '',
    roomRental: '',
    oldElectric: '',
    newElectric: '',
    oldWater: '',
    newWater: '',
    hasOther: false,
    otherDetail: '',
    otherAmount: ''
  });

  const roomNames = ['A1', 'B1', 'C1', 'D1', 'A2', 'B2', 'C2', 'D2'];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('https://eightmansions-backend.onrender.com/api/customers/');
      if (Array.isArray(response.data)) {
        const occupied = [];
        roomNames.forEach((room, index) => {
          if (response.data[index]) {
            occupied.push({ room: room, name: response.data[index].name });
          }
        });
        setOccupiedRooms(occupied);
      }
    } catch (error) {
      console.error("ดึงข้อมูลไม่สำเร็จ", error);
    }
  };

  const handleRoomChange = (e) => {
    const selectedRoom = e.target.value;
    const customer = occupiedRooms.find(r => r.room === selectedRoom);
    setFormData({
      ...formData,
      room: selectedRoom,
      name: customer ? customer.name : ''
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtherCheck = (e) => {
    setFormData({ ...formData, hasOther: e.target.checked, otherDetail: '', otherAmount: '' });
  };

  const isDeposit = formData.hasOther && formData.otherDetail === 'Deposit';
  const isWithholding = formData.hasOther && formData.otherDetail === 'Withholding Deposit';
  const isOutstanding = formData.hasOther && formData.otherDetail === 'Outstanding Payment';
  
  const disableRoomRental = isWithholding; 
  const disableUtils = isWithholding || isDeposit; 

  const handleNext = () => {
    if (!formData.room) return alert('กรุณาเลือกห้องพัก');
    if (!formData.dueDate) return alert('กรุณาระบุวันครบกำหนดชำระ (Due Date)');

    if (formData.hasOther) {
      if (!formData.otherDetail) return alert('กรุณาเลือกรายละเอียดในช่อง Other');
      if (!formData.otherAmount) return alert('กรุณากรอกจำนวนเงินในช่อง Other');
    }

    if (!disableRoomRental && !formData.roomRental) return alert('กรุณากรอกค่าเช่าห้อง (Room Rental)');
    
    if (!disableUtils) {
      if (!formData.oldElectric) return alert('กรุณากรอกมิเตอร์ไฟเก่า');
      if (!formData.newElectric) return alert('กรุณากรอกมิเตอร์ไฟใหม่');
      if (!formData.oldWater) return alert('กรุณากรอกมิเตอร์น้ำเก่า');
      if (!formData.newWater) return alert('กรุณากรอกมิเตอร์น้ำใหม่');

      if (Number(formData.newElectric) < Number(formData.oldElectric)) {
        return alert('มิเตอร์ไฟใหม่ ต้องมากกว่าหรือเท่ากับมิเตอร์เก่าครับ!');
      }
      if (Number(formData.newWater) < Number(formData.oldWater)) {
        return alert('มิเตอร์น้ำใหม่ ต้องมากกว่าหรือเท่ากับมิเตอร์เก่าครับ!');
      }
    }

    navigate('/admin/payment/review', { state: formData });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] font-sans">
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex items-center justify-between min-h-[60px]">
          <div className="flex items-center gap-6 pl-8 py-2 font-bold text-[#1A1A1A]">
            <span className="cursor-pointer px-2 hover:text-white" onClick={() => navigate('/admin')}>Home</span>
            <span className="cursor-pointer px-2 hover:text-white" onClick={() => navigate('/data')}>Data</span>
            <span className="cursor-pointer px-2 underline">Payment</span>
            {/* 🎯 เพิ่ม onClick ให้ Feedback */}
            <span className="cursor-pointer px-2 hover:text-gray-700 transition-colors" onClick={() => navigate('/admin/feedback')}>Feedback</span>
          </div>
          <div className="flex items-center ml-auto">
            <span onClick={() => navigate('/')} className="mr-8 cursor-pointer font-bold hover:text-red-700">Log out</span>
            <div className="bg-black min-h-[60px] px-6 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="h-[40px]" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex justify-center items-center py-10 px-4">
        <div className="w-full max-w-3xl">
          <div className="flex flex-col gap-5 w-full max-w-xl mx-auto">
            
            <div className="grid grid-cols-2 items-center">
              <label className="text-gray-700 font-medium">Choose Room</label>
              <select value={formData.room} onChange={handleRoomChange} className="p-2 bg-white border border-gray-300 rounded focus:outline-none">
                <option value="" disabled>เลือกห้อง</option>
                {occupiedRooms.map((r, idx) => (
                  <option key={idx} value={r.room}>{r.room}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 items-center">
              <label className="text-gray-700 font-medium">Name</label>
              <input type="text" value={formData.name} readOnly className="p-2 bg-gray-200 border border-gray-300 rounded cursor-not-allowed" />
            </div>

            <div className="grid grid-cols-2 items-center">
              <label className="text-red-600 font-bold">Due Date (วันครบกำหนด)</label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="p-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none" />
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
              <label className="flex items-center gap-3 text-gray-800 font-bold cursor-pointer mb-4">
                <input type="checkbox" checked={formData.hasOther} onChange={handleOtherCheck} className="w-5 h-5" />
                Add Other (เพิ่มรายการอื่นๆ)
              </label>

              {formData.hasOther && (
                <div className="flex flex-col gap-4 animate-fade-in-up">
                  <div className="grid grid-cols-2 items-center">
                    <label className="text-gray-700 font-medium">Other Detail</label>
                    <select name="otherDetail" value={formData.otherDetail} onChange={handleChange} className="p-2 bg-white border border-gray-300 rounded outline-none">
                      <option value="" disabled>เลือกลักษณะรายการ</option>
                      <option value="Deposit">Deposit</option>
                      <option value="Withholding Deposit">Withholding Deposit</option>
                      <option value="Outstanding Payment">Outstanding Payment</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 items-center">
                    <label className="text-gray-700 font-medium">Amount (จำนวนเงิน)</label>
                    <input type="number" name="otherAmount" value={formData.otherAmount} onChange={handleChange} className="p-2 bg-white border border-gray-300 rounded outline-none" placeholder="ใส่จำนวนเงิน" />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 items-center mt-2">
              <label className={`font-medium ${disableRoomRental ? 'text-gray-400' : 'text-gray-700'}`}>Room Rental</label>
              <input type="number" name="roomRental" value={disableRoomRental ? '' : formData.roomRental} onChange={handleChange} disabled={disableRoomRental} className={`p-2 border rounded outline-none ${disableRoomRental ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>

            <div className="grid grid-cols-2 items-center">
              <label className={`font-medium ${disableUtils ? 'text-gray-400' : 'text-gray-700'}`}>Old Electric meter</label>
              <input type="number" step="0.1" name="oldElectric" value={disableUtils ? '' : formData.oldElectric} onChange={handleChange} disabled={disableUtils} className={`p-2 border rounded outline-none ${disableUtils ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>

            <div className="grid grid-cols-2 items-center">
              <label className={`font-medium ${disableUtils ? 'text-gray-400' : 'text-gray-700'}`}>New Electric meter</label>
              <input type="number" step="0.1" name="newElectric" value={disableUtils ? '' : formData.newElectric} onChange={handleChange} disabled={disableUtils} className={`p-2 border rounded outline-none ${disableUtils ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>

            <div className="grid grid-cols-2 items-center">
              <label className={`font-medium ${disableUtils ? 'text-gray-400' : 'text-gray-700'}`}>Old Water meter</label>
              <input type="number" step="0.1" name="oldWater" value={disableUtils ? '' : formData.oldWater} onChange={handleChange} disabled={disableUtils} className={`p-2 border rounded outline-none ${disableUtils ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>

            <div className="grid grid-cols-2 items-center">
              <label className={`font-medium ${disableUtils ? 'text-gray-400' : 'text-gray-700'}`}>New Water meter</label>
              <input type="number" step="0.1" name="newWater" value={disableUtils ? '' : formData.newWater} onChange={handleChange} disabled={disableUtils} className={`p-2 border rounded outline-none ${disableUtils ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>

            <div className="flex justify-center mt-6">
              <button onClick={handleNext} className="bg-[#8FAFC1] hover:bg-[#7a96a8] text-black font-bold py-3 px-16 rounded shadow-md transition-transform active:scale-95">
                Next
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentInput;