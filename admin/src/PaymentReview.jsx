import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function PaymentReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state || {};

  const [formData, setFormData] = useState({
    room: initialData.room || '', name: initialData.name || '', dueDate: initialData.dueDate || '',
    roomRental: initialData.roomRental || '', oldElectric: initialData.oldElectric || '', newElectric: initialData.newElectric || '',
    oldWater: initialData.oldWater || '', newWater: initialData.newWater || '',
    hasOther: initialData.hasOther || false, otherDetail: initialData.otherDetail || '', otherAmount: initialData.otherAmount || ''
  });

  if (!formData.room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EAEAEA] p-4 text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">No data found</h1>
        <button onClick={() => navigate('/admin/payment')} className="bg-[#8FAFC1] px-6 py-2 rounded font-bold">Go Back</button>
      </div>
    );
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  // 🎯 ฟังก์ชันกันพัง 1
  const handleDateChange = (date) => {
    if (!date || isNaN(date.getTime())) {
      setFormData({ ...formData, dueDate: '' });
      return;
    }
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setFormData({ ...formData, dueDate: dateStr });
  };

  // 🎯 ฟังก์ชันกันพัง 2
  const getValidDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  const isDeposit = formData.hasOther && formData.otherDetail === 'Deposit';
  const isWithholding = formData.hasOther && formData.otherDetail === 'Withholding Deposit';
  const disableRoomRental = isWithholding;
  const disableUtils = isWithholding || isDeposit;

  const roomRental = disableRoomRental ? 0 : Number(formData.roomRental) || 0;
  const elecUnit = disableUtils ? 0 : (Number(formData.newElectric) || 0) - (Number(formData.oldElectric) || 0);
  const waterUnit = disableUtils ? 0 : (Number(formData.newWater) || 0) - (Number(formData.oldWater) || 0);
  
  const elecBill = elecUnit * 5; 
  const waterBill = waterUnit * 7; 
  const otherAmt = formData.hasOther ? (Number(formData.otherAmount) || 0) : 0;
  const totalAmount = roomRental + elecBill + waterBill + otherAmt;

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] font-sans">
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md print:hidden">
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

      <div className="flex-1 flex justify-center py-6 sm:py-10 px-4">
        <div className="w-full max-w-3xl bg-white sm:bg-transparent p-5 sm:p-0 rounded-xl shadow-sm sm:shadow-none">
          <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-xl mx-auto text-[14px] sm:text-[15px]">
            
            <div className="flex flex-col sm:grid sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0">
              <label className="text-gray-700 font-bold sm:font-normal">Room</label>
              <div className="w-full p-2 bg-gray-200 border border-gray-300 rounded cursor-not-allowed">{formData.room}</div>
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0">
              <label className="text-gray-700 font-bold sm:font-normal">Name</label>
              <div className="w-full p-2 bg-gray-200 border border-gray-300 rounded cursor-not-allowed">{formData.name}</div>
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0">
              <label className="text-red-600 font-bold">Due Date</label>
              <div className="relative w-full">
                <DatePicker
                  selected={getValidDate(formData.dueDate)}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="วว / ดด / ปปปป"
                  className="w-full p-2 bg-white border border-red-300 rounded outline-none font-bold text-red-600 focus:ring-2 focus:ring-red-200"
                  wrapperClassName="w-full"
                />
                <svg className="w-5 h-5 text-red-400 absolute right-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>

            {formData.hasOther && (
              <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-300 rounded-lg mt-2 mb-2 flex flex-col gap-3">
                <div className="flex flex-col sm:grid sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0">
                  <label className="text-gray-800 font-bold">Other Detail</label>
                  <div className="w-full p-2 bg-yellow-100 border border-yellow-300 rounded font-bold cursor-not-allowed">{formData.otherDetail}</div>
                </div>
                <div className="flex flex-col sm:grid sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0">
                  <label className="text-gray-800 font-bold">Amount (THB)</label>
                  <input type="number" name="otherAmount" value={formData.otherAmount} onChange={handleChange} className="w-full p-2 bg-white border border-yellow-400 rounded outline-none font-bold focus:ring-2 focus:ring-yellow-200" />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:grid sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0 mt-2">
              <label className={`font-bold sm:font-normal ${disableRoomRental ? 'text-gray-400' : 'text-gray-700'}`}>Room Rental (THB)</label>
              <input type="number" name="roomRental" value={disableRoomRental ? '' : formData.roomRental} onChange={handleChange} disabled={disableRoomRental} className={`w-full p-2 border rounded outline-none ${disableRoomRental ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0 mt-2">
              <label className={`font-bold sm:font-normal ${disableUtils ? 'text-gray-400' : 'text-gray-700'}`}>Old Electric meter (Unit)</label>
              <input type="number" step="0.1" name="oldElectric" value={disableUtils ? '' : formData.oldElectric} onChange={handleChange} disabled={disableUtils} className={`w-full p-2 border rounded outline-none ${disableUtils ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0">
              <label className={`font-bold sm:font-normal ${disableUtils ? 'text-gray-400' : 'text-gray-700'}`}>New Electric meter (Unit)</label>
              <input type="number" step="0.1" name="newElectric" value={disableUtils ? '' : formData.newElectric} onChange={handleChange} disabled={disableUtils} className={`w-full p-2 border rounded outline-none ${disableUtils ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0 mt-2">
              <label className={`font-bold sm:font-normal ${disableUtils ? 'text-gray-400' : 'text-gray-700'}`}>Old Water meter (Unit)</label>
              <input type="number" step="0.1" name="oldWater" value={disableUtils ? '' : formData.oldWater} onChange={handleChange} disabled={disableUtils} className={`w-full p-2 border rounded outline-none ${disableUtils ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0">
              <label className={`font-bold sm:font-normal ${disableUtils ? 'text-gray-400' : 'text-gray-700'}`}>New Water meter (Unit)</label>
              <input type="number" step="0.1" name="newWater" value={disableUtils ? '' : formData.newWater} onChange={handleChange} disabled={disableUtils} className={`w-full p-2 border rounded outline-none ${disableUtils ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0 mt-4">
              <label className="text-gray-700 font-bold sm:font-normal">Electric Unit</label>
              <div className="w-full p-2 bg-gray-100 border-b border-gray-300 font-medium">{disableUtils ? '-' : elecUnit.toFixed(1)}</div>
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0">
              <label className="text-gray-700 font-bold sm:font-normal">Water Unit</label>
              <div className="w-full p-2 bg-gray-100 border-b border-gray-300 font-medium">{disableUtils ? '-' : waterUnit.toFixed(1)}</div>
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0 mt-4">
              <label className="text-gray-700 font-bold sm:font-normal">Electric Bill (5 THB/unit)</label>
              <div className="w-full p-2 bg-gray-100 border-b border-gray-300 font-bold text-blue-600">{disableUtils ? '-' : elecBill.toFixed(2)}</div>
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0">
              <label className="text-gray-700 font-bold sm:font-normal">Water Bill (7 THB/unit)</label>
              <div className="w-full p-2 bg-gray-100 border-b border-gray-300 font-bold text-blue-600">{disableUtils ? '-' : waterBill.toFixed(2)}</div>
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-0 mt-4">
              <label className="text-gray-900 font-extrabold text-lg">Total</label>
              <div className="w-full p-2 bg-gray-300 border-b border-gray-400 font-extrabold text-xl sm:text-2xl text-green-700">{totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between mt-6 sm:mt-8 gap-3 sm:gap-0">
              <button onClick={() => navigate(-1)} className="w-full sm:w-auto bg-[#FF0000] hover:bg-[#cc0000] text-black font-bold py-3 sm:py-2 px-10 rounded shadow-sm transition-transform active:scale-95 text-center">
                Back
              </button>
              <button onClick={() => navigate('/admin/payment/checking', { state: formData })} className="w-full sm:w-auto bg-[#8FAFC1] hover:bg-[#7a96a8] text-black font-bold py-3 sm:py-2 px-10 rounded shadow-sm transition-transform active:scale-95 text-center">
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