import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function GuestComment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ room: '', comment: '' });
  const roomNames = ['A1', 'B1', 'C1', 'D1', 'A2', 'B2', 'C2', 'D2'];

  // 🎯 เพิ่ม State สำหรับจัดการ Custom Alert Popup
  const [alertData, setAlertData] = useState({ show: false, type: '', text: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSend = async (e) => {
    e.preventDefault();
    
    // 🎯 เปลี่ยนจากการใช้ alert() ปกติ มาเรียกใช้ Custom Alert แทน
    if (!formData.room) {
      setAlertData({ show: true, type: 'warning', text: 'Please select your Room Number.' });
      return;
    }
    if (!formData.comment.trim()) {
      setAlertData({ show: true, type: 'warning', text: 'Please write a comment before sending.' });
      return;
    }

    try {
      await axios.post('https://eightmansions-backend.onrender.com/api/feedbacks/', formData);
      navigate('/comment/success');
    } catch (error) {
      console.error('Error sending feedback:', error);
      setAlertData({ show: true, type: 'error', text: 'Failed to send comment. Please try again.' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F0] font-sans relative">
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex justify-between items-stretch w-full min-h-[60px] sm:min-h-[80px]">
          <div className="flex gap-4 sm:gap-10 items-center px-[5%]">
            <span onClick={() => navigate('/')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium text-black hover:underline">Home</span>
            <span onClick={() => navigate('/booking')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium text-black hover:underline">Booking</span>
            <span className="cursor-pointer text-[14px] sm:text-[18px] font-medium text-black underline underline-offset-4 decoration-2">Comment</span>
          </div>
          <div className="bg-black px-4 sm:px-[30px] flex items-center justify-center">
            <img src="/logo.png" alt="8 Mansions Logo" className="h-[40px] sm:h-[70px] w-auto" />
          </div>
        </div>
      </nav>

      <div className="flex-1 flex justify-center items-center p-4 sm:p-6">
        <div className="bg-white p-6 sm:p-8 md:p-12 rounded-lg shadow-xl w-full max-w-2xl relative z-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[#1A1A1A] text-center sm:text-left">Please put your room number and comment</h2>
          
          <form onSubmit={handleSend} className="flex flex-col gap-5 sm:gap-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm sm:text-base">Room Number</label>
              <select 
                name="room" 
                value={formData.room} 
                onChange={handleChange}
                className="w-full sm:w-1/2 p-3 bg-gray-200 border-none rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none cursor-pointer text-sm sm:text-base" 
              >
                <option value="" disabled>Select Room</option>
                {roomNames.map((room) => <option key={room} value={room}>{room}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm sm:text-base">Comment</label>
              <textarea 
                name="comment" 
                rows="5"
                placeholder="Ex. Fast service..."
                value={formData.comment} 
                onChange={handleChange}
                className="w-full p-4 bg-gray-200 border-none rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none resize-none text-sm sm:text-base" 
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between mt-4 gap-3 sm:gap-0">
              <button type="button" onClick={() => navigate('/')} className="w-full sm:w-auto bg-[#FF0000] hover:bg-red-700 text-white font-bold py-3 sm:py-2 px-10 rounded shadow transition-colors text-center">
                Back
              </button>
              <button type="submit" className="w-full sm:w-auto bg-[#8FAFC1] hover:bg-[#7a96a8] text-black font-bold py-3 sm:py-2 px-10 rounded shadow transition-colors text-center">
                Send
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🎯 ส่วนของ Custom Alert Popup */}
      {alertData.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[110] p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col items-center text-center transform transition-all scale-100">
            
            {/* ไอคอนแจ้งเตือน */}
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
            
            {/* หัวข้อแจ้งเตือน */}
            <h3 className={`text-xl font-extrabold mb-2 
              ${alertData.type === 'error' ? 'text-red-700' : ''}
              ${alertData.type === 'warning' ? 'text-yellow-600' : ''}
            `}>
              {alertData.type === 'error' && 'Error!'}
              {alertData.type === 'warning' && 'Please Check'}
            </h3>
            
            {/* ข้อความแจ้งเตือน */}
            <p className="text-gray-600 mb-6 font-medium">{alertData.text}</p>
            
            {/* ปุ่มตกลงปิด Popup */}
            <button
              onClick={() => setAlertData({ show: false, type: '', text: '' })}
              className={`px-8 py-3 font-bold text-white rounded-xl transition-transform active:scale-95 w-full shadow-md 
                ${alertData.type === 'error' ? 'bg-[#E74C3C] hover:bg-[#C0392B]' : ''}
                ${alertData.type === 'warning' ? 'bg-[#F39C12] hover:bg-[#D68910]' : ''}
              `}
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default GuestComment;