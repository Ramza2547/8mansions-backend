import { useState, useEffect, cloneElement } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function GlobalLoader({ children }) {
  const location = useLocation(); // URL เป้าหมายที่ผู้ใช้กดไป
  const navigate = useNavigate();
  
  // 🎯 State สำหรับเก็บ "หน้าที่กำลังแสดงผลอยู่จริงๆ"
  const [displayLocation, setDisplayLocation] = useState(location);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ถ้า URL เป้าหมาย ไม่ตรงกับหน้าจอที่กำลังแสดงอยู่ แปลว่าผู้ใช้กดเปลี่ยนหน้า!
    if (location.pathname !== displayLocation.pathname) {
      setError(null);

      // 1. ดักจับถ้าเน็ตหลุด
      if (!navigator.onLine) {
        setError("No Internet Connection: กรุณาตรวจสอบสัญญาณอินเทอร์เน็ต");
        return; // หยุดทำงาน หน้าจอจะไม่เปลี่ยน
      }

      // 2. เริ่มโชว์ Pop-up Loading
      setIsLoading(true);

      // สุ่มเวลาโหลด 0.3 - 0.8 วินาที
      const randomDelay = Math.floor(Math.random() * 500) + 300;

      const timer = setTimeout(() => {
        // สุ่มโอกาส Error (เอาออกได้ถ้าไม่ต้องการ)
        const randomError = Math.random();
        if (randomError < 0.02) {
          setError("Server Timeout: การเชื่อมต่อใช้เวลานานเกินไป");
          setIsLoading(false);
          // 🔴 หน้าจอจะไม่เปลี่ยน (เพราะเราไม่ได้อัปเดต displayLocation)
        } else {
          setIsLoading(false);
          setDisplayLocation(location); // 🟢 โหลดสำเร็จ! สั่งให้อัปเดตหน้าจอเป็นหน้าใหม่ได้เลย
          window.scrollTo(0, 0); // เลื่อนกลับไปบนสุดของเพจ
        }
      }, randomDelay);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation.pathname]);

  // 🎯 ฟังก์ชันเมื่อโหลดพัง แล้วผู้ใช้กดปุ่ม "ยกเลิก"
  const handleDismissError = () => {
    setError(null);
    setIsLoading(false);
    // บังคับเปลี่ยน URL ด้านบนเบราว์เซอร์ ให้กลับมาเป็น URL ของหน้าเดิมที่ค้างอยู่
    navigate(displayLocation.pathname, { replace: true });
  };

  return (
    <>
      {/* 🎯 ส่วนของ Pop-up แจ้งเตือนลอยๆ */}
      {(isLoading || error) && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-300 ease-out pointer-events-none">
          {error ? (
            <div className="bg-[#1A1A1A] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4 fade-in pointer-events-auto border border-red-900/50">
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="flex flex-col mr-2">
                <h3 className="text-[13px] font-bold text-red-400">Access Denied</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{error}</p>
              </div>
              <button 
                onClick={handleDismissError} 
                className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap active:scale-95"
              >
                Dismiss
              </button>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-gray-200 flex items-center gap-5 animate-in slide-in-from-top-4 fade-in duration-200">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 bg-[#8FAFC1] rotate-45 animate-ping" style={{ animationDuration: '1.2s', animationDelay: '0ms' }}></div>
                <div className="w-2.5 h-2.5 bg-[#1A1A1A] rotate-45 animate-ping" style={{ animationDuration: '1.2s', animationDelay: '200ms' }}></div>
                <div className="w-2.5 h-2.5 bg-[#8FAFC1] rotate-45 animate-ping" style={{ animationDuration: '1.2s', animationDelay: '400ms' }}></div>
              </div>
              <div className="flex flex-col border-l-2 border-gray-100 pl-4">
                <span className="text-[12px] font-black text-[#1A1A1A] tracking-widest uppercase leading-none">8 Mansions</span>
                <span className="text-[10px] font-bold text-[#8FAFC1] mt-1 uppercase tracking-wider animate-pulse">Loading...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🎯 โค้ดพระเอก! มันจะแช่แข็งหน้าจอให้เป็น displayLocation (หน้าเก่า) จนกว่าจะโหลดเสร็จ */}
      {cloneElement(children, { location: displayLocation })}
    </>
  );
}