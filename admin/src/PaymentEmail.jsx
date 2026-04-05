import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function PaymentEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {}; 

  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSkip = () => {
    navigate('/admin/payment/success');
  };

  const handleSend = () => {
    if (!email.trim()) {
      setErrorMsg("Please input tenant's email");
      return;
    }

    // 🎯 สร้างหัวข้อ และ เนื้อความอีเมลอัตโนมัติ
    const subject = `Invoice for Room ${data.room || ''} - 8 Mansions`;
    const body = `Dear Tenant,\n\nPlease find attached the invoice for your room ${data.room || ''}.\n\nBest regards,\n8 Mansions Admin`;

    // 🎯 ใช้คำสั่ง mailto: เพื่อเปิดหน้าต่างเขียนอีเมลของคอมพิวเตอร์/มือถือเครื่องนั้น
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // เด้งไปหน้า Success
    navigate('/admin/payment/success');
  };

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
        <div className="w-full max-w-xl text-center">
          
          <h2 className="text-2xl font-bold text-left mb-4 text-[#1A1A1A]">Put Tenant's email</h2>
          
          <input 
            type="email" 
            placeholder="Tenant's email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMsg(''); 
            }}
            className="w-full p-3 bg-gray-300 border-none outline-none focus:ring-2 focus:ring-[#8FAFC1] mb-8 text-black"
          />

          <div className="flex justify-around mt-10">
            <button onClick={handleSkip} className="bg-[#8FAFC1] hover:bg-[#7a96a8] text-black font-bold py-2 px-12 shadow-sm transition-transform active:scale-95">
              Skip
            </button>
            <button onClick={handleSend} className="bg-[#8FAFC1] hover:bg-[#7a96a8] text-black font-bold py-2 px-12 shadow-sm transition-transform active:scale-95">
              Send
            </button>
          </div>

          {errorMsg && (
            <p className="text-red-600 font-bold mt-6">{errorMsg}</p>
          )}

        </div>
      </div>
    </div>
  );
}

export default PaymentEmail;