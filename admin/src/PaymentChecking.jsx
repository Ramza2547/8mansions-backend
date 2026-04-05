import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

function PaymentChecking() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {}; 
  const invoiceRef = useRef(null); 

  if (!data.room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EAEAEA]">
        <h1 className="text-2xl font-bold mb-4">No data found</h1>
        <button onClick={() => navigate('/admin/payment')} className="bg-[#8FAFC1] px-6 py-2">Go Back</button>
      </div>
    );
  }

  // 🎯 โหลด Logic คำนวณ
  const isDeposit = data.hasOther && data.otherDetail === 'Deposit';
  const isWithholding = data.hasOther && data.otherDetail === 'Withholding Deposit';
  const disableRoomRental = isWithholding;
  const disableUtils = isWithholding || isDeposit;

  const roomRental = disableRoomRental ? 0 : Number(data.roomRental) || 0;
  const elecUnit = disableUtils ? 0 : (Number(data.newElectric) || 0) - (Number(data.oldElectric) || 0);
  const waterUnit = disableUtils ? 0 : (Number(data.newWater) || 0) - (Number(data.oldWater) || 0);
  
  const elecBill = disableUtils ? 0 : elecUnit * 5; 
  const waterBill = disableUtils ? 0 : waterUnit * 7; 
  const otherAmt = data.hasOther ? (Number(data.otherAmount) || 0) : 0;

  const totalAmount = roomRental + elecBill + waterBill + otherAmt;

  // 🎯 สร้าง Bill Period ให้เป็นเดือนก่อนหน้าของ Due Date
  let billingPeriod = '-';
  if (data.dueDate) {
    const [year, month, day] = data.dueDate.split('-'); 
    const billDate = new Date(year, month - 1, 1); 
    billDate.setMonth(billDate.getMonth() - 1); 
    billingPeriod = billDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }

  const formattedDueDate = data.dueDate 
    ? new Date(data.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

  const handleFinish = async () => {
    const element = invoiceRef.current;
    const fileNamePeriod = billingPeriod.replace(/\s+/g, '');
    const filename = `${data.room}_${fileNamePeriod}.pdf`;

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
    navigate('/admin/payment/success');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] font-sans">
      <style>
        {`
          @media print {
            @page { margin: 0; }
            body { padding: 1.5cm; }
          }
        `}
      </style>

      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md print:hidden">
        <div className="flex items-center justify-between min-h-[60px]">
          <div className="flex items-center gap-6 pl-8 py-2 font-bold text-[#1A1A1A]">
            <span className="cursor-pointer px-2" onClick={() => navigate('/admin')}>Home</span>
            <span className="cursor-pointer px-2" onClick={() => navigate('/data')}>Data</span>
            <span className="cursor-pointer px-2 underline">Payment</span>
            <span className="cursor-pointer px-2">Feedback</span>
          </div>
          <div className="flex items-center ml-auto">
            <span onClick={() => navigate('/')} className="mr-8 cursor-pointer font-bold hover:text-red-700">Log out</span>
            <div className="bg-black min-h-[60px] px-6 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="h-[40px]" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 py-10 px-4">
        
        <div ref={invoiceRef} className="bg-white max-w-4xl mx-auto shadow-2xl p-10 md:p-16 border border-gray-200">
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-widest text-gray-900">8 MANSIONS</h1>
              <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">
                131/76, 8 Mansions Soi Cheeleuay Bangjo<br/>
                Srisoontorn Road, Sub-district Srisoontorn<br/>
                District Thalang, Phuket 83110
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-light text-gray-400 tracking-wider">INVOICE</h2>
            </div>
          </div>

          <div className="flex justify-between mb-8">
            <div>
              <p className="text-sm font-bold text-gray-800 uppercase mb-1">Tenant Name</p>
              <p className="text-lg text-gray-700">{data.name}</p>
            </div>
            <div className="text-right flex gap-10">
              <div>
                <p className="text-sm font-bold text-gray-800 uppercase mb-1">Billing Period</p>
                <p className="text-lg text-gray-700">{billingPeriod}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 uppercase mb-1">Room Number</p>
                <p className="text-lg text-gray-700 font-bold">{data.room}</p>
              </div>
            </div>
          </div>

          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="border-b border-gray-400">
                <th className="py-3 text-sm font-bold text-gray-800">Description</th>
                <th className="py-3 text-sm font-bold text-gray-800 text-center">Old<br/>Reading</th>
                <th className="py-3 text-sm font-bold text-gray-800 text-center">New<br/>Reading</th>
                <th className="py-3 text-sm font-bold text-gray-800 text-center">Units</th>
                <th className="py-3 text-sm font-bold text-gray-800 text-right">Rate<br/>(THB)</th>
                <th className="py-3 text-sm font-bold text-gray-800 text-right">Amount<br/>(THB)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-4 text-gray-700">Room Rental</td>
                <td className="py-4 text-center text-gray-500">-</td>
                <td className="py-4 text-center text-gray-500">-</td>
                <td className="py-4 text-center text-gray-500">-</td>
                <td className="py-4 text-right text-gray-500">-</td>
                <td className="py-4 text-right text-gray-800">{disableRoomRental ? '-' : roomRental.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-4 text-gray-700">Electricity</td>
                <td className="py-4 text-center text-gray-700">{disableUtils ? '-' : data.oldElectric}</td>
                <td className="py-4 text-center text-gray-700">{disableUtils ? '-' : data.newElectric}</td>
                <td className="py-4 text-center text-gray-700">{disableUtils ? '-' : elecUnit.toFixed(1)}</td>
                <td className="py-4 text-right text-gray-700">{disableUtils ? '-' : '5.00'}</td>
                <td className="py-4 text-right text-gray-800">{disableUtils ? '-' : elecBill.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
              </tr>
              <tr className="border-b border-gray-400">
                <td className="py-4 text-gray-700">Water</td>
                <td className="py-4 text-center text-gray-700">{disableUtils ? '-' : data.oldWater}</td>
                <td className="py-4 text-center text-gray-700">{disableUtils ? '-' : data.newWater}</td>
                <td className="py-4 text-center text-gray-700">{disableUtils ? '-' : waterUnit.toFixed(1)}</td>
                <td className="py-4 text-right text-gray-700">{disableUtils ? '-' : '7.00'}</td>
                <td className="py-4 text-right text-gray-800">{disableUtils ? '-' : waterBill.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
              </tr>

              {/* Other Row */}
              {data.hasOther && (
                <tr className="border-b border-gray-400 bg-yellow-50/50">
                  <td className="py-4 text-gray-800 font-bold italic">Other ({data.otherDetail})</td>
                  <td className="py-4 text-center text-gray-500">-</td>
                  <td className="py-4 text-center text-gray-500">-</td>
                  <td className="py-4 text-center text-gray-500">-</td>
                  <td className="py-4 text-right text-gray-500">-</td>
                  <td className="py-4 text-right text-gray-800 font-bold">{otherAmt.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-between items-end mt-10">
            <div>
              <p className="text-sm font-bold text-gray-800 uppercase mb-1">Due Date</p>
              <p className="text-gray-700 mb-4">{formattedDueDate}</p>
              {/* 🎯 ปรับเลขที่บัญชีให้เป็นตัวหนา และสีเข้มขึ้นตามที่ขอครับ */}
              <p className="text-sm font-bold text-gray-800">795-2711959-5 (SCB) Ram Kiatiruangwit</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800 uppercase mb-2">TOTAL DUE</p>
              <p className="text-3xl font-extrabold text-gray-900 border-t-4 border-double border-gray-800 pt-2">
                THB {totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-8 flex justify-between print:hidden">
          <button onClick={() => navigate(-1)} className="bg-[#FF0000] hover:bg-[#cc0000] text-black font-bold py-3 px-10 rounded shadow-md transition-transform active:scale-95">
            Back
          </button>
          
          <div className="flex gap-4">
            <button onClick={handleFinish} className="bg-[#8FAFC1] hover:bg-[#7a96a8] text-black font-bold py-3 px-10 rounded shadow-md transition-transform active:scale-95">
              Finish
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PaymentChecking;