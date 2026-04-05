import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 🎯 อย่าลืม import axios

function GuestComment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    room: '',
    comment: ''
  });

  const roomNames = ['A1', 'B1', 'C1', 'D1', 'A2', 'B2', 'C2', 'D2'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.room) {
      alert('Please select your Room Number.');
      return;
    }
    if (!formData.comment.trim()) {
      alert('Please write a comment before sending.');
      return;
    }

    try {
      // 🎯 ยิงข้อมูลขึ้น Backend (เหมือนที่ทำใน GuestBooking)
      await axios.post('https://eightmansions-backend.onrender.com/api/feedbacks/', formData);
      navigate('/comment/success');
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('Failed to send comment. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F0] font-sans">
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex justify-between items-stretch w-full min-h-[80px]">
          <div className="flex gap-6 sm:gap-10 items-center px-[5%]">
            <span onClick={() => navigate('/')} className="cursor-pointer text-[16px] sm:text-[18px] font-medium text-black hover:underline">Home</span>
            <span onClick={() => navigate('/booking')} className="cursor-pointer text-[16px] sm:text-[18px] font-medium text-black hover:underline">Booking</span>
            <span className="cursor-pointer text-[16px] sm:text-[18px] font-medium text-black underline underline-offset-4 decoration-2">Comment</span>
          </div>
          <div className="bg-black px-4 sm:px-[30px] flex items-center justify-center">
            <img src="/logo.png" alt="8 Mansions Logo" className="h-[50px] sm:h-[70px] w-auto" />
          </div>
        </div>
      </nav>

      <div className="flex-1 flex justify-center items-center p-6">
        <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-6 text-[#1A1A1A]">Please put your room number and comment</h2>
          
          <form onSubmit={handleSend} className="flex flex-col gap-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Room Number</label>
              <select 
                name="room" 
                value={formData.room} 
                onChange={handleChange}
                className="w-full md:w-1/3 p-3 bg-gray-200 border-none rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none cursor-pointer" 
              >
                <option value="" disabled>Select Room</option>
                {roomNames.map((room) => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-bold mb-2">Comment</label>
              <textarea 
                name="comment" 
                rows="5"
                placeholder="Ex. Fast service..."
                value={formData.comment} 
                onChange={handleChange}
                className="w-full p-4 bg-gray-200 border-none rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none resize-none" 
              />
            </div>

            <div className="flex justify-between mt-4">
              <button type="button" onClick={() => navigate('/')} className="bg-[#FF0000] hover:bg-red-700 text-white font-bold py-2 px-10 rounded shadow transition-colors">
                Back
              </button>
              <button type="submit" className="bg-[#8FAFC1] hover:bg-[#7a96a8] text-black font-bold py-2 px-10 rounded shadow transition-colors">
                Send
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default GuestComment;