import { useNavigate } from 'react-router-dom';

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1E1E1E' }}>
      <div style={{ backgroundColor: '#F0F0F0', padding: '60px 80px', borderRadius: '4px', width: '400px', textAlign: 'center' }}>
        
        {/* โลโก้ */}
        <div style={{ marginBottom: '50px' }}>
          <img src="/logo.png" alt="8 Mansions Logo" style={{ width: '180px' }} />
        </div>

        {/* ปุ่ม Guest และ Admin */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
          <button 
            style={{ flex: 1, padding: '10px 0', border: 'none', backgroundColor: '#92B0C3', color: 'black', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
          >
            Guest
          </button>
          
          <button 
            onClick={() => navigate('/admin-welcome')} // กดปุ่มนี้เพื่อไปหน้าย่อยของ Admin
            style={{ flex: 1, padding: '10px 0', border: 'none', backgroundColor: '#92B0C3', color: 'black', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
          >
            Admin
          </button>
        </div>

      </div>
    </div>
  );
}

export default WelcomePage;