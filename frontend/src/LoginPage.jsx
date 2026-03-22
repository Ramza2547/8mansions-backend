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
const response = await axios.post('http://127.0.0.1:8000/api/login/', {
    username: username,
    password: password
});
      const data = response.data;

      if (data.status === 'success') {
        // ถ้าเป็น Admin (Staff) ไปหน้า /admin ถ้าเป็นลูกค้าไปหน้า /customer
        if (data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/customer');
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage('Username หรือ Password ไม่ถูกต้อง');
      } else {
        setErrorMessage('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      }
    }
  };

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