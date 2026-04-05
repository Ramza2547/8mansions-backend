import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/'); 
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F0]">
      
      {/* 🟢 Navbar แบบ Responsive */}
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex items-center justify-between min-h-[60px] flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 sm:gap-6 pl-3 sm:pl-8 py-2 font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] overflow-x-auto whitespace-nowrap">
            <span className="cursor-pointer px-1 sm:px-2 underline">Home</span>
            <span className="cursor-pointer px-1 sm:px-2" onClick={() => navigate('/data')}>Data</span>
            {/* 🎯 เพิ่ม onClick ตรงนี้ครับ */}
            <span className="cursor-pointer px-1 sm:px-2 hover:text-gray-700 transition-colors" onClick={() => navigate('/admin/payment')}>Payment</span>
            <span className="cursor-pointer px-1 sm:px-2">Feedback</span>
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

      {/* 🔵 พื้นที่รูปภาพ 3 รูป (ปรับให้ชิดกันสวยงาม) */}
      <div className="w-full flex justify-center bg-white py-4 md:py-8">
        <div className="grid grid-cols-3 gap-1 sm:gap-2 max-w-fit h-auto md:h-[400px] px-2">
          <img 
            src="/8 mansion1.jpg" 
            className="w-full h-[100px] sm:h-[200px] md:h-full object-cover shadow-sm rounded-sm" 
            alt="Mansion 1" 
          />
          <img 
            src="/8 mansion2.jpg" 
            className="w-full h-[100px] sm:h-[200px] md:h-full object-cover shadow-sm rounded-sm" 
            alt="Mansion 2" 
          />
          <img 
            src="/8 mansion3.jpg" 
            className="w-full h-[100px] sm:h-[200px] md:h-full object-cover shadow-sm rounded-sm" 
            alt="Mansion 3" 
          />
        </div>
      </div>

      {/* 🟠 พื้นที่ข้อความด้านล่าง */}
      <div className="flex-1 bg-[#EAEAEA] p-6 md:py-[50px] md:px-[80px]">
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