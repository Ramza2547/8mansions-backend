import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GlobalLoader from './GlobalLoader'; 

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
import AdminFeedback from './AdminFeedback';
import FinancialData from './FinancialData';
import DataViz from './DataViz';
import AdminFeedbackDashboard from './AdminFeedbackDashboard'; 

function App() {
  return (
    <BrowserRouter>
      <GlobalLoader>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/admin-welcome" element={<AdminWelcomePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/admin/delete-confirm" element={<DeleteConfirm />} />
          <Route path="/admin/delete-success" element={<DeleteSuccess />} />
          <Route path="/admin/payment" element={<PaymentInput />} />
          <Route path="/admin/payment/review" element={<PaymentReview />} />
          <Route path="/admin/payment/checking" element={<PaymentChecking />} />
          <Route path="/admin/payment/success" element={<PaymentSuccess />} />
          <Route path="/admin/feedback" element={<AdminFeedback />} />
          
          {/* 🌟 เปลี่ยน Route จาก revenue-data เป็น financial-data */}
          <Route path="/admin/financial-data" element={<FinancialData />} />
          
          <Route path="/admin/dataviz" element={<DataViz />} />
          <Route path="/admin/feedback/dashboard" element={<AdminFeedbackDashboard />} />
        </Routes>
      </GlobalLoader>
    </BrowserRouter>
  );
}

export default App;