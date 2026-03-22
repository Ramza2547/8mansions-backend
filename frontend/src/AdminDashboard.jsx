import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/'); // กด Log out แล้วเด้งกลับไปหน้า Login
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F0F0F0' }}>
      
      {/* 🟢 แถบเมนูด้านบน (Navbar) */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: '#8FAFC1', // สีฟ้าตามแบบ Figma
        height: '60px' 
      }}>
        
        {/* เมนูฝั่งซ้าย */}
        <div style={{ display: 'flex', gap: '30px', paddingLeft: '30px', fontWeight: 'bold', color: '#1A1A1A' }}>
          <span style={{ cursor: 'pointer' }}>Home</span>
          {/* ✅ เพิ่ม onClick ตรงนี้เพื่อให้เปลี่ยนไปหน้า /data */}
          <span 
            style={{ cursor: 'pointer' }} 
            onClick={() => navigate('/data')}
          >
            Data
          </span>
          <span style={{ cursor: 'pointer' }}>Payment</span>
          <span style={{ cursor: 'pointer' }}>Feedback</span>
        </div>

        {/* เมนูฝั่งขวา (Log out และ Logo) */}
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <span 
            onClick={handleLogout}
            style={{ marginRight: '30px', cursor: 'pointer', fontWeight: 'bold', color: '#1A1A1A' }}
          >
            Log out
          </span>
          {/* กล่องดำพื้นหลังโลโก้ */}
          <div style={{ backgroundColor: 'black', height: '100%', padding: '0 20px', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="8 Mansions Logo" style={{ height: '40px' }} />
          </div>
        </div>
      </nav>

      {/* 🔵 พื้นที่รูปภาพ 3 รูปติดกัน */}
      <div style={{ display: 'flex', width: '100%', height: '350px' }}>
        <img src="/8 mansion1.jpg"  style={{ flex: 1, objectFit: 'cover' }} />
        <img src="/8 mansion2.jpg"  style={{ flex: 1, objectFit: 'cover' }} />
        <img src="/8 mansion3.jpg"  style={{ flex: 1, objectFit: 'cover' }} />
      </div>

      {/* 🟠 พื้นที่ข้อความด้านล่าง */}
      <div style={{ padding: '50px 80px', flex: 1, backgroundColor: '#EAEAEA' }}>
        <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#222', margin: 0 }}>
          {/* ตัวอักษร P ตัวใหญ่ (Drop Cap) */}
          <span style={{ 
            fontSize: '64px', 
            float: 'left', 
            lineHeight: '0.8', 
            marginRight: '8px',
            fontWeight: 'normal' 
          }}>
            P
          </span>
          huket is Thailand's largest island province, located off the Andaman Coast 
          and famously known as the "Pearl of the Andaman." <br />
          It features a stunning landscape that blends lush mountains with world-class beaches. <br />
          Beyond its natural beauty and vibrant marine tourism, <br />
          Phuket is a melting pot of cultural heritage, most notably its unique "Peranakan" <br />
          identity reflected in the iconic Sino-Portuguese architecture of Old Town <br />
          and its renowned culinary scene. This blend of natural charm and rich history makes <br />
          Phuket a strategic global destination for tourism, commerce, and international living.
        </p>
      </div>

    </div>
  );
}

export default AdminDashboard;