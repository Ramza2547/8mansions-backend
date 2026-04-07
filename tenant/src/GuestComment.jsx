import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function GuestComment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ room: '', comment: '' });
  const roomNames = ['A1', 'B1', 'C1', 'D1', 'A2', 'B2', 'C2', 'D2'];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.room) return alert('Please select your Room Number.');
    if (!formData.comment.trim()) return alert('Please write a comment before sending.');

    try {
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
        <div className="bg-white p-6 sm:p-8 md:p-12 rounded-lg shadow-xl w-full max-w-2xl">
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
    </div>
  );
}

export default GuestComment;