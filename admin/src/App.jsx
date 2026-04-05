import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import AdminWelcomePage from './AdminWelcomePage';
import LoginPage from './LoginPage';
import AdminDashboard from './AdminDashboard';
import DataPage from './DataPage';
import DeleteConfirm from './DeleteConfirm';
import DeleteSuccess from './DeleteSuccess';
import PaymentInput from './PaymentInput';
import PaymentReview from './PaymentReview';
import PaymentChecking from './PaymentChecking';
import PaymentSuccess from './PaymentSuccess';

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

        {/* หน้า Delete */}
        <Route path="/admin/delete-confirm" element={<DeleteConfirm />} />
        <Route path="/admin/delete-success" element={<DeleteSuccess />} />
        
        {/* หน้า Payment */}
        <Route path="/admin/payment" element={<PaymentInput />} />
        <Route path="/admin/payment/review" element={<PaymentReview />} />
        <Route path="/admin/payment/checking" element={<PaymentChecking />} />
        {/* 🎯 ลบหน้า PaymentEmail ออกไปแล้วครับ เหลือแค่ Success */}
        <Route path="/admin/payment/success" element={<PaymentSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;