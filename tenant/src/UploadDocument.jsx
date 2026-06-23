import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function UploadDocument() {
  const navigate = useNavigate();
  const location = useLocation();
  const documentType = location.state?.type || 'Document';

  const [hasSecondTenant, setHasSecondTenant] = useState(false);
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [alertMessage, setAlertMessage] = useState({ show: false, type: '', text: '', navToForm: false });

  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://eightmansions-backend-1.onrender.com';

  const handleUpload = async () => {
    if (!file1) {
      setAlertMessage({ show: true, type: 'warning', text: 'Please upload Tenant 1 document. (กรุณาอัปโหลดเอกสารของผู้เช่าคนที่ 1)', navToForm: false });
      return;
    }
    if (hasSecondTenant && !file2) {
      setAlertMessage({ show: true, type: 'warning', text: 'Please upload Tenant 2 document. (กรุณาอัปโหลดเอกสารของผู้เช่าคนที่ 2)', navToForm: false });
      return;
    }

    setIsLoading(true);

    try {
      const formData1 = new FormData();
      formData1.append('passport_image', file1);
      formData1.append('doc_type', documentType); 

      const res1 = await axios.post(`${API_BASE_URL}/api/ocr/passport/`, formData1, { headers: { 'Content-Type': 'multipart/form-data' } });
      let extractedData = { tenant1: res1.data };

      if (hasSecondTenant && file2) {
        const formData2 = new FormData();
        formData2.append('passport_image', file2);
        formData2.append('doc_type', documentType);
        const res2 = await axios.post(`${API_BASE_URL}/api/ocr/passport/`, formData2, { headers: { 'Content-Type': 'multipart/form-data' } });
        extractedData.tenant2 = res2.data;
      }

      setIsLoading(false);
      navigate('/guest-form', { state: { ocrData: extractedData, hasSecondTenant } });

    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.response?.data?.error || error.message || "Unknown error";
      console.error('OCR Error Details:', error);
      
      setAlertMessage({ 
        show: true, 
        type: 'error', 
        text: `Scanning failed: ${errorMsg}\n\nระบบจะพาคุณไปยังหน้ากรอกข้อมูลด้วยตนเอง`, 
        navToForm: true 
      });
    }
  };

  const closeAlert = () => {
    const shouldNavigate = alertMessage.navToForm;
    setAlertMessage({ show: false, type: '', text: '', navToForm: false });
    if (shouldNavigate) {
      navigate('/guest-form', { state: { hasSecondTenant } });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F0] font-sans relative">
      
      {/* 🎯 อัปเกรดหน้า Loading: เพิ่ม Spinner วงล้อหมุน และฉากหลังกึ่งโปร่งแสงเบลอๆ */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#F0F0F0]/90 backdrop-blur-sm z-[100] flex flex-col justify-center items-center p-4 text-center transition-all">
          <div className="w-16 h-16 border-4 border-[#8FAFC1] border-t-black rounded-full animate-spin mb-6 shadow-lg"></div>
          <div className="animate-pulse flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4">Reduce blurring</h1>
            <h2 className="text-xl sm:text-2xl font-medium text-gray-600">Please wait...</h2>
          </div>
        </div>
      )}

      {/* 🎯 Custom Popup (ถ้าอันนี้เด้ง แสดงว่าโค้ดใหม่ทำงาน 100%) */}
      {alertMessage.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[110] p-4 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col items-center text-center">
            {alertMessage.type === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500 shadow-inner">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
            )}
            {alertMessage.type === 'warning' && (
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-500 shadow-inner">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
            )}
            <h3 className={`text-xl font-extrabold mb-2 ${alertMessage.type === 'error' ? 'text-red-700' : 'text-yellow-600'}`}>
              {alertMessage.type === 'error' ? 'Scanning Failed' : 'Notice'}
            </h3>
            <p className="text-gray-600 mb-6 font-medium whitespace-pre-line text-sm sm:text-base">{alertMessage.text}</p>
            <button onClick={closeAlert} className={`px-8 py-3 font-bold text-white rounded-full transition-transform active:scale-95 w-full shadow-md ${alertMessage.type === 'error' ? 'bg-[#E74C3C] hover:bg-[#C0392B]' : 'bg-[#F39C12] hover:bg-[#D68910]'}`}>
              OK
            </button>
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex justify-between items-stretch w-full min-h-[60px] sm:min-h-[80px]">
          <div className="flex gap-4 sm:gap-10 items-center px-[5%]">
            <span onClick={() => navigate('/')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium hover:underline">Home</span>
            <span onClick={() => navigate('/booking')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium underline">Booking</span>
            <span onClick={() => navigate('/comment')} className="cursor-pointer text-[14px] sm:text-[18px] font-medium hover:underline">Comment</span>
          </div>
          <div className="bg-black px-4 sm:px-[30px] flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="h-[40px] sm:h-[70px] w-auto block" />
          </div>
        </div>
      </nav>

      <div className="flex-1 flex justify-center items-center p-4">
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-xl w-full max-w-lg text-center animate-fade-in-up">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-6 sm:mb-8">Upload your {documentType}</h2>
          
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col items-start bg-gray-50 p-4 rounded border transition-colors hover:border-[#8FAFC1]">
              <label className="font-bold mb-2 text-sm sm:text-base text-[#2C3E50]">Tenant 1</label>
              <input type="file" accept="image/*" onChange={(e) => setFile1(e.target.files[0])} className="w-full text-sm sm:text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e0eaf1] file:text-[#2C3E50] hover:file:bg-[#d0dfeb]" />
            </div>

            <div className="flex items-center gap-3 py-1 px-2">
              <input type="checkbox" id="twoTenants" checked={hasSecondTenant} onChange={(e) => setHasSecondTenant(e.target.checked)} className="w-5 h-5 cursor-pointer accent-[#8FAFC1]" />
              <label htmlFor="twoTenants" className="font-bold cursor-pointer text-sm sm:text-base text-[#2C3E50]">I have 2nd Tenant</label>
            </div>

            {hasSecondTenant && (
              <div className="flex flex-col items-start bg-green-50 p-4 rounded border border-green-200 transition-colors hover:border-green-400">
                <label className="font-bold text-green-800 mb-2 text-sm sm:text-base">Tenant 2</label>
                <input type="file" accept="image/*" onChange={(e) => setFile2(e.target.files[0])} className="w-full text-sm sm:text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-800 hover:file:bg-green-200" />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 sm:mt-4">
              <button onClick={() => navigate('/booking')} className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-lg shadow-sm transition-transform active:scale-95 text-sm sm:text-base">Back</button>
              <button onClick={handleUpload} className="w-full sm:flex-1 bg-[#8FAFC1] hover:bg-[#7fa1b5] text-white font-bold py-3.5 rounded-lg shadow-sm transition-transform active:scale-95 text-sm sm:text-base">Select (Scan)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadDocument;