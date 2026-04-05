import { useNavigate } from 'react-router-dom';

function GuestDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F0] font-sans">
      
      {/* 🟢 Navbar Section */}
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex justify-between items-stretch w-full min-h-[80px]">
          
          {/* Menu Items */}
          <div className="flex gap-6 sm:gap-10 items-center px-[5%]">
            {/* 🎯 เติม onClick ให้ Home */}
            <span onClick={() => navigate('/')} className="cursor-pointer text-[16px] sm:text-[18px] font-medium text-black underline underline-offset-4 decoration-2">Home</span>
            <span onClick={() => navigate('/booking')} className="cursor-pointer text-[16px] sm:text-[18px] font-medium text-black hover:underline underline-offset-4 decoration-2">Booking</span>
            {/* 🎯 เติม onClick ให้ Comment */}
            <span onClick={() => navigate('/comment')} className="cursor-pointer text-[16px] sm:text-[18px] font-medium text-black hover:underline underline-offset-4 decoration-2">Comment</span>
          </div>

          {/* Black Logo Container */}
          <div className="bg-black px-4 sm:px-[30px] flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="8 Mansions Logo" 
              className="h-[50px] sm:h-[70px] w-auto block object-contain" 
            />
          </div>
        </div>
      </nav>

      {/* 🔵 Hero Section - รูปภาพ 3 รูป (ปรับให้ชิดกันตรงกลาง) */}
      <div className="w-full flex justify-center bg-white py-4 md:py-8">
        <div className="grid grid-cols-3 gap-1 sm:gap-2 max-w-fit h-[150px] sm:h-[300px] md:h-[400px] px-2">
          <img src="/8 mansion1.jpg" className="w-full h-full object-cover shadow-sm rounded-sm" alt="Mansion 1" />
          <img src="/8 mansion2.jpg" className="w-full h-full object-cover shadow-sm rounded-sm" alt="Mansion 2" />
          <img src="/8 mansion3.jpg" className="w-full h-full object-cover shadow-sm rounded-sm" alt="Mansion 3" />
        </div>
      </div>

      {/* 🟠 Content Section - ข้อมูล Phuket */}
      <div className="px-6 md:px-[10%] py-[50px] md:py-[80px] font-serif text-[#333] text-left">
        <p className="text-[16px] md:text-[20px] leading-[1.6] md:leading-[1.8] text-[#444] m-0 max-w-[1000px] text-justify sm:text-left mx-auto">
          <span className="text-[60px] md:text-[80px] font-normal float-left leading-[0.8] mr-3 mt-2 text-black">
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