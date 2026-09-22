import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  
  // 🌟 State สำหรับ Progress Bar และการปลุกเซิร์ฟเวอร์
  const [isServerReady, setIsServerReady] = useState(false);
  const [serverProgress, setServerProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('กำลังเชื่อมต่อเซิร์ฟเวอร์...');
  const [countdown, setCountdown] = useState(60); // เริ่มนับจาก 60 วิ
  
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [loginProgress, setLoginProgress] = useState(0);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');
  const [alertPopup, setAlertPopup] = useState({ show: false, text: '' });

  const navigate = useNavigate();
  const retryCount = useRef(0); // นับจำนวนครั้งที่ลองปลุกใหม่

  // 🌟 ฟังก์ชันปลุกเซิร์ฟเวอร์แบบมี Auto-Retry
  useEffect(() => {
    let progressInterval;
    let countdownInterval;
    let timeoutId;
    const abortController = new AbortController();

    const wakeUpServer = async () => {
      setServerProgress(0);
      setCountdown(60);
      setStatusMessage(retryCount.current > 0 ? `กำลังลองเชื่อมต่อใหม่ครั้งที่ ${retryCount.current}...` : 'กำลังเชื่อมต่อเซิร์ฟเวอร์...');

      // หลอดบาร์วิ่งทีละนิด
      progressInterval = setInterval(() => {
        setServerProgress((prev) => (prev < 90 ? prev + Math.floor(Math.random() * 5) + 2 : prev));
      }, 1000);

      // นับเวลาถอยหลัง 60 วินาที
      countdownInterval = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      // จำกัดเวลาแต่ละรอบที่ 60 วิ
      timeoutId = setTimeout(() => abortController.abort(), 60000);

      try {
        await fetch('https://eightmansions-backend.onrender.com/', { 
          mode: 'no-cors',
          signal: abortController.signal
        });
        
        // ถ้าเซิร์ฟเวอร์ตื่น
        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        clearInterval(countdownInterval);
        
        setServerProgress(100);
        setStatusMessage('เซิร์ฟเวอร์พร้อมใช้งานแล้ว!');
        
        setTimeout(() => setIsServerReady(true), 800);
      } catch (error) {
        clearInterval(progressInterval);
        clearInterval(countdownInterval);
        
        setStatusMessage('เซิร์ฟเวอร์ยังไม่ตอบสนอง... กำลังเริ่มปลุกใหม่');
        retryCount.current += 1;
        
        // 🌟 ลองใหม่เองโดยอัตโนมัติในอีก 3 วินาที (ไม่ต้องรีเฟรชหน้า)
        setTimeout(() => wakeUpServer(), 3000);
      }
    };

    wakeUpServer();

    return () => {
      clearInterval(progressInterval);
      clearInterval(countdownInterval);
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage(''); 
    setIsLoading(true); 
    
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 20000); // ตอนล็อกอินให้รอแค่ 20วิพอ

    try {
      const response = await fetch('https://eightmansions-backend.onrender.com/api/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
          signal: abortController.signal 
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok) {
        setIsLoginSuccess(true);
        setLoginSuccessMessage('รหัสผ่านถูกต้อง!');
        
        const targetRoute = (data.role === 'admin' || username === 'admin') ? '/admin' : '/customer';
        
        let currentProgress = 0;
        const progressInterval = setInterval(() => {
          currentProgress += Math.floor(Math.random() * 20) + 15; 
          
          if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(progressInterval);
            setLoginSuccessMessage('กำลังพาคุณเข้าสู่ระบบ...');
            
            setTimeout(() => navigate(targetRoute), 500);
          }
          setLoginProgress(currentProgress);
        }, 200); 

      } else {
        if (response.status === 401) {
          setErrorMessage('Username หรือ Password ไม่ถูกต้อง');
        } else {
          setErrorMessage(data.error || 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
        }
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false); 
      if (error.name === 'AbortError') {
        setAlertPopup({ show: true, text: 'หมดเวลาเชื่อมต่อ เซิร์ฟเวอร์รอนานเกินไป กรุณากด Enter อีกครั้ง' });
      } else {
        setAlertPopup({ show: true, text: 'ไม่สามารถเชื่อมต่อได้ ตรวจสอบอินเทอร์เน็ตของคุณ' });
      }
    }
  };

  const handleClear = () => {
    setUsername('');
    setPassword('');
    setErrorMessage('');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#1E1E1E] p-4">
      <div className="bg-[#F0F0F0] p-10 rounded-lg w-full max-w-[350px] text-center shadow-2xl relative overflow-hidden">
        
        <img src="/logo.png" alt="8 Mansions Logo" className="w-[120px] mx-auto mb-6" />
        
        {/* 🌟 หน้าจอโหลดก่อนล็อกอิน (มีนับเวลาถอยหลัง) */}
        {!isServerReady && !isLoginSuccess && (
          <div className="absolute inset-0 bg-[#F0F0F0]/95 backdrop-blur-sm flex flex-col justify-center items-center z-10 px-8">
            <div className="w-12 h-12 border-4 border-[#92B0C3] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#1A1A1A] font-bold text-sm mb-1">{statusMessage}</p>
            
            <div className="w-full bg-gray-300 rounded-full h-2.5 my-2">
              <div 
                className="bg-[#92B0C3] h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${serverProgress}%` }}
              ></div>
            </div>
            
            <p className="text-gray-500 text-[11px] font-bold mt-1 text-center font-mono">
              คาดว่าจะพร้อมใน: <span className="text-[#2C3E50]">{countdown}</span> วินาที
            </p>
            <p className="text-gray-400 text-[9px] mt-4 text-center">
              (ระบบจะพยายามเชื่อมต่อใหม่อัตโนมัติ หากหมดเวลา)
            </p>
          </div>
        )}

        {/* 🌟 หน้าจอโหลดตอนรหัสถูกแล้ว กำลังเปลี่ยนหน้า */}
        {isLoginSuccess && (
          <div className="absolute inset-0 bg-[#F0F0F0]/95 backdrop-blur-sm flex flex-col justify-center items-center z-20 px-8">
            <div className="w-12 h-12 border-4 border-[#2ECC71] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#1A1A1A] font-bold text-sm mb-2">{loginSuccessMessage}</p>
            <div className="w-full bg-gray-300 rounded-full h-2.5">
              <div 
                className="bg-[#2ECC71] h-2.5 rounded-full transition-all duration-200 ease-out" 
                style={{ width: `${loginProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4 text-left">
            <label className={`block mb-2 font-bold ${!isServerReady ? 'text-gray-400' : 'text-[#1A1A1A]'}`}>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} disabled={!isServerReady || isLoginSuccess} className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#92B0C3] transition-all ${(!isServerReady || isLoginSuccess) ? 'bg-gray-200 cursor-not-allowed' : 'bg-yellow-50'}`} />
          </div>
          <div className="mb-4 text-left">
            <label className={`block mb-2 font-bold ${!isServerReady ? 'text-gray-400' : 'text-[#1A1A1A]'}`}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={!isServerReady || isLoginSuccess} className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#92B0C3] transition-all ${(!isServerReady || isLoginSuccess) ? 'bg-gray-200 cursor-not-allowed' : 'bg-yellow-50'}`} />
          </div>
          <div className="h-5 text-red-600 text-[13px] mb-4 font-semibold flex items-center justify-center">{errorMessage}</div>
          <div className="flex gap-3">
            <button type="button" onClick={handleClear} disabled={isLoading || !isServerReady || isLoginSuccess} className={`flex-1 py-2 font-bold rounded shadow-md transition-colors active:scale-95 ${ (isLoading || !isServerReady || isLoginSuccess) ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-[#FF0000] hover:bg-red-700 text-white' }`}>Clear</button>
            <button type="submit" disabled={isLoading || !isServerReady || isLoginSuccess} className={`flex-1 py-2 font-extrabold rounded shadow-md transition-colors active:scale-95 ${ (isLoading || !isServerReady || isLoginSuccess) ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-[#92B0C3] hover:bg-[#7fa1b5] text-[#1A1A1A]' }`}>{isLoading ? 'Verifying...' : 'Enter'}</button>
          </div>
        </form>

        {alertPopup.show && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[110] p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg></div>
              <h3 className="text-xl font-extrabold mb-2 text-red-700">Error!</h3>
              <p className="text-gray-600 mb-6 font-medium">{alertPopup.text}</p>
              <button onClick={() => setAlertPopup({ show: false, text: '' })} className="px-8 py-2 font-bold text-white rounded-full bg-[#E74C3C] hover:bg-[#C0392B] w-full transition-transform active:scale-95 shadow-md">OK</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;