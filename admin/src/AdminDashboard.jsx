import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 🎯 ฟังก์ชันจัดการรูปแบบวันที่และเวลาให้ออกมาเป็น "Saturday 11 April 2026 11:26 pm"
const formatDateTime = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayName = days[date.getDay()];
  const d = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  
  hours = hours % 12;
  hours = hours ? hours : 12; 
  
  return `${dayName} ${d} ${monthName} ${year} ${hours}:${minutes} ${ampm}`;
};

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/'); 
  };

  // 🎯 State สำหรับเก็บเวลาปัจจุบัน และรูปภาพ Carousel
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    "/8 mansion1.jpg",
    "/8 mansion2.jpg",
    "/8 mansion3.jpg"
  ];

  // 🎯 useEffect อัปเดตเวลาทุกๆ 1 วินาที และเลื่อนรูปทุกๆ 3.5 วินาที
  useEffect(() => {
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3500);

    return () => {
      clearInterval(timeInterval);
      clearInterval(imageInterval);
    };
  }, [images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F0]">
      
      {/* 🟢 Navbar แบบ Responsive */}
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex items-center justify-between min-h-[60px] flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 sm:gap-6 pl-3 sm:pl-8 py-2 font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] overflow-x-auto whitespace-nowrap">
            <span className="cursor-pointer px-1 sm:px-2 underline decoration-2 underline-offset-4">Home</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-gray-700 transition-colors" onClick={() => navigate('/data')}>Data</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-gray-700 transition-colors" onClick={() => navigate('/admin/payment')}>Payment</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-gray-700 transition-colors" onClick={() => navigate('/admin/feedback')}>Feedback</span>
          </div>

          <div className="flex items-center ml-auto">
            <span onClick={handleLogout} className="mr-3 sm:mr-8 cursor-pointer font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] whitespace-nowrap hover:text-red-700 transition-colors">
              Log out
            </span>
            <div className="bg-black min-h-[60px] px-3 sm:px-6 flex items-center justify-center">
              <img src="/logo.png" alt="8 Mansions Logo" className="h-[25px] sm:h-[40px]" />
            </div>
          </div>
        </div>
      </nav>

      {/* 🔵 พื้นที่รูปภาพและหัวข้อ */}
      <div className="w-full bg-[#EAEAEA] py-6 md:py-8 flex flex-col items-center px-4 sm:px-6">
        
        {/* 🎯 ส่วนหัวข้อ Home และ วันที่ (จัดให้พอดีกับขอบรูป) */}
        <div className="w-full max-w-4xl mb-3 flex flex-col sm:flex-row sm:items-end justify-between px-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-wide leading-none">Home</h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium mt-1 sm:mt-0 tracking-wide">
            {formatDateTime(currentTime)}
          </p>
        </div>

        {/* ตัว Carousel */}
        <div className="relative w-full max-w-4xl h-[200px] sm:h-[350px] md:h-[500px] overflow-hidden rounded-xl shadow-lg group">
          <div 
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {images.map((img, index) => (
              <img 
                key={index}
                src={img} 
                className="w-full h-full object-cover flex-shrink-0" 
                alt={`Mansion ${index + 1}`} 
              />
            ))}
          </div>

          <button 
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>

          <button 
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <div 
                key={index} 
                onClick={() => setCurrentImageIndex(index)}
                className={`cursor-pointer w-3 h-3 rounded-full transition-colors duration-300 ${currentImageIndex === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 🟠 พื้นที่ข้อความด้านล่าง */}
      <div className="flex-1 bg-[#EAEAEA] p-6 md:pb-[50px] md:px-[80px]">
        <p className="text-[15px] md:text-[18px] leading-[1.6] md:leading-[1.8] text-[#222] m-0 text-justify sm:text-left max-w-4xl mx-auto">
          <span className="text-[50px] md:text-[64px] float-left leading-[0.8] mr-2 md:mr-3 font-normal mt-1 md:mt-2">
            P
          </span>
          huket is Thailand's largest island province, located off the Andaman Coast 
          and famously known as the "Pearl of the Andaman." 
          It features a stunning landscape that blends lush mountains with world-class beaches. 
          Beyond its natural beauty and vibrant marine tourism, 
          Phuket is a melting pot of cultural heritage, most notably its unique "Peranakan" 
          identity reflected in the iconic Sino-Portuguese architecture of Old Town 
          and its renowned culinary scene. This blend of natural charm and rich history makes 
          Phuket a strategic global destination for tourism, commerce, and international living.
        </p>
      </div>

    </div>
  );
}

export default AdminDashboard;