import { useNavigate } from 'react-router-dom';

function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] font-sans">
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex items-center justify-between min-h-[60px]">
          <div className="flex items-center gap-6 pl-8 py-2 font-bold text-[#1A1A1A]">
            <span className="cursor-pointer px-2" onClick={() => navigate('/admin')}>Home</span>
            <span className="cursor-pointer px-2" onClick={() => navigate('/data')}>Data</span>
            <span className="cursor-pointer px-2 underline">Payment</span>
            <span className="cursor-pointer px-2">Feedback</span>
          </div>
          <div className="flex items-center ml-auto">
            <span onClick={() => navigate('/')} className="mr-8 cursor-pointer font-bold hover:text-red-700">Log out</span>
            <div className="bg-black min-h-[60px] px-6 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="h-[40px]" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col justify-center items-center py-10 px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-[#1A1A1A] mb-8">
          Success fully!
        </h1>
        {/* เผื่ออยากให้แอดมินกลับหน้าหลักไวๆ */}
        <button onClick={() => navigate('/admin')} className="mt-8 text-blue-600 hover:underline">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;