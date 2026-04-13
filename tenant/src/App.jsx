import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalLoader from './GlobalLoader'; // 🎯 นำเข้า GlobalLoader

import GuestDashboard from './GuestDashboard';
import GuestBooking from './GuestBooking';
// 🎯 นำเข้าไฟล์หน้า Comment ที่เพิ่งสร้าง
import GuestComment from './GuestComment';
import GuestCommentSuccess from './GuestCommentSuccess';

function App() {
  return (
    <Router>
      {/* 🎯 เอา GlobalLoader มาครอบ Routes เอาไว้ทั้งก้อนเช่นกันครับ */}
      <GlobalLoader>
        <Routes>
          <Route path="/" element={<GuestDashboard />} />
          <Route path="/booking" element={<GuestBooking />} />
          
          {/* 🎯 เพิ่มเส้นทางสำหรับระบบ Comment */}
          <Route path="/comment" element={<GuestComment />} />
          <Route path="/comment/success" element={<GuestCommentSuccess />} />
        </Routes>
      </GlobalLoader>
    </Router>
  );
}

export default App;