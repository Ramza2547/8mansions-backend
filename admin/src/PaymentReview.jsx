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
    roomRentalRemark: initialData.roomRentalRemark || '', roomRental: initialData.roomRental || '', 
    oldElectric: initialData.oldElectric || '', newElectric: initialData.newElectric || '',
    oldWater: initialData.oldWater || '', newWater: initialData.newWater || '',
    hasOther: initialData.hasOther || false, otherDetail: initialData.otherDetail || '', otherAmount: initialData.otherAmount || ''
  });

  if (!formData.room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F7F9] p-4 text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-gray-700">No data found</h1>
        <button onClick={() => navigate('/admin/payment')} className="bg-[#2C3E50] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-black transition-colors">Go Back</button>
      </div>
    );
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
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

  // ดักจับเครื่องหมายลบในยอด Room Rental ให้มีค่าเป็น 0 เพื่อไม่ให้ผลรวมพัง
  const roomRental = disableRoomRental || formData.roomRental === '-' ? 0 : Number(formData.roomRental) || 0;
  
  const elecUnit = disableUtils ? 0 : (Number(formData.newElectric) || 0) - (Number(formData.oldElectric) || 0);
  const waterUnit = disableUtils ? 0 : (Number(formData.newWater) || 0) - (Number(formData.oldWater) || 0);
  
  const elecBill = elecUnit * 5; 
  const waterBill = waterUnit * 7; 
  
  let otherAmt = formData.hasOther ? (Number(formData.otherAmount) || 0) : 0;
  if (isRefund) {
    otherAmt = -Math.abs(otherAmt); 
  }

  const totalAmount = roomRental + elecBill + waterBill + otherAmt;

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F7F9] font-sans relative">
      {/* 🟢 Navbar (คงเดิม 100%) */}
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

      <div className="flex-1 flex justify-center py-8 sm:py-12 px-4 animate-fade-in">
        
        {/* 🌟 White Card Container */}
        <div className="w-full max-w-3xl bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
          
          {/* 🌟 Form Header */}
          <div className="mb-8 border-b border-gray-100 pb-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] flex items-center gap-3">
              <div className="p-2 bg-[#8FAFC1]/20 rounded-lg text-[#2C3E50]">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              </div>
              Review Payment Invoice
            </h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Please review the calculated billing details before proceeding to the final step.</p>
          </div>

          <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-2xl mx-auto text-[14px] sm:text-[15px]">
            
            {/* 🌟 Section 1: Room & Resident Info */}
            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
              <label className="text-gray-800 font-bold">Room</label>
              <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed font-bold text-gray-700">{formData.room}</div>
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
              <label className="text-gray-800 font-bold">Name</label>
              <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed font-medium text-gray-600">{formData.name}</div>
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
              <label className="text-red-600 font-extrabold">Due Date</label>
              <div className="relative w-full">
                <DatePicker
                  selected={getValidDate(formData.dueDate)}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD / MM / YYYY"
                  className="w-full p-3 bg-red-50/50 border border-red-200 rounded-xl outline-none font-bold text-red-600 focus:ring-2 focus:ring-red-200 transition-all shadow-sm"
                  wrapperClassName="w-full"
                />
                <svg className="w-5 h-5 text-red-400 absolute right-4 top-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>

            {/* 🌟 Section 2: Other Detail (Premium Box) */}
            {formData.hasOther && (
              <div className={`p-5 rounded-xl mt-2 flex flex-col gap-4 shadow-sm border ${isRefund ? 'bg-gradient-to-br from-red-50 to-white border-red-200' : 'bg-gradient-to-br from-yellow-50 to-white border-yellow-200'}`}>
                <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
                  <label className={`font-bold ${isRefund ? 'text-red-800' : 'text-yellow-800'}`}>Other Detail</label>
                  <div className={`w-full p-3 border rounded-xl font-bold cursor-not-allowed ${isRefund ? 'bg-red-100/50 border-red-200 text-red-700' : 'bg-yellow-100/50 border-yellow-200 text-yellow-700'}`}>
                    {formData.otherDetail}
                  </div>
                </div>
                <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
                  <label className={`font-bold ${isRefund ? 'text-red-800' : 'text-yellow-800'}`}>Amount (THB)</label>
                  <div className="relative w-full">
                    {isRefund && <span className="absolute left-3 top-3.5 font-extrabold text-red-600">-</span>}
                    <input 
                      type="number" 
                      name="otherAmount" 
                      value={formData.otherAmount} 
                      onChange={handleChange} 
                      className={`w-full p-3 bg-white border rounded-xl outline-none font-bold shadow-sm transition-all ${isRefund ? 'border-red-300 focus:ring-2 focus:ring-red-200 pl-7 text-red-600' : 'border-yellow-300 focus:ring-2 focus:ring-yellow-200 text-gray-800'}`} 
                    />
                  </div>
                </div>
              </div>
            )}

            <hr className="border-gray-100 my-2" />

            {/* 🌟 Section 3: Room Rental */}
            <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
              {isRefund || disableRoomRental ? (
                  <label className="hidden sm:block"></label>
              ) : (
                  <label className={`font-bold ${disableRoomRental ? 'text-gray-400' : 'text-gray-800'}`}>
                    Room Rental (THB)
                  </label>
              )}
              
              <div className={`flex gap-2 w-full ${isRefund ? 'col-span-2 sm:col-span-1' : ''}`}> 
                {isRefund && (
                  <div className={`w-1/2 p-3 border rounded-xl text-sm overflow-hidden whitespace-nowrap text-ellipsis ${disableRoomRental ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-50 border-gray-200 text-gray-700 shadow-sm'}`}>
                    {formData.roomRentalRemark ? `(${formData.roomRentalRemark})` : '-'}
                  </div>
                )}
                <input 
                  type="text" 
                  name="roomRental" 
                  value={disableRoomRental ? '' : formData.roomRental} 
                  onChange={handleChange} 
                  disabled={disableRoomRental} 
                  placeholder="ยอดค่าเช่า..."
                  className={`${isRefund ? 'w-1/2' : 'w-full'} p-3 border rounded-xl outline-none font-medium shadow-sm transition-all ${disableRoomRental ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#8FAFC1] focus:bg-white text-gray-800'}`} 
                />
              </div>
            </div>

            {/* 🌟 Section 4: Utilities Inputs */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex flex-col gap-4 mt-2">
              <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
                <label className={`font-bold flex items-center gap-2 ${disableUtils ? 'text-gray-400' : 'text-gray-800'}`}>⚡ Old Electric (Unit)</label>
                <input type="number" step="0.1" name="oldElectric" value={disableUtils ? '' : formData.oldElectric} onChange={handleChange} disabled={disableUtils} className={`w-full p-3 border rounded-xl outline-none transition-all shadow-sm ${disableUtils ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-200 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
              </div>
              <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
                <label className={`font-bold flex items-center gap-2 ${disableUtils ? 'text-gray-400' : 'text-gray-800'}`}>⚡ New Electric (Unit)</label>
                <input type="number" step="0.1" name="newElectric" value={disableUtils ? '' : formData.newElectric} onChange={handleChange} disabled={disableUtils} className={`w-full p-3 border rounded-xl outline-none transition-all shadow-sm ${disableUtils ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-200 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
              </div>
            </div>

            <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-100/50 flex flex-col gap-4">
              <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
                <label className={`font-bold flex items-center gap-2 ${disableUtils ? 'text-gray-400' : 'text-gray-800'}`}>💧 Old Water (Unit)</label>
                <input type="number" step="0.1" name="oldWater" value={disableUtils ? '' : formData.oldWater} onChange={handleChange} disabled={disableUtils} className={`w-full p-3 border rounded-xl outline-none transition-all shadow-sm ${disableUtils ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-200 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
              </div>
              <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-2 sm:gap-6">
                <label className={`font-bold flex items-center gap-2 ${disableUtils ? 'text-gray-400' : 'text-gray-800'}`}>💧 New Water (Unit)</label>
                <input type="number" step="0.1" name="newWater" value={disableUtils ? '' : formData.newWater} onChange={handleChange} disabled={disableUtils} className={`w-full p-3 border rounded-xl outline-none transition-all shadow-sm ${disableUtils ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-200 focus:ring-2 focus:ring-[#8FAFC1]'}`} />
              </div>
            </div>

            {/* 🌟 Section 5: Calculation Summary */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl mt-4 flex flex-col gap-4">
              <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs border-b border-gray-200 pb-2 mb-2">Calculated Bills</h3>
              
              <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-1 sm:gap-6">
                <label className="text-gray-600 font-bold">Electric Unit</label>
                <div className="w-full p-2 text-right font-medium text-gray-700">{disableUtils ? '-' : elecUnit.toFixed(1)} <span className="text-xs text-gray-400 ml-1">Units</span></div>
              </div>
              <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-1 sm:gap-6">
                <label className="text-gray-600 font-bold">Water Unit</label>
                <div className="w-full p-2 text-right font-medium text-gray-700">{disableUtils ? '-' : waterUnit.toFixed(1)} <span className="text-xs text-gray-400 ml-1">Units</span></div>
              </div>

              <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-1 sm:gap-6 mt-2">
                <label className="text-gray-800 font-bold">Electric Bill <span className="text-xs text-gray-500 font-normal">(5 THB/unit)</span></label>
                <div className="w-full p-2 bg-white border border-gray-200 rounded-lg text-right font-bold text-blue-600 shadow-sm">{disableUtils ? '-' : `฿ ${elecBill.toLocaleString('en-US', {minimumFractionDigits: 2})}`}</div>
              </div>
              <div className="flex flex-col sm:grid sm:grid-cols-[1fr_2fr] items-start sm:items-center gap-1 sm:gap-6">
                <label className="text-gray-800 font-bold">Water Bill <span className="text-xs text-gray-500 font-normal">(7 THB/unit)</span></label>
                <div className="w-full p-2 bg-white border border-gray-200 rounded-lg text-right font-bold text-cyan-600 shadow-sm">{disableUtils ? '-' : `฿ ${waterBill.toLocaleString('en-US', {minimumFractionDigits: 2})}`}</div>
              </div>
            </div>

            {/* 🌟 Section 6: Grand Total Highlights */}
            <div className={`mt-4 p-6 rounded-xl border-2 flex flex-col sm:flex-row justify-between items-center gap-3 transition-colors ${totalAmount < 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${totalAmount < 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <label className="text-gray-900 font-extrabold text-xl uppercase tracking-wider">Grand Total</label>
              </div>
              <div className={`font-black text-3xl sm:text-4xl tracking-tight ${totalAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {totalAmount < 0 ? '-' : ''}฿{Math.abs(totalAmount).toLocaleString('en-US', {minimumFractionDigits: 2})}
              </div>
            </div>

            {/* 🌟 Section 7: Modern Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end mt-8 gap-4 sm:gap-4 border-t border-gray-100 pt-6">
              <button 
                onClick={() => navigate(-1)} 
                className="w-full sm:w-auto min-w-[150px] bg-white border-2 border-[#E74C3C] text-[#E74C3C] hover:bg-[#E74C3C] hover:text-white font-bold py-3 px-8 rounded-full transition-all active:scale-95 text-center flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back
              </button>
              <button 
                onClick={() => navigate('/admin/payment/checking', { state: formData })} 
                className="w-full sm:w-auto min-w-[200px] bg-[#2C3E50] hover:bg-black text-white font-extrabold py-3 px-10 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 text-center flex justify-center items-center gap-2"
              >
                Confirm Details
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentReview;