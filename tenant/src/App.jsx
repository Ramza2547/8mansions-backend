import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GuestDashboard from './GuestDashboard';
import GuestBooking from './GuestBooking'; // 👈 นำเข้าไฟล์ใหม่

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GuestDashboard />} />
        <Route path="/booking" element={<GuestBooking />} /> {/* 👈 เพิ่มเส้นทาง /booking */}
      </Routes>
    </Router>
  );
}

export default App;