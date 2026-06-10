import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import axios from 'axios'; 

function PaymentChecking() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {}; 
  const invoiceRef = useRef(null); 

  if (!data.room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EAEAEA] p-4 text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">No data found</h1>
        <button onClick={() => navigate('/admin/payment')} className="bg-[#8FAFC1] px-6 py-2 rounded font-bold">Go Back</button>
      </div>
    );
  }

  const isDeposit = data.hasOther && data.otherDetail === 'Deposit';
  const isWithholding = data.hasOther && data.otherDetail === 'Withholding Deposit';
  const isRefund = data.hasOther && data.otherDetail === 'Refund';

  const disableRoomRental = isWithholding;
  const disableUtils = isWithholding || isDeposit;

  // แปลงค่าที่กรอก - ให้เป็น 0 ตอนคำนวณ
  const roomRental = disableRoomRental || data.roomRental === '-' ? 0 : Number(data.roomRental) || 0;
  
  const elecUnit = disableUtils ? 0 : (Number(data.newElectric) || 0) - (Number(data.oldElectric) || 0);
  const waterUnit = disableUtils ? 0 : (Number(data.newWater) || 0) - (Number(data.oldWater) || 0);
  
  const elecBill = disableUtils ? 0 : elecUnit * 5; 
  const waterBill = disableUtils ? 0 : waterUnit * 7; 
  
  let otherAmt = data.hasOther ? (Number(data.otherAmount) || 0) : 0;
  if (isRefund) {
    otherAmt = -Math.abs(otherAmt);
  }
  
  const totalAmount = roomRental + elecBill + waterBill + otherAmt;

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
    const filename = `8Mansions_${data.room}_${fileNamePeriod}.pdf`;

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, windowWidth: 1024 }, 
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();

    // 🎯 แก้ไขตรงนี้: ส่งไปดักทั้ง 2 แบบให้ Django เข้าใจ
    const newInvoiceRecord = {
      room: data.room,
      name: data.name,
      dueDate: data.dueDate,
      billingMonth: billingPeriod,
      roomRental: roomRental,
      roomRentalRemark: data.roomRentalRemark || '', // สำหรับหน้าบ้าน
      room_rental_remark: data.roomRentalRemark || '', // 🎯 ดักส่งให้ Django หลังบ้าน (snake_case)
      elecBill: elecBill,
      waterBill: waterBill,
      remark: data.hasOther ? data.otherDetail : '', 
      totalAmount: totalAmount,
      isPaid: false
    };

    try {
      await axios.post('https://eightmansions-backend.onrender.com/api/invoices/', newInvoiceRecord);
      navigate('/admin/payment/success');
    } catch (error) {
      console.error("บันทึกบิลล้มเหลว:", error);
      alert("เกิดข้อผิดพลาดในการเซฟบิลลงฐานข้อมูล! โปรดลองอีกครั้ง");
    }
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
        <div className="flex items-center justify-between min-h-[60px] flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 sm:gap-6 pl-3 sm:pl-8 py-2 font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] overflow-x-auto whitespace-nowrap">
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/admin')}>Home</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/data')}>Data</span>
            <span className="cursor-pointer px-1 sm:px-2 underline">Payment</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-gray-700 transition-colors" onClick={() => navigate('/admin/feedback')}>Feedback</span>
          </div>
          <div className="flex items-center ml-auto">
            <span onClick={() => navigate('/')} className="mr-3 sm:mr-8 cursor-pointer font-bold hover:text-red-700 text-[13px] sm:text-[16px]">Log out</span>
            <div className="bg-black min-h-[60px] px-3 sm:px-6 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="h-[25px] sm:h-[40px]" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 py-4 sm:py-10 px-2 sm:px-6 w-full">
        
        <div ref={invoiceRef} className="bg-white w-full max-w-4xl mx-auto shadow-2xl p-4 sm:p-10 md:p-16 border border-gray-200">
          
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-3 sm:pb-6 mb-3 sm:mb-6">
            <div>
              <h1 className="text-[16px] sm:text-3xl font-extrabold tracking-widest text-gray-900 leading-none">8 MANSIONS</h1>
              <p className="text-[8px] sm:text-sm text-gray-600 mt-1 sm:mt-2 whitespace-pre-line leading-tight">
                131/76, 8 Mansions Soi Cheeleuay Bangjo<br/>
                Srisoontorn Road, Sub-district Srisoontorn<br/>
                District Thalang, Phuket 83110
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-[18px] sm:text-4xl font-light text-gray-400 tracking-wider">INVOICE</h2>
            </div>
          </div>

          <div className="flex justify-between mb-4 sm:mb-8">
            <div>
              <p className="text-[8px] sm:text-sm font-bold text-gray-800 uppercase mb-0.5 sm:mb-1">Tenant Name</p>
              <p className="text-[10px] sm:text-lg text-gray-700">{data.name}</p>
            </div>
            <div className="flex gap-4 sm:gap-10 text-right">
              <div>
                <p className="text-[8px] sm:text-sm font-bold text-gray-800 uppercase mb-0.5 sm:mb-1">Billing Period</p>
                <p className="text-[10px] sm:text-lg text-gray-700">{billingPeriod}</p>
              </div>
              <div>
                <p className="text-[8px] sm:text-sm font-bold text-gray-800 uppercase mb-0.5 sm:mb-1">Room No.</p>
                <p className="text-[10px] sm:text-lg text-gray-700 font-bold">{data.room}</p>
              </div>
            </div>
          </div>

          <table className="w-full text-left border-collapse mb-4 sm:mb-8">
            <thead>
              <tr className="border-b border-gray-400">
                <th className="py-1 sm:py-3 text-[8px] sm:text-sm font-bold text-gray-800 pr-1">Description</th>
                <th className="py-1 sm:py-3 text-[8px] sm:text-sm font-bold text-gray-800 text-center px-0.5">Old (Unit)</th>
                <th className="py-1 sm:py-3 text-[8px] sm:text-sm font-bold text-gray-800 text-center px-0.5">New (Unit)</th>
                <th className="py-1 sm:py-3 text-[8px] sm:text-sm font-bold text-gray-800 text-center px-0.5">Total Units</th>
                <th className="py-1 sm:py-3 text-[8px] sm:text-sm font-bold text-gray-800 text-right px-0.5">Rate (THB)</th>
                <th className="py-1 sm:py-3 text-[8px] sm:text-sm font-bold text-gray-800 text-right pl-1">Amount (THB)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 sm:py-4 text-[8px] sm:text-sm text-gray-700">
                  {/* 🎯 ตัดคำว่า Room Rental ออกเมื่อเลือก Refund */}
                  {isRefund ? (data.roomRentalRemark || '-') : 'Room Rental'}
                </td>
                <td className="py-2 sm:py-4 text-center text-[8px] sm:text-sm text-gray-500">-</td>
                <td className="py-2 sm:py-4 text-center text-[8px] sm:text-sm text-gray-500">-</td>
                <td className="py-2 sm:py-4 text-center text-[8px] sm:text-sm text-gray-500">-</td>
                <td className="py-2 sm:py-4 text-right text-[8px] sm:text-sm text-gray-500">-</td>
                <td className="py-2 sm:py-4 text-[9px] sm:text-base text-right text-gray-800">
                  {/* 🎯 ถ้าใส่ - มา ก็ให้โชว์ - ตรงๆ ในไฟล์ PDF เลย */}
                  {disableRoomRental ? '-' : (data.roomRental === '-' ? '-' : roomRental.toLocaleString('en-US', {minimumFractionDigits: 2}))}
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 sm:py-4 text-[8px] sm:text-sm text-gray-700">Electricity</td>
                <td className="py-2 sm:py-4 text-[8px] sm:text-sm text-center text-gray-700">{disableUtils ? '-' : data.oldElectric}</td>
                <td className="py-2 sm:py-4 text-[8px] sm:text-sm text-center text-gray-700">{disableUtils ? '-' : data.newElectric}</td>
                <td className="py-2 sm:py-4 text-[8px] sm:text-sm text-center text-gray-700">{disableUtils ? '-' : elecUnit.toFixed(1)}</td>
                <td className="py-2 sm:py-4 text-[8px] sm:text-sm text-right text-gray-700">{disableUtils ? '-' : '5.00'}</td>
                <td className="py-2 sm:py-4 text-[9px] sm:text-base text-right text-gray-800">{disableUtils ? '-' : elecBill.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
              </tr>
              <tr className="border-b border-gray-400">
                <td className="py-2 sm:py-4 text-[8px] sm:text-sm text-gray-700">Water</td>
                <td className="py-2 sm:py-4 text-[8px] sm:text-sm text-center text-gray-700">{disableUtils ? '-' : data.oldWater}</td>
                <td className="py-2 sm:py-4 text-[8px] sm:text-sm text-center text-gray-700">{disableUtils ? '-' : data.newWater}</td>
                <td className="py-2 sm:py-4 text-[8px] sm:text-sm text-center text-gray-700">{disableUtils ? '-' : waterUnit.toFixed(1)}</td>
                <td className="py-2 sm:py-4 text-[8px] sm:text-sm text-right text-gray-700">{disableUtils ? '-' : '7.00'}</td>
                <td className="py-2 sm:py-4 text-[9px] sm:text-base text-right text-gray-800">{disableUtils ? '-' : waterBill.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
              </tr>
              {data.hasOther && (
                <tr className="border-b border-gray-400 bg-yellow-50/50">
                  <td className="py-2 sm:py-4 text-[8px] sm:text-sm text-gray-800 font-bold italic truncate max-w-[60px] sm:max-w-none">
                    Other <span className="hidden sm:inline">({data.otherDetail})</span>
                  </td>
                  <td className="py-2 sm:py-4 text-center text-[8px] sm:text-sm text-gray-500">-</td>
                  <td className="py-2 sm:py-4 text-center text-[8px] sm:text-sm text-gray-500">-</td>
                  <td className="py-2 sm:py-4 text-center text-[8px] sm:text-sm text-gray-500">-</td>
                  <td className="py-2 sm:py-4 text-right text-[8px] sm:text-sm text-gray-500">-</td>
                  <td className={`py-2 sm:py-4 text-[9px] sm:text-base text-right font-bold ${isRefund ? 'text-red-600' : 'text-gray-800'}`}>
                    {otherAmt.toLocaleString('en-US', {minimumFractionDigits: 2})}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-between items-end mt-4 sm:mt-10">
            <div>
              <p className="text-[8px] sm:text-sm font-bold text-gray-800 uppercase mb-1">Due Date</p>
              <p className="text-[10px] sm:text-base text-gray-700 mb-2 sm:mb-4">{formattedDueDate}</p>
              <p className="text-[8px] sm:text-sm font-bold text-gray-800">
                SCB 795-2711959-5<br className="block sm:hidden"/> 
                <span className="sm:ml-2">Ram Kiatiruangwit</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[8px] sm:text-sm font-bold text-gray-800 uppercase mb-1 sm:mb-2">TOTAL DUE</p>
              <p className={`text-[14px] sm:text-3xl font-extrabold border-t-2 sm:border-t-4 border-double border-gray-800 pt-1 sm:pt-2 ${totalAmount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                THB {totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0 print:hidden min-w-[280px]">
          <button onClick={() => navigate(-1)} className="w-full sm:w-auto bg-[#FF0000] hover:bg-[#cc0000] text-white sm:text-black font-bold py-3 sm:py-3 px-10 rounded shadow-md transition-transform active:scale-95 text-center">
            Back
          </button>
          
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:gap-4">
            <button onClick={handleFinish} className="w-full sm:w-auto bg-[#8FAFC1] hover:bg-[#7a96a8] text-black font-bold py-3 sm:py-3 px-10 rounded shadow-md transition-transform active:scale-95 text-center">
              Finish
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PaymentChecking;