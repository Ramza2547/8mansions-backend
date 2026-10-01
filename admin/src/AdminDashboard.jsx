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
  
  return `${dayName}, ${d} ${monthName} ${year} | ${hours}:${minutes} ${ampm}`;
};

// 🎯 ฟังก์ชันคำนวณคำทักทาย (เอา Gradient ออกจาก Emoji แล้ว)
const getGreetingData = (date) => {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) {
    return { text: "Good Morning", icon: "🌅" };
  } else if (hours >= 12 && hours < 18) {
    return { text: "Good Afternoon", icon: "🌤️" };
  } else {
    return { text: "Good Evening", icon: "🌙" };
  }
};

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/'); 
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    "/8 mansion1.jpg",
    "/8 mansion2.jpg",
    "/8 mansion3.jpg"
  ];

  useEffect(() => {
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4500);

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

  const greeting = getGreetingData(currentTime);

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F7F9]">
      
      {/* 🟢 Navbar แบบ Responsive (ไม่ได้แก้ไข คงเดิมตามที่คุณให้มา) */}
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

      {/* 🔵 พื้นที่เนื้อหาหลัก */}
      <div className="w-full flex-1 py-8 md:py-10 flex flex-col items-center px-4 sm:px-6 animate-fade-in">
        
        {/* 🎯 ส่วนหัวข้อคำทักทาย และ วันที่ */}
        <div className="w-full max-w-5xl mb-6 flex flex-col md:flex-row md:items-end justify-between px-2 gap-4">
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight flex items-center gap-3">
              {greeting.text} 
              {/* 🌟 แก้ไขตรงนี้: ลบ bg-clip-text ออก และใส่ drop-shadow กับ animate-bounce เบาๆ แทน */}
              <span className="text-3xl sm:text-4xl drop-shadow-md animate-[bounce_3s_infinite]">
                {greeting.icon}
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium mt-1">
              Welcome back to the admin dashboard.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200/60">
            <svg className="w-5 h-5 text-[#8FAFC1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-sm font-bold text-[#2C3E50]">
              {formatDateTime(currentTime)}
            </p>
          </div>
        </div>

        {/* 🌟 ตัว Carousel อัปเกรด (Ken Burns Zoom Effect + Glassmorphism Buttons) */}
        <div className="relative w-full max-w-5xl h-[250px] sm:h-[400px] md:h-[550px] overflow-hidden rounded-2xl shadow-2xl group ring-1 ring-black/5">
          <div 
            className="flex transition-transform duration-1000 ease-in-out h-full"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {images.map((img, index) => (
              <div key={index} className="w-full h-full flex-shrink-0 relative overflow-hidden">
                <img 
                  src={img} 
                  className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${currentImageIndex === index ? 'scale-110' : 'scale-100'}`} 
                  alt={`Mansion ${index + 1}`} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
            ))}
          </div>

          <button 
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
          </button>

          <button 
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
          </button>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
            {images.map((_, index) => (
              <div 
                key={index} 
                onClick={() => setCurrentImageIndex(index)}
                className={`cursor-pointer h-2 rounded-full transition-all duration-500 ${currentImageIndex === index ? 'w-8 bg-white shadow-md' : 'w-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </div>

        {/* 🟠 พื้นที่ข้อความด้านล่าง (ใส่ใน Card สวยๆ) */}
        <div className="w-full max-w-5xl mt-10 bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden mb-10">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#8FAFC1]"></div>
          
          <h2 className="text-xl font-bold text-[#8FAFC1] uppercase tracking-widest mb-4 pl-4">About the Location</h2>
          
          <p className="text-[15px] md:text-[18px] leading-[1.8] text-gray-700 m-0 text-justify sm:text-left pl-4 font-serif">
            <span className="text-[55px] md:text-[70px] float-left leading-[0.8] mr-3 font-medium text-[#1A1A1A] mt-2">
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
    </div>
  );
}

export default AdminDashboard;