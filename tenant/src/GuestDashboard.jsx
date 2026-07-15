import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 🎯 ฟังก์ชันจัดการรูปแบบวันที่และเวลา
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

// 🎯 ฟังก์ชันคำนวณคำทักทายตามช่วงเวลา
const getGreeting = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  const morningStart = 5 * 60; // 05:00
  const morningEnd = 12 * 60;  // 12:00
  const afternoonEnd = 18 * 60; // 18:00 (06:00 pm)

  if (timeInMinutes >= morningStart && timeInMinutes <= morningEnd) {
    return "Good Morning";
  } else if (timeInMinutes > morningEnd && timeInMinutes <= afternoonEnd) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
};

function GuestDashboard() {
  const navigate = useNavigate();

  // 🎯 State สำหรับเวลาและรูปภาพ
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    "/8 mansion1.jpg",
    "/8 mansion2.jpg",
    "/8 mansion3.jpg"
  ];

  // 🎯 useEffect รันเวลาแบบ Real-time และเลื่อนภาพ
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
    <div className="flex flex-col min-h-screen bg-[#F0F0F0] font-sans">
      
      {/* 🎯 Navbar Responsive */}
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex justify-between items-stretch w-full min-h-[60px] sm:min-h-[80px]">
          <div className="flex gap-4 sm:gap-10 items-center px-[5%]">
            <span onClick={() => navigate('/')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium text-black underline underline-offset-4 decoration-2">Home</span>
            <span onClick={() => navigate('/booking')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium text-black hover:underline underline-offset-4 decoration-2 transition-colors">Booking</span>
            <span onClick={() => navigate('/comment')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium text-black hover:underline underline-offset-4 decoration-2 transition-colors">Comment</span>
          </div>
          <div className="bg-black px-4 sm:px-[30px] flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="8 Mansions Logo" 
              className="h-[40px] sm:h-[70px] w-auto block object-contain" 
            />
          </div>
        </div>
      </nav>

      {/* 🔵 Hero Section และ หัวข้อเวลา */}
      <div className="w-full bg-[#F0F0F0] py-6 md:py-8 flex flex-col items-center px-4 sm:px-6">
        
        {/* 🎯 ส่วนหัวข้อคำทักทาย และ วันที่ */}
        <div className="w-full max-w-5xl mb-3 flex flex-col sm:flex-row sm:items-end justify-between px-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-wide leading-none">
            {getGreeting(currentTime)}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium mt-1 sm:mt-0 tracking-wide">
            {formatDateTime(currentTime)}
          </p>
        </div>

        {/* ตัว Carousel */}
        <div className="relative w-full max-w-5xl h-[220px] sm:h-[400px] md:h-[550px] overflow-hidden rounded-xl shadow-lg group">
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
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/80 text-white p-3 sm:p-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>

          <button 
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/80 text-white p-3 sm:p-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
            {images.map((_, index) => (
              <div 
                key={index} 
                onClick={() => setCurrentImageIndex(index)}
                className={`cursor-pointer w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${currentImageIndex === index ? 'bg-white scale-110 shadow-md' : 'bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 🟠 Content Section */}
      <div className="px-6 sm:px-10 md:px-[10%] py-4 sm:py-[40px] md:pb-[80px] font-serif text-[#333] text-left flex-1">
        <p className="text-[15px] sm:text-[16px] md:text-[20px] leading-[1.6] md:leading-[1.8] text-[#444] m-0 max-w-[1000px] text-justify sm:text-left mx-auto">
          <span className="text-[50px] sm:text-[60px] md:text-[80px] font-normal float-left leading-[0.8] mr-2 sm:mr-3 mt-1 sm:mt-2 text-black">
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

export default GuestDashboard;