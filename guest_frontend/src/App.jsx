import { BrowserRouter, Routes, Route } from 'react-router-dom';

function GuestHome() {
  return (
    <div style={{ 
      backgroundColor: '#F5F5F5', 
      minHeight: '100vh', 
      width: '100%',
      margin: 0,
      padding: 0,
      fontFamily: 'sans-serif',
      overflowX: 'hidden' 
    }}>
      
      {/* Navbar Section */}
      <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'stretch', // ทำให้กล่องซ้ายและขวาสูงเท่ากันเป๊ะ
          backgroundColor: '#92B0C3', 
          width: '100%',
          minHeight: '80px' // กำหนดความสูงมาตรฐานของแถบ Navbar
      }}>
          {/* Menu Items */}
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center', padding: '0 5%' }}>
              <span style={{ cursor: 'pointer', fontSize: '18px', fontWeight: '500', color: 'black' }}>Home</span>
              <span style={{ cursor: 'pointer', fontSize: '18px', fontWeight: '500', color: 'black' }}>Booking</span>
              <span style={{ cursor: 'pointer', fontSize: '18px', fontWeight: '500', color: 'black' }}>Comment</span>
          </div>

          {/* Black Logo Container - ปรับให้โลโก้ใหญ่ขึ้นตรงนี้ */}
          <div style={{ 
              backgroundColor: 'black', 
              padding: '0 30px', // ลด padding ซ้ายขวาลงนิดหน่อย
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center'
          }}>
              <img 
                  src="/logo.png" 
                  alt="8 Mansions" 
                  style={{ 
                      height: '70px',  // ปรับจาก 40px เป็น 70px (ใหญ่ขึ้นเกือบเท่าตัว!)
                      width: 'auto',   // ให้สัดส่วนภาพไม่เพี้ยน
                      display: 'block',
                      objectFit: 'contain'
                  }} 
              />
          </div>
      </div>

      {/* Hero Section - รูปภาพ 3 รูป */}
      <div style={{ 
          display: 'flex', 
          width: '100%', 
          height: '450px', 
          margin: 0,
          padding: 0
      }}>
        <div style={{ 
          flex: 1, 
          backgroundImage: 'url("/8 mansion1.jpg")', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          borderRight: '1px solid white' 
        }}></div>
        
        <div style={{ 
          flex: 1, 
          backgroundImage: 'url("/8 mansion2.jpg")', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          borderRight: '1px solid white' 
        }}></div>
        
        <div style={{ 
          flex: 1, 
          backgroundImage: 'url("/8 mansion3.jpg")', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}></div>
      </div>

      {/* Content Section - ข้อมูล Phuket */}
      <div style={{ 
          padding: '80px 10%', 
          fontFamily: 'serif', 
          color: '#333', 
          lineHeight: '1.8',
          textAlign: 'left'
      }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'normal', marginBottom: '30px', color: '#000' }}>
          <span style={{ fontSize: '70px', fontWeight: 'bold' }}>P</span>huket is Thailand's largest island province, located off the Andaman Coast and famously known as the "Pearl of the Andaman."
        </h1>
        <p style={{ fontSize: '22px', maxWidth: '1000px', color: '#444' }}>
          It features a stunning landscape that blends lush mountains with world-class beaches. 
          Beyond its natural beauty and vibrant marine tourism, Phuket is a melting pot of cultural heritage, 
          most notably its unique "Peranakan" identity reflected in the iconic Sino-Portuguese architecture 
          of Old Town and its renowned culinary scene. This blend of natural charm and rich history makes 
          Phuket a strategic global destination for tourism, commerce, and international living.
        </p>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GuestHome />} />
      </Routes>
    </BrowserRouter>
  );
}