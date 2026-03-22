import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage(''); 
    
  try {
      const response = await fetch('https://eightmansions-backend.onrender.com/api/login/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              username: username,
              password: password
          })
      });

      // 1. สั่งแปลงข้อมูลที่เซิร์ฟเวอร์ตอบกลับมาให้เป็น JSON
      const data = await response.json();

      // 2. เช็คว่าการเชื่อมต่อสำเร็จและรหัสผ่านถูกไหม (response.ok จะเป็น true ถ้า status คือ 200)
      if (response.ok) {
        
        // เช็ค Role เพื่อพาไปหน้าต่าง ๆ
        if (data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/customer');
        }

      } else {
        // 3. ถ้า response ไม่ ok (เช่น เซิร์ฟเวอร์ตอบกลับมาเป็น 401 รหัสผิด)
        if (response.status === 401) {
          setErrorMessage('Username หรือ Password ไม่ถูกต้อง');
        } else {
          // เผื่อมี Error อื่นๆ เช่น 400, 500
          setErrorMessage(data.error || 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
        }
      }

    } catch (error) {
      // 4. อันนี้จะทำงานตอน เน็ตหลุด หรือ Render ล่มเท่านั้นครับ
      console.error("Error:", error);
      setErrorMessage('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  }; // ปิดฟังก์ชัน (อย่าลืมเช็คปีกกาปืดให้ครบนะครับ)

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#1E1E1E' }}>
      <div style={{ backgroundColor: '#F0F0F0', padding: '40px', borderRadius: '8px', width: '350px', textAlign: 'center' }}>
        <img src="/logo.png" alt="Logo" style={{ width: '120px', marginBottom: '20px' }} />
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc' }} 
            />
          </div>

          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc' }} 
            />
          </div>

          <div style={{ height: '20px', color: 'red', fontSize: '14px', marginBottom: '10px' }}>
            {errorMessage}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => navigate('/')} style={{ flex: 1, padding: '10px', backgroundColor: '#FF0000', color: 'white', border: 'none', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#92B0C3', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Enter</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;