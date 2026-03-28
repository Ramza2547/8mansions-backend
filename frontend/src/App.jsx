import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import AdminWelcomePage from './AdminWelcomePage';
import LoginPage from './LoginPage';
import AdminDashboard from './AdminDashboard';
import DataPage from './DataPage';
import DeleteConfirm from './DeleteConfirm';
import DeleteSuccess from './DeleteSuccess';

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

        {/* 🎯 เพิ่ม 2 บรรทัดนี้ครับ เพื่อให้ระบบรู้จักหน้า Delete */}
        <Route path="/admin/delete-confirm" element={<DeleteConfirm />} />
        <Route path="/admin/delete-success" element={<DeleteSuccess />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;