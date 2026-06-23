import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalLoader from './GlobalLoader'; 

// 🎯 1. นำเข้าหน้า Dashboard และ Comment
import GuestDashboard from './GuestDashboard';
import GuestComment from './GuestComment';
import GuestCommentSuccess from './GuestCommentSuccess';

// 🎯 2. นำเข้าหน้า Booking Flow (Frame 9 - 18)
import GuestBooking from './GuestBooking';      // Frame 9: หน้าเลือกวิธี
import UploadDocument from './UploadDocument';  // Frame 10 & 14: หน้าอัปโหลด/Loading
import GuestForm from './GuestForm';            // Frame 15: หน้ากรอกข้อมูล
import RecommendRoom from './RecommendRoom';    // Frame 16: หน้าแนะนำห้อง
import BookingConfirm from './BookingConfirm';  // Frame 17: หน้าสรุปข้อมูล
import BookingSuccess from './BookingSuccess';  // Frame 18: หน้าสำเร็จ

function App() {
  return (
    <Router>
      <GlobalLoader>
        <Routes>
          {/* Dashboard หลัก */}
          <Route path="/" element={<GuestDashboard />} />
          
          {/* ระบบ Comment */}
          <Route path="/comment" element={<GuestComment />} />
          <Route path="/comment/success" element={<GuestCommentSuccess />} />

          {/* 🌟 ระบบ Booking Flow แบบ Multi-step */}
          <Route path="/booking" element={<GuestBooking />} />
          <Route path="/upload-document" element={<UploadDocument />} />
          <Route path="/guest-form" element={<GuestForm />} />
          <Route path="/recommend-room" element={<RecommendRoom />} />
          <Route path="/booking-confirm" element={<BookingConfirm />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          
        </Routes>
      </GlobalLoader>
    </Router>
  );
}

export default App;