import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import AdminWelcomePage from './AdminWelcomePage';
import LoginPage from './LoginPage';
import AdminDashboard from './AdminDashboard';
import DataPage from './DataPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* เปลี่ยนให้ / เป็น LoginPage แทน */}
        <Route path="/" element={<LoginPage />} />
        
        {/* ส่วนหน้าอื่นๆ ก็ยังเรียกใช้งานได้ผ่าน URL ตามปกติ */}
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/admin-welcome" element={<AdminWelcomePage />} />
        
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/data" element={<DataPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;