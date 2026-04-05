import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GuestDashboard from './GuestDashboard';
import GuestBooking from './GuestBooking';
// 🎯 นำเข้าไฟล์หน้า Comment ที่เพิ่งสร้าง
import GuestComment from './GuestComment';
import GuestCommentSuccess from './GuestCommentSuccess';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GuestDashboard />} />
        <Route path="/booking" element={<GuestBooking />} />
        
        {/* 🎯 เพิ่มเส้นทางสำหรับระบบ Comment */}
        <Route path="/comment" element={<GuestComment />} />
        <Route path="/comment/success" element={<GuestCommentSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;