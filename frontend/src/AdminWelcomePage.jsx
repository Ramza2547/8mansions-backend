import { useNavigate } from 'react-router-dom';

function AdminWelcomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1E1E1E' }}>
      <div style={{ backgroundColor: '#F0F0F0', padding: '60px 80px', borderRadius: '4px', width: '400px', textAlign: 'center' }}>
        
        {/* โลโก้ */}
        <div style={{ marginBottom: '50px' }}>
          <img src="/logo.png" alt="8 Mansions Logo" style={{ width: '180px' }} />
        </div>

        {/* ปุ่ม Log in */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '20px' }}>


          <button 
            onClick={() => navigate('/login')} // 🌟 กดปุ่มนี้เพื่อไปหน้ากรอก Username/Password ที่เราเคยทำไว้
            style={{ flex: 1, padding: '10px 0', border: 'none', backgroundColor: '#92B0C3', color: 'black', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
          >
            Log in
          </button>
        </div>

        {/* ปุ่ม Back ย้อนกลับไปหน้าแรกสุด */}
        <button 
          onClick={() => navigate('/')} 
          style={{ width: '120px', padding: '10px 0', border: 'none', backgroundColor: '#FF0000', color: 'black', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
        >
          Back
        </button>

      </div>
    </div>
  );
}

export default AdminWelcomePage;