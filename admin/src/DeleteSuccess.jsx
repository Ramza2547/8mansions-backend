import { useNavigate } from 'react-router-dom';

function DeleteSuccess() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] font-sans">
      {/* Navbar เหมือนหน้า DataPage */}
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex items-center justify-between min-h-[60px] flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 sm:gap-6 pl-3 sm:pl-8 py-2 font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] overflow-x-auto whitespace-nowrap">
            <span className="cursor-pointer px-1 sm:px-2" onClick={() => navigate('/admin')}>Home</span>
            <span className="cursor-pointer px-1 sm:px-2" onClick={() => navigate('/admin/data')}>Data</span>
            <span className="cursor-pointer px-1 sm:px-2">Payment</span>
            <span className="cursor-pointer px-1 sm:px-2">Feedback</span>
          </div>
          <div className="flex items-center ml-auto">
            <span onClick={() => navigate('/')} className="mr-3 sm:mr-8 cursor-pointer font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] whitespace-nowrap hover:text-red-700 transition-colors">Log out</span>
            <div className="bg-black min-h-[60px] px-3 sm:px-6 flex items-center justify-center">
              <img src="/logo.png" alt="8 Mansions Logo" className="h-[25px] sm:h-[40px]" />
            </div>
          </div>
        </div>
      </nav>

      {/* Content ลบสำเร็จ (Frame 33) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-[#1A1A1A] mb-16 tracking-wide">
          Delete success fully!
        </h1>
        
        <button 
          onClick={() => navigate('/admin')} 
          className="bg-[#92B0C3] hover:bg-[#7a96a8] text-black font-medium text-xl md:text-2xl py-4 px-10 shadow-md transition-transform active:scale-95"
        >
          Go back to home
        </button>
      </div>
    </div>
  );
}

export default DeleteSuccess;