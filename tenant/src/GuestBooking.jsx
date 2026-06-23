import { useNavigate } from 'react-router-dom';

function GuestBooking() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F0] font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex justify-between items-stretch w-full min-h-[60px] sm:min-h-[80px]">
          <div className="flex gap-4 sm:gap-10 items-center px-[5%]">
            <span onClick={() => navigate('/')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium text-black hover:underline underline-offset-4 decoration-2">Home</span>
            <span onClick={() => navigate('/booking')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium text-black underline underline-offset-4 decoration-2">Booking</span>
            <span onClick={() => navigate('/comment')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium text-black hover:underline underline-offset-4 decoration-2">Comment</span>
          </div>
          <div className="bg-black px-4 sm:px-[30px] flex items-center justify-center">
            <img src="/logo.png" alt="8 Mansions Logo" className="h-[40px] sm:h-[70px] w-auto block object-contain" />
          </div>
        </div>
      </nav>

      {/* Frame 9 Content */}
      <div className="flex-1 flex justify-center items-center p-4">
        <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-lg text-center animate-fade-in-up">
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-8">Registration Method</h2>
          <p className="text-gray-600 mb-8">Please choose how you want to provide your information.</p>
          
          <div className="flex flex-col gap-4">
            <button onClick={() => navigate('/upload-document', { state: { type: 'Passport' } })}
              className="bg-gray-800 hover:bg-black text-white font-bold text-lg py-4 rounded shadow-md transition-colors">
              Upload Passport (Auto-fill)
            </button>
            <button onClick={() => navigate('/upload-document', { state: { type: 'ID Card' } })}
              className="bg-[#8FAFC1] hover:bg-[#7fa1b5] text-white font-bold text-lg py-4 rounded shadow-md transition-colors">
              Upload ID Card (Auto-fill)
            </button>
            
            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="px-3 text-gray-400">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button onClick={() => navigate('/guest-form')}
              className="bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-lg py-4 rounded shadow-sm transition-colors">
              Fill Manually 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestBooking;