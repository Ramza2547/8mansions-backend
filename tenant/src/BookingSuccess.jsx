import { useNavigate } from 'react-router-dom';

function BookingSuccess() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F0] font-sans">
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex justify-between items-stretch w-full min-h-[80px]">
          <div className="flex gap-10 items-center px-[5%]">
            <span onClick={() => navigate('/')} className="cursor-pointer text-[18px] font-medium hover:underline">Home</span>
            <span onClick={() => navigate('/booking')} className="cursor-pointer text-[18px] font-medium underline">Booking</span>
            <span onClick={() => navigate('/comment')} className="cursor-pointer text-[18px] font-medium hover:underline">Comment</span>
          </div>
          <div className="bg-black px-[30px] flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="h-[70px] w-auto block" />
          </div>
        </div>
      </nav>

      <div className="flex-1 flex justify-center items-center p-4">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-5xl font-bold text-black mb-8">Success fully!</h1>
          <button onClick={() => navigate('/')} className="bg-black text-white font-bold py-3 px-10 rounded-full hover:bg-gray-800 transition">
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingSuccess;