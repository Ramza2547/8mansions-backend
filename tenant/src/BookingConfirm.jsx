import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';

function BookingConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, hasSecondTenant, room } = location.state || {};
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🎯 State สำหรับ Custom Alert Popup
  const [alertMessage, setAlertMessage] = useState({ show: false, type: '', text: '' });

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '-';
    return dateStr; 
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    
    const convertToDbDate = (dateStr) => {
      if (!dateStr || !dateStr.includes('/')) return dateStr;
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    };

    const dataToSubmit = { 
      ...formData, 
      room: room,
      date_of_birth: convertToDbDate(formData.date_of_birth),
      date_of_birth_2: convertToDbDate(formData.date_of_birth_2),
      lease_start: convertToDbDate(formData.lease_start),
      lease_end: convertToDbDate(formData.lease_end),
    };

    if (!hasSecondTenant) {
      dataToSubmit.name_2 = '';
      dataToSubmit.nationality_2 = '';
      dataToSubmit.date_of_birth_2 = null;
    }

    try {
      await axios.post('https://eightmansions-backend.onrender.com/api/customers/', dataToSubmit);
      navigate('/booking-success'); 
    } catch (error) {
      console.error('Error syncing data:', error);
      // 🎯 เปลี่ยนจากการใช้ window.alert เป็น Custom Popup
      setAlertMessage({ 
        show: true, 
        type: 'error', 
        text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลจองห้องพัก\nกรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้งครับ' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F0] font-sans relative">
      
      {/* 🎯 Custom Alert Popup */}
      {alertMessage.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[110] p-4 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h3 className="text-xl font-extrabold mb-2 text-red-700">Submit Failed</h3>
            <p className="text-gray-600 mb-6 font-medium whitespace-pre-line">{alertMessage.text}</p>
            <button onClick={() => setAlertMessage({ show: false, type: '', text: '' })} className="px-8 py-3 font-bold text-white rounded-full transition-transform active:scale-95 w-full shadow-md bg-[#E74C3C] hover:bg-[#C0392B]">
              OK
            </button>
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex justify-between items-stretch w-full min-h-[60px] sm:min-h-[80px]">
          <div className="flex gap-4 sm:gap-10 items-center px-[5%]">
            <span onClick={() => navigate('/')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium hover:underline">Home</span>
            <span onClick={() => navigate('/booking')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium underline">Booking</span>
            <span onClick={() => navigate('/comment')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium hover:underline">Comment</span>
          </div>
          <div className="bg-black px-4 sm:px-[30px] flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="h-[40px] sm:h-[70px] w-auto block" />
          </div>
        </div>
      </nav>

      <div className="flex-1 flex justify-center items-center p-4">
        {/* 🎯 ปรับ Responsive Container */}
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-xl w-full max-w-lg my-6 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-[#1A1A1A]">Booking Room</h2>
          
          <div className="flex flex-col gap-4 text-sm sm:text-lg bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100">
            <div className="flex flex-col border-b pb-2">
              <span className="font-bold text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider mb-0.5">Tenant 1 Name</span>
              <span className="text-gray-800 font-semibold truncate">{formData?.name || '-'}</span>
            </div>
            <div className="flex flex-col border-b pb-2">
              <span className="font-bold text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider mb-0.5">Nationality</span>
              <span className="text-gray-800 font-semibold">{formData?.nationality || '-'}</span>
            </div>
            <div className="flex flex-col border-b pb-2">
              <span className="font-bold text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider mb-0.5">Date of Birth</span>
              <span className="text-gray-800 font-semibold">{formatDateDisplay(formData?.date_of_birth)}</span>
            </div>

            {hasSecondTenant && (
              <div className="mt-2 pt-2 border-t-2 border-dashed border-gray-200 flex flex-col gap-4">
                <div className="flex flex-col border-b pb-2">
                  <span className="font-bold text-green-700 text-[10px] sm:text-xs uppercase tracking-wider mb-0.5">Tenant 2 Name</span>
                  <span className="text-gray-800 font-semibold truncate">{formData?.name_2 || '-'}</span>
                </div>
                <div className="flex flex-col border-b pb-2">
                  <span className="font-bold text-green-700 text-[10px] sm:text-xs uppercase tracking-wider mb-0.5">Nationality (T2)</span>
                  <span className="text-gray-800 font-semibold">{formData?.nationality_2 || '-'}</span>
                </div>
                <div className="flex flex-col border-b pb-2">
                  <span className="font-bold text-green-700 text-[10px] sm:text-xs uppercase tracking-wider mb-0.5">Date of Birth (T2)</span>
                  <span className="text-gray-800 font-semibold">{formatDateDisplay(formData?.date_of_birth_2)}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center bg-orange-50 border border-orange-100 p-3 rounded-lg mt-2">
              <span className="font-bold text-orange-800 text-sm sm:text-base">Selected Room:</span>
              <span className="font-extrabold text-xl sm:text-2xl text-orange-600">Room {room}</span>
            </div>
          </div>

          {/* 🎯 จัดปุ่มให้ Responsive บนจอมือถือเล็กๆ */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button onClick={() => navigate(-1)} disabled={isSubmitting}
              className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow text-center active:scale-95 transition-all disabled:bg-gray-400">
              Back
            </button>
            <button onClick={handleConfirm} disabled={isSubmitting}
              className="w-full sm:flex-1 bg-[#8FAFC1] hover:bg-[#7fa1b5] text-white font-bold py-3 rounded-lg shadow text-center active:scale-95 transition-all disabled:bg-gray-400">
              {isSubmitting ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirm;