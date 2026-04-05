import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function PaymentReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state || {};

  const [formData, setFormData] = useState({
    room: initialData.room || '',
    name: initialData.name || '',
    dueDate: initialData.dueDate || '',
    roomRental: initialData.roomRental || '',
    oldElectric: initialData.oldElectric || '',
    newElectric: initialData.newElectric || '',
    oldWater: initialData.oldWater || '',
    newWater: initialData.newWater || '',
    hasOther: initialData.hasOther || false,
    otherDetail: initialData.otherDetail || '',
    otherAmount: initialData.otherAmount || ''
  });

  if (!formData.room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EAEAEA]">
        <h1 className="text-2xl font-bold mb-4">No data found</h1>
        <button onClick={() => navigate('/admin/payment')} className="bg-[#8FAFC1] px-6 py-2">Go Back</button>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🎯 ดึง Logic ปิดช่องกรอกมาใช้ในหน้านี้ด้วย
  const isDeposit = formData.hasOther && formData.otherDetail === 'Deposit';
  const isWithholding = formData.hasOther && formData.otherDetail === 'Withholding Deposit';
  const disableRoomRental = isWithholding;
  const disableUtils = isWithholding || isDeposit;

  // 🎯 คำนวณ (ถ้าช่องไหนถูก Disable ให้มองเป็นค่า 0 ไปเลย)
  const roomRental = disableRoomRental ? 0 : Number(formData.roomRental) || 0;
  const elecUnit = disableUtils ? 0 : (Number(formData.newElectric) || 0) - (Number(formData.oldElectric) || 0);
  const waterUnit = disableUtils ? 0 : (Number(formData.newWater) || 0) - (Number(formData.oldWater) || 0);
  
  const elecBill = elecUnit * 5; 
  const waterBill = waterUnit * 7; 
  const otherAmt = formData.hasOther ? (Number(formData.otherAmount) || 0) : 0;

  const totalAmount = roomRental + elecBill + waterBill + otherAmt;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] font-sans">
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex items-center justify-between min-h-[60px]">
          <div className="flex items-center gap-6 pl-8 py-2 font-bold text-[#1A1A1A]">
            <span className="cursor-pointer px-2" onClick={() => navigate('/admin')}>Home</span>
            <span className="cursor-pointer px-2" onClick={() => navigate('/data')}>Data</span>
            <span className="cursor-pointer px-2 underline">Payment</span>
            <span className="cursor-pointer px-2">Feedback</span>
          </div>
          <div className="flex items-center ml-auto">
            <span onClick={() => navigate('/')} className="mr-8 cursor-pointer font-bold hover:text-red-700">Log out</span>
            <div className="bg-black min-h-[60px] px-6 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="h-[40px]" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex justify-center py-10 px-4">
        <div className="w-full max-w-3xl">
          <div className="flex flex-col gap-4 w-full max-w-xl mx-auto text-[15px]">
            
            <div className="grid grid-cols-2 items-center">
              <label className="text-gray-700">Room</label>
              <div className="p-2 bg-gray-200 border border-gray-300 rounded cursor-not-allowed">{formData.room}</div>
            </div>

            <div className="grid grid-cols-2 items-center">
              <label className="text-gray-700">Name</label>
              <div className="p-2 bg-gray-200 border border-gray-300 rounded cursor-not-allowed">{formData.name}</div>
            </div>

            <div className="grid grid-cols-2 items-center">
              <label className="text-red-600 font-bold">Due Date</label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="p-2 bg-white border border-red-300 rounded outline-none font-bold text-red-600" />
            </div>

            {/* 🎯 ส่วน Other ที่แก้ไขจำนวนเงินได้ */}
            {formData.hasOther && (
              <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg mt-2 mb-2 flex flex-col gap-3">
                <div className="grid grid-cols-2 items-center">
                  <label className="text-gray-800 font-bold">Other Detail</label>
                  <div className="p-2 bg-yellow-100 border border-yellow-300 rounded font-bold cursor-not-allowed">{formData.otherDetail}</div>
                </div>
                <div className="grid grid-cols-2 items-center">
                  <label className="text-gray-800 font-bold">Amount (แก้ไขได้)</label>
                  <input type="number" name="otherAmount" value={formData.otherAmount} onChange={handleChange} className="p-2 bg-white border border-yellow-400 rounded outline-none font-bold" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 items-center mt-2">
              <label className={`font-bold ${disableRoomRental ? 'text-gray-400' : 'text-gray-700'}`}>Room Rental</label>
              <input type="number" name="roomRental" value={disableRoomRental ? '' : formData.roomRental} onChange={handleChange} disabled={disableRoomRental} className={`p-2 border rounded outline-none ${disableRoomRental ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>

            <div className="grid grid-cols-2 items-center mt-2">
              <label className={`font-bold ${disableUtils ? 'text-gray-400' : 'text-gray-700'}`}>Old Electric meter</label>
              <input type="number" step="0.1" name="oldElectric" value={disableUtils ? '' : formData.oldElectric} onChange={handleChange} disabled={disableUtils} className={`p-2 border rounded outline-none ${disableUtils ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>
            <div className="grid grid-cols-2 items-center">
              <label className={`font-bold ${disableUtils ? 'text-gray-400' : 'text-gray-700'}`}>New Electric meter</label>
              <input type="number" step="0.1" name="newElectric" value={disableUtils ? '' : formData.newElectric} onChange={handleChange} disabled={disableUtils} className={`p-2 border rounded outline-none ${disableUtils ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>

            <div className="grid grid-cols-2 items-center mt-2">
              <label className={`font-bold ${disableUtils ? 'text-gray-400' : 'text-gray-700'}`}>Old Water meter</label>
              <input type="number" step="0.1" name="oldWater" value={disableUtils ? '' : formData.oldWater} onChange={handleChange} disabled={disableUtils} className={`p-2 border rounded outline-none ${disableUtils ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>
            <div className="grid grid-cols-2 items-center">
              <label className={`font-bold ${disableUtils ? 'text-gray-400' : 'text-gray-700'}`}>New Water meter</label>
              <input type="number" step="0.1" name="newWater" value={disableUtils ? '' : formData.newWater} onChange={handleChange} disabled={disableUtils} className={`p-2 border rounded outline-none ${disableUtils ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>

            {/* ผลลัพธ์ */}
            <div className="grid grid-cols-2 items-center mt-4">
              <label className="text-gray-700">Electric Unit</label>
              <div className="p-2 bg-gray-100 border-b border-gray-300 font-medium">{disableUtils ? '-' : elecUnit.toFixed(1)}</div>
            </div>
            <div className="grid grid-cols-2 items-center">
              <label className="text-gray-700">Water Unit</label>
              <div className="p-2 bg-gray-100 border-b border-gray-300 font-medium">{disableUtils ? '-' : waterUnit.toFixed(1)}</div>
            </div>

            <div className="grid grid-cols-2 items-center mt-4">
              <label className="text-gray-700">Electric Bill (5 Baht per 1 unit)</label>
              <div className="p-2 bg-gray-100 border-b border-gray-300 font-bold text-blue-600">{disableUtils ? '-' : elecBill.toFixed(2)}</div>
            </div>
            <div className="grid grid-cols-2 items-center">
              <label className="text-gray-700">Water Bill (7 Baht per 1 unit)</label>
              <div className="p-2 bg-gray-100 border-b border-gray-300 font-bold text-blue-600">{disableUtils ? '-' : waterBill.toFixed(2)}</div>
            </div>

            <div className="grid grid-cols-2 items-center mt-4">
              <label className="text-gray-900 font-bold">Total</label>
              <div className="p-2 bg-gray-300 border-b border-gray-400 font-extrabold text-xl text-green-700">{totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => navigate(-1)} className="bg-[#FF0000] hover:bg-[#cc0000] text-black font-bold py-2 px-10 rounded shadow-sm transition-transform active:scale-95">
                Back
              </button>
              <button onClick={() => navigate('/admin/payment/checking', { state: formData })} className="bg-[#8FAFC1] hover:bg-[#7a96a8] text-black font-bold py-2 px-10 rounded shadow-sm transition-transform active:scale-95">
                Next
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentReview;