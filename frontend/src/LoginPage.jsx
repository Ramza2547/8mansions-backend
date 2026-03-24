import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // 🌟 เพิ่มตัวแปรสำหรับสถานะ "กำลังโหลด"
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage(''); 
    setIsLoading(true); // 🌟 เริ่มหมุนติ้วๆ ทันทีที่กดปุ่ม
    
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

      const data = await response.json();
      console.log("เซิร์ฟเวอร์ตอบกลับมาว่า:", data); // 🕵️‍♂️ แอบดูข้อมูลหลังบ้าน (กด F12 ดูได้)

      if (response.ok) {
        // 🌟 แก้เงื่อนไขให้ฉลาดขึ้น: ถ้าตอบกลับว่าสำเร็จ และพิมพ์ชื่อ admin ให้ไปหน้า Dashboard เลย
        if (data.role === 'admin' || username === 'admin') {
          navigate('/admin');
        } else {
          navigate('/customer');
        }
      } else {
        if (response.status === 401) {
          setErrorMessage('Username หรือ Password ไม่ถูกต้อง');
        } else {
          setErrorMessage(data.error || 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
        }
      }

    } catch (error) {
      console.error("Error:", error);
      setErrorMessage('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (Render อาจจะหลับอยู่)');
    } finally {
      setIsLoading(false); // 🌟 โหลดเสร็จแล้ว คืนค่าปุ่มให้กดได้เหมือนเดิม
    }
  };

  const handleClear = () => {
    setUsername('');
    setPassword('');
    setErrorMessage('');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#1E1E1E] p-4">
      <div className="bg-[#F0F0F0] p-10 rounded-lg w-full max-w-[350px] text-center shadow-2xl">
        <img src="/logo.png" alt="8 Mansions Logo" className="w-[120px] mx-auto mb-6" />
        
        <form onSubmit={handleLogin}>
          
          <div className="mb-4 text-left">
            <label className="block mb-2 font-bold text-[#1A1A1A]">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#92B0C3] focus:ring-2 focus:ring-[#92B0C3] transition-all bg-yellow-50" 
            />
          </div>

          <div className="mb-4 text-left">
            <label className="block mb-2 font-bold text-[#1A1A1A]">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#92B0C3] focus:ring-2 focus:ring-[#92B0C3] transition-all bg-yellow-50" 
            />
          </div>

          <div className="h-5 text-red-600 text-[13px] mb-4 font-semibold flex items-center justify-center">
            {errorMessage}
          </div>

          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={handleClear} 
              disabled={isLoading} // ปิดปุ่มตอนกำลังโหลด
              className={`flex-1 py-2 font-bold rounded shadow-md transition-colors active:scale-95 ${
                isLoading ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-[#FF0000] hover:bg-red-700 text-white'
              }`}
            >
              Clear
            </button>
            
            <button 
              type="submit" 
              disabled={isLoading} // ปิดปุ่มตอนกำลังโหลด
              className={`flex-1 py-2 font-extrabold rounded shadow-md transition-colors active:scale-95 ${
                isLoading ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-[#92B0C3] hover:bg-[#7fa1b5] text-[#1A1A1A]'
              }`}
            >
              {/* เปลี่ยนข้อความบนปุ่มตามสถานะ */}
              {isLoading ? 'Loading...' : 'Enter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;