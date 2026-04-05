import { useNavigate } from 'react-router-dom';

function GuestCommentSuccess() {
  const navigate = useNavigate();

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

      <div className="flex-1 flex flex-col justify-center items-center p-6">
        <h1 className="text-4xl md:text-6xl font-extrabold text-[#1A1A1A] mb-8">
          Success fully!
        </h1>
        <button onClick={() => navigate('/')} className="mt-4 text-[#8FAFC1] font-bold hover:text-gray-700 underline underline-offset-4">
          Return to Home
        </button>
      </div>
    </div>
  );
}

export default GuestCommentSuccess;