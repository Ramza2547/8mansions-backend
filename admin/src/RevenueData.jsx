import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import axios from 'axios'; 

function THBText(amount) {
  if (isNaN(amount)) return "";
  let isNegative = amount < 0;
  let number = Math.abs(amount).toFixed(2);
  let [integerPart, fractionalPart] = number.split('.');
  const textNumbers = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const textPositions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const readNumber = (numStr) => {
    let text = '';
    let length = numStr.length;
    for (let i = 0; i < length; i++) {
      let digit = parseInt(numStr.charAt(i));
      let pos = length - i - 1;
      if (digit !== 0) {
        if (pos === 0 && digit === 1 && length > 1 && numStr.charAt(i - 1) !== '0') text += 'เอ็ด';
        else if (pos === 1 && digit === 1) text += '';
        else if (pos === 1 && digit === 2) text += 'ยี่';
        else text += textNumbers[digit];
        text += textPositions[pos % 6];
      }
    }
    return text;
  };

  let bahtText = '';
  if (parseInt(integerPart) === 0) bahtText = 'ศูนย์บาท';
  else {
    let intStr = parseInt(integerPart).toString();
    while (intStr.length > 6) {
      let millionPart = intStr.substring(0, intStr.length - 6);
      bahtText += readNumber(millionPart) + 'ล้าน';
      intStr = intStr.substring(intStr.length - 6);
    }
    bahtText += readNumber(intStr) + 'บาท';
  }
  if (parseInt(fractionalPart) === 0) bahtText += 'ถ้วน';
  else bahtText += readNumber(fractionalPart) + 'สตางค์';
  return isNegative ? "ติดลบ" + bahtText : bahtText;
}

function ENGText(amount) {
  if (isNaN(amount)) return "";
  let isNegative = amount < 0;
  const toWords = (num) => {
    if (num === 0) return 'Zero';
    const belowTwenty = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion'];
    let word = '';
    let i = 0;
    while (num > 0) {
      if (num % 1000 !== 0) {
        let part = '';
        let hundreds = Math.floor((num % 1000) / 100);
        let remainder = num % 100;
        if (hundreds > 0) part += belowTwenty[hundreds] + ' Hundred ';
        if (remainder > 0) {
          if (remainder < 20) part += belowTwenty[remainder] + ' ';
          else part += tens[Math.floor(remainder / 10)] + ' ' + (belowTwenty[remainder % 10] ? belowTwenty[remainder % 10] + ' ' : '');
        }
        word = part + thousands[i] + ' ' + word;
      }
      num = Math.floor(num / 1000);
      i++;
    }
    return word.trim();
  };

  let number = Math.abs(amount).toFixed(2);
  let [integerPart, fractionalPart] = number.split('.');
  let engText = toWords(parseInt(integerPart)) + ' Baht';
  if (parseInt(fractionalPart) > 0) engText += ' and ' + toWords(parseInt(fractionalPart)) + ' Satang';
  else engText += ' Only';
  return isNegative ? "Minus " + engText : engText;
}

function RevenueData() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [filterMonth, setFilterMonth] = useState('');
  const [utilityCosts, setUtilityCosts] = useState({});
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false); 

  const pdfRef = useRef(null);

  const ROOM_ORDER = ['A1', 'B1', 'C1', 'D1', 'A2', 'B2', 'C2', 'D2'];

  const generateFilterOptions = () => {
    const yearlyOptions = [];
    const monthlyOptions = [];
    const startDate = new Date(2026, 0); 
    
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() - 1);
    
    const startYear = startDate.getFullYear();
    const targetYear = targetDate.getFullYear();

    for (let y = targetYear; y >= startYear; y--) {
      yearlyOptions.push({ value: `${y}-ALL`, label: `${y}` });
      
      const maxMonth = (y === targetYear) ? targetDate.getMonth() : 11;
      for (let m = maxMonth; m >= 0; m--) {
        const tempDate = new Date(y, m);
        const monthLabel = tempDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        monthlyOptions.push({ value: monthLabel, label: monthLabel });
      }
    }
    return { yearly: yearlyOptions, monthly: monthlyOptions };
  };

  const filterOptions = generateFilterOptions();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resInvoices = await axios.get('https://eightmansions-backend.onrender.com/api/invoices/');
        setInvoices(resInvoices.data);

        const resUtils = await axios.get('https://eightmansions-backend.onrender.com/api/utility-costs/');
        const costObj = {};
        resUtils.data.forEach(item => {
          costObj[item.billingMonth] = { id: item.id, pea: Number(item.pea_cost), pwa: Number(item.pwa_cost) };
        });
        setUtilityCosts(costObj);
      } catch (error) {
        console.error("ดึงข้อมูลบัญชีล้มเหลว", error);
      }
    };
    
    fetchData();

    const defaultMonth = filterOptions.monthly.length > 0 ? filterOptions.monthly[0].value : '';
    if (defaultMonth) setFilterMonth(defaultMonth); 
  }, []);

  const handleTogglePaid = (id) => {
    const targetInvoice = invoices.find(inv => inv.id === id);
    if (!targetInvoice) return;

    const newStatus = !targetInvoice.isPaid;
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, isPaid: newStatus } : inv));
    
    setIsUnsaved(true);
    setSaveSuccess(false);
  };

  const handleToggleAllPaid = (e) => {
    const isChecked = e.target.checked;
    const currentMonthIds = invoices.filter(inv => inv.billingMonth === filterMonth).map(inv => inv.id);
    
    setInvoices(invoices.map(inv => currentMonthIds.includes(inv.id) ? { ...inv, isPaid: isChecked } : inv));
    
    setIsUnsaved(true);
    setSaveSuccess(false);
  };

  const handleUtilityChange = (type, value) => {
    const numValue = Number(value) || 0;
    const currentMonthData = utilityCosts[filterMonth] || { pea: 0, pwa: 0 };
    
    setUtilityCosts({
      ...utilityCosts,
      [filterMonth]: {
        ...currentMonthData,
        [type]: numValue
      }
    });
    
    setIsUnsaved(true);
    setSaveSuccess(false); 
  };

  const handleSaveData = async () => {
    const currentMonthData = utilityCosts[filterMonth] || { pea: 0, pwa: 0 };
    try {
      const payload = {
        billingMonth: filterMonth,
        pea_cost: currentMonthData.pea,
        pwa_cost: currentMonthData.pwa
      };

      const checkRes = await axios.get('https://eightmansions-backend.onrender.com/api/utility-costs/');
      const existing = checkRes.data.find(item => item.billingMonth === filterMonth);

      if (existing) {
         try {
           await axios.patch(`https://eightmansions-backend.onrender.com/api/utility-costs/${existing.id}/`, payload);
         } catch (err) {
           await axios.patch(`https://eightmansions-backend.onrender.com/api/utility-costs/${encodeURIComponent(filterMonth)}/`, payload);
         }
      } else {
         const res = await axios.post('https://eightmansions-backend.onrender.com/api/utility-costs/', payload);
         setUtilityCosts(prev => ({
           ...prev,
           [filterMonth]: { ...prev[filterMonth], id: res.data.id }
         }));
      }

      if (!isYearlyView) {
        const currentMonthInvoices = invoices.filter(inv => inv.billingMonth === filterMonth);
        const patchPromises = currentMonthInvoices.map(inv => 
          axios.patch(`https://eightmansions-backend.onrender.com/api/invoices/${inv.id}/`, { isPaid: inv.isPaid })
        );
        await Promise.all(patchPromises); 
      }
      
      setIsUnsaved(false);
      setSaveSuccess(true); 
      setTimeout(() => setSaveSuccess(false), 3000);

    } catch (error) {
      console.error("บันทึกข้อมูลไม่สำเร็จ:", error);
      alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.message}`);
    }
  };

  const confirmDelete = (id) => setDeleteModal({ isOpen: true, id });

  const handleDelete = async () => {
    const idToDelete = deleteModal.id;
    setInvoices(invoices.filter(inv => inv.id !== idToDelete));
    setDeleteModal({ isOpen: false, id: null });

    try {
      await axios.delete(`https://eightmansions-backend.onrender.com/api/invoices/${idToDelete}/`);
    } catch (error) {
      console.error("ลบข้อมูลไม่สำเร็จ", error);
    }
  };

  const handleSavePdf = () => {
    if (isUnsaved) {
      alert("กรุณากดปุ่ม Save Data เพื่อบันทึกข้อมูลก่อนพิมพ์เอกสารครับ!");
      return;
    }

    const element = pdfRef.current;
    const filename = `8Mansions_Report_${filterMonth.replace(/\s+/g, '_')}.pdf`;
    const opt = {
      margin: 0.3,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, scrollX: 0, scrollY: 0 }, 
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } 
    };
    html2pdf().set(opt).from(element).save();
  };

  const isYearlyView = filterMonth.endsWith('-ALL');
  const yearStr = filterMonth.split('-')[0];

  let displayInvoices = [];
  let currentPea = 0;
  let currentPwa = 0;

  if (isYearlyView) {
    const yearlyPaidInvoices = invoices.filter(inv => inv.billingMonth.includes(yearStr) && inv.isPaid);
    const grouped = {};
    yearlyPaidInvoices.forEach(inv => {
      if (!grouped[inv.room]) {
        grouped[inv.room] = { id: inv.room, room: inv.room, roomRentalRemark: '', roomRental: 0, elecBill: 0, waterBill: 0, totalAmount: 0, remark: '-', isPaid: true };
      }
      // 🎯 ดักทั้งสองรูปแบบเผื่อการทำงานผิดพลาดของ Backend
      const remarkVal = inv.roomRentalRemark || inv.room_rental_remark || '';
      if (remarkVal) grouped[inv.room].roomRentalRemark = remarkVal;

      grouped[inv.room].roomRental += Number(inv.roomRental) || 0;
      grouped[inv.room].elecBill += Number(inv.elecBill) || 0;
      grouped[inv.room].waterBill += Number(inv.waterBill) || 0;
      grouped[inv.room].totalAmount += Number(inv.totalAmount) || 0;
    });
    
    displayInvoices = Object.values(grouped).sort((a, b) => ROOM_ORDER.indexOf(a.room) - ROOM_ORDER.indexOf(b.room));

    Object.keys(utilityCosts).forEach(monthKey => {
      if (monthKey.includes(yearStr) && !monthKey.endsWith('-ALL')) {
        currentPea += utilityCosts[monthKey].pea || 0;
        currentPwa += utilityCosts[monthKey].pwa || 0;
      }
    });
  } else {
    displayInvoices = invoices.filter(inv => inv.billingMonth === filterMonth)
                              .sort((a, b) => ROOM_ORDER.indexOf(a.room) - ROOM_ORDER.indexOf(b.room));
    currentPea = utilityCosts[filterMonth]?.pea || 0;
    currentPwa = utilityCosts[filterMonth]?.pwa || 0;
  }

  const allInvoicesForPeriod = isYearlyView ? invoices.filter(inv => inv.billingMonth.includes(yearStr)) : displayInvoices;
  const grandTotalExpected = allInvoicesForPeriod.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalCollected = allInvoicesForPeriod.filter(inv => inv.isPaid).reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalPending = grandTotalExpected - totalCollected;

  const paidDisplayInvoices = displayInvoices.filter(inv => inv.isPaid);

  const tableRental = paidDisplayInvoices.reduce((sum, inv) => sum + (Number(inv.roomRental) || 0), 0);
  const tableElectric = paidDisplayInvoices.reduce((sum, inv) => sum + (Number(inv.elecBill) || 0), 0);
  const tableWater = paidDisplayInvoices.reduce((sum, inv) => sum + (Number(inv.waterBill) || 0), 0);
  const tableGrandTotal = paidDisplayInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const tableOther = tableGrandTotal - tableRental - tableElectric - tableWater; 

  const isAllPaid = !isYearlyView && displayInvoices.length > 0 && displayInvoices.every(inv => inv.isPaid);

  const pdfInvoices = paidDisplayInvoices; 
  const pdfTotalRental = pdfInvoices.reduce((sum, inv) => sum + (Number(inv.roomRental) || 0), 0);
  const pdfTotalElectric = pdfInvoices.reduce((sum, inv) => sum + (Number(inv.elecBill) || 0), 0);
  const pdfTotalWater = pdfInvoices.reduce((sum, inv) => sum + (Number(inv.waterBill) || 0), 0);
  const pdfGrandTotal = pdfInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const pdfTotalOther = pdfGrandTotal - pdfTotalRental - pdfTotalElectric - pdfTotalWater;

  const getOtherDisplay = (inv, isYearly) => {
    const otherAmt = (Number(inv.totalAmount) - Number(inv.roomRental) - Number(inv.elecBill) - Number(inv.waterBill)) || 0;
    if (Math.abs(otherAmt) < 0.01) return '0.00';
    if (isYearly) return otherAmt.toLocaleString('en-US', {minimumFractionDigits: 2});

    let prefix = '';
    const lower = inv.remark ? inv.remark.toLowerCase() : '';
    if (lower.includes('withholding')) prefix = '(Wds) ';
    else if (lower.includes('deposit')) prefix = '(Ds) ';
    else if (lower.includes('outstanding')) prefix = '(Op) ';
    else if (lower.includes('refund')) prefix = '(Rf) '; 
    return `${prefix}${otherAmt.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  };

  const finalWebProfit = tableGrandTotal - currentPea - currentPwa;
  const finalPdfProfit = pdfGrandTotal - currentPea - currentPwa;

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] font-sans pb-10 relative">
      
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md print:hidden">
        <div className="flex items-center justify-between min-h-[60px] flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 sm:gap-6 pl-3 sm:pl-8 py-2 font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] overflow-x-auto whitespace-nowrap">
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/admin')}>Home</span>
            <span className="cursor-pointer px-1 sm:px-2 underline" onClick={() => navigate('/data')}>Data</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-gray-700 transition-colors" onClick={() => navigate('/admin/payment')}>Payment</span>
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

      {/* ==============================================
          🎯 แม่แบบ PDF
          ============================================== */}
      <div className="absolute top-[-9999px] left-0 z-[-1]">
        <div ref={pdfRef} className="w-[700px] bg-white p-8 text-black font-sans mx-auto">
          
          <div className="flex justify-between items-end border-b-[2px] border-black pb-2 mb-6">
            <h1 className="text-3xl font-extrabold tracking-widest text-[#1A1A1A]">8 MANSIONS</h1>
            <h2 className="text-xl font-bold text-gray-800">
              {isYearlyView ? yearStr : filterMonth}
            </h2>
          </div>

          <table className="w-full text-center border-collapse mb-6 text-[11px] border border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-2 border border-black font-bold w-[10%]">Room</th>
                <th className="py-2 px-2 border border-black font-bold w-[18%]">Rental (THB)</th>
                <th className="py-2 px-2 border border-black font-bold w-[18%]">Electric (THB)</th>
                <th className="py-2 px-2 border border-black font-bold w-[18%]">Water (THB)</th>
                <th className="py-2 px-2 border border-black font-bold w-[18%]">Other (THB)</th>
                <th className="py-2 px-2 border border-black font-bold w-[18%]">Total (THB)</th>
              </tr>
            </thead>
            <tbody>
              {pdfInvoices.length === 0 ? (
                <tr><td colSpan="6" className="py-6 text-gray-500 italic border border-black text-sm">No paid invoices available.</td></tr>
              ) : (
                pdfInvoices.map((inv, idx) => {
                  // 🎯 ดักทั้งรูปแบบ camelCase และ snake_case เผื่อความชัวร์ของ API หลังบ้าน
                  const currentRemark = inv.roomRentalRemark || inv.room_rental_remark || '';
                  return (
                    <tr key={idx}>
                      <td className="py-1.5 px-2 border border-black font-extrabold text-[12px]">{inv.room}</td>
                      <td className="py-1.5 px-2 border border-black text-right">
                        {currentRemark && currentRemark !== '-' && (
                          <span className="block text-[9px] text-gray-500 leading-none mb-0.5">({currentRemark})</span>
                        )}
                        {Number(inv.roomRental).toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </td>
                      <td className="py-1.5 px-2 border border-black text-right">{Number(inv.elecBill).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td className="py-1.5 px-2 border border-black text-right">{Number(inv.waterBill).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td className="py-1.5 px-2 border border-black text-right text-gray-700">{getOtherDisplay(inv, isYearlyView)}</td>
                      <td className={`py-1.5 px-2 border border-black text-right font-extrabold text-[12px] ${Number(inv.totalAmount) < 0 ? 'text-red-600' : ''}`}>
                        {Number(inv.totalAmount).toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
            {pdfInvoices.length > 0 && (
              <tfoot>
                <tr className="bg-gray-100 font-bold border-t-[2px] border-black">
                  <td className="py-2 px-2 border border-black text-[12px]">Total</td>
                  <td className="py-2 px-2 border border-black text-right">{pdfTotalRental.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td className="py-2 px-2 border border-black text-right">{pdfTotalElectric.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td className="py-2 px-2 border border-black text-right">{pdfTotalWater.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td className="py-2 px-2 border border-black text-right">{pdfTotalOther.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td className="py-2 px-2 border border-black text-right text-[13px]">{pdfGrandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                </tr>
              </tfoot>
            )}
          </table>

          <div className="font-extrabold text-[13px] mb-2">Profit Analysis</div>
          <table className="w-full text-center border-collapse mb-4 text-[11px] border border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-2 border border-black">Category</th>
                <th className="py-2 px-2 border border-black text-right">Collected (THB)</th>
                <th className="py-2 px-2 border border-black text-right text-red-600">Actual Cost (THB)</th>
                <th className="py-2 px-2 border border-black text-right text-green-700">Profit (THB)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1.5 px-2 border border-black text-left font-bold">Electricity</td>
                <td className="py-1.5 px-2 border border-black text-right">{pdfTotalElectric.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td className="py-1.5 px-2 border border-black text-right text-red-600">{currentPea.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td className="py-1.5 px-2 border border-black text-right font-bold text-green-700">{(pdfTotalElectric - currentPea).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 border border-black text-left font-bold">Water</td>
                <td className="py-1.5 px-2 border border-black text-right">{pdfTotalWater.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td className="py-1.5 px-2 border border-black text-right text-red-600">{currentPwa.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td className="py-1.5 px-2 border border-black text-right font-bold text-green-700">{(pdfTotalWater - currentPwa).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 border border-black text-left font-bold">Room Rental & Other</td>
                <td className="py-1.5 px-2 border border-black text-right">{(pdfTotalRental + pdfTotalOther).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td className="py-1.5 px-2 border border-black text-right text-red-600">0.00</td>
                <td className="py-1.5 px-2 border border-black text-right font-bold text-green-700">{(pdfTotalRental + pdfTotalOther).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
              </tr>
              <tr className="bg-gray-100 font-bold border-t-[2px] border-black">
                <td colSpan="3" className="py-2 px-2 border border-black text-right text-[12px] text-blue-700">Grand Total Profit</td>
                <td className="py-2 px-2 border border-black text-right text-[13px] text-blue-700">
                  {finalPdfProfit.toLocaleString('en-US', {minimumFractionDigits: 2})}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex flex-col items-end mb-6 mt-2 text-[#2C3E50]">
            <p className="font-black italic text-[14px] tracking-wide mb-1">" {THBText(finalPdfProfit)} "</p>
            <p className="font-black italic text-[12px] text-gray-700 tracking-widest uppercase">" {ENGText(finalPdfProfit)} "</p>
          </div>

          <div className="mt-4 text-[#1A1A1A] border-t border-gray-300 pt-4">
            <div className="font-extrabold text-[12px] mb-1">Remark</div>
            <div className="text-[10px] mb-1">1. Electric bill is 5 baht per 1 unit</div>
            <div className="text-[10px] mb-1">2. Water bill is 7 baht per 1 unit</div>
            <div className="text-[10px] mb-1">3. (Wds) = Withholding deposit (การยึดเงินประกัน)</div>
            <div className="text-[10px] mb-1">4. (Ds) = Deposit (ค่ามัดจำ)</div>
            <div className="text-[10px] mb-1">5. (Op) = Outstanding Payment (ค้างชำระ)</div>
            <div className="text-[10px]">6. (Rf) = Refund (คืนเงิน)</div>
          </div>
          
        </div>
      </div>

      {/* ==============================================
          หน้าเว็บหลัก (Dashboard)
          ============================================== */}
      <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full print:hidden">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
            {isYearlyView ? `Annual Revenue (${yearStr})` : 'Monthly Revenue'}
          </h1>
          
          <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-300">
            <label className="font-bold text-gray-700 mr-2">Select Period:</label>
            <select 
              value={filterMonth} 
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setIsUnsaved(false); 
                setSaveSuccess(false);
              }}
              className="p-1 sm:p-2 border-none outline-none bg-transparent font-bold text-[#3498DB] cursor-pointer min-w-[150px] text-sm sm:text-base"
            >
              <optgroup label="Yearly">
                {filterOptions.yearly.map(opt => (
                  <option key={opt.value} value={opt.value} className="font-bold text-[#2C3E50]">
                    {opt.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Monthly">
                {filterOptions.monthly.map(opt => (
                  <option key={opt.value} value={opt.value} className="text-gray-700">
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
            <p className="text-sm font-bold text-gray-500 uppercase">Expected Revenue</p>
            <p className="text-2xl font-black text-gray-800 whitespace-nowrap">฿{grandTotalExpected.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500">
            <p className="text-sm font-bold text-gray-500 uppercase">Collected (Paid)</p>
            <p className="text-2xl font-black text-green-600 whitespace-nowrap">฿{totalCollected.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-red-500">
            <p className="text-sm font-bold text-gray-500 uppercase">Pending</p>
            <p className="text-2xl font-black text-red-600 whitespace-nowrap">฿{totalPending.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-[#8FAFC1] text-white">
                <tr>
                  <th className="py-4 px-4 font-bold">Room</th>
                  <th className="py-4 px-4 font-bold text-right">Rental (THB)</th>
                  <th className="py-4 px-4 font-bold text-right">Electric (THB)</th>
                  <th className="py-4 px-4 font-bold text-right">Water (THB)</th>
                  <th className="py-4 px-4 font-bold text-right">Other (THB)</th>
                  <th className="py-4 px-4 font-bold text-right">Total (THB)</th>
                  
                  {!isYearlyView && (
                    <th className="py-2 px-4 font-bold text-center border-l border-[#7a96a8]">
                      <div className="flex flex-col items-center justify-center">
                        <span className="mb-1 text-sm">Status (Paid)</span>
                        <label className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded cursor-pointer hover:bg-white/30 transition-colors">
                          <input type="checkbox" checked={isAllPaid} onChange={handleToggleAllPaid} className="w-3 h-3 cursor-pointer accent-[#1A1A1A]" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">All</span>
                        </label>
                      </div>
                    </th>
                  )}
                  {!isYearlyView && <th className="py-4 px-2 font-bold text-center border-l border-[#7a96a8]">Action</th>}
                </tr>
              </thead>
              <tbody>
                {displayInvoices.length === 0 ? (
                  <tr><td colSpan={isYearlyView ? "6" : "8"} className="text-center py-10 text-gray-500 font-medium">No data available for this selection.</td></tr>
                ) : (
                  displayInvoices.map((inv, index) => {
                    // 🎯 ดักทั้งรูปแบบ camelCase และ snake_case เผื่อความชัวร์ของ API หลังบ้าน
                    const webRemark = inv.roomRentalRemark || inv.room_rental_remark || '';
                    return (
                      <tr key={inv.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors`}>
                        <td className="py-3 px-4 font-bold text-gray-800 whitespace-nowrap">{inv.room}</td>
                        
                        <td className="py-3 px-4 text-right text-gray-700 whitespace-nowrap">
                          {webRemark && webRemark !== '-' && (
                            <span className="text-[11px] text-gray-500 mr-1 font-medium">({webRemark})</span>
                          )}
                          {Number(inv.roomRental).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </td>
                        
                        <td className="py-3 px-4 text-right text-gray-700 whitespace-nowrap">{Number(inv.elecBill).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        <td className="py-3 px-4 text-right text-gray-700 whitespace-nowrap">{Number(inv.waterBill).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        <td className="py-3 px-4 text-right text-gray-600 whitespace-nowrap">{getOtherDisplay(inv, isYearlyView)}</td>
                        <td className={`py-3 px-4 text-right font-bold whitespace-nowrap ${Number(inv.totalAmount) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {Number(inv.totalAmount).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </td>
                        
                        {!isYearlyView && (
                          <td className="py-3 px-4 text-center border-l border-gray-100">
                            <label className="flex items-center justify-center cursor-pointer group">
                              <input 
                                type="checkbox" 
                                checked={inv.isPaid} 
                                onChange={() => handleTogglePaid(inv.id)}
                                className="w-5 h-5 cursor-pointer accent-green-600 transition-transform group-hover:scale-110"
                              />
                              <span className={`ml-2 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${inv.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                {inv.isPaid ? 'PAID' : 'PENDING'}
                              </span>
                            </label>
                          </td>
                        )}
                        
                        {!isYearlyView && (
                          <td className="py-3 px-2 text-center border-l border-gray-100">
                            <button 
                              onClick={() => !inv.isPaid && confirmDelete(inv.id)} 
                              disabled={inv.isPaid}
                              className={`p-2 rounded-full transition-colors ${inv.isPaid ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-700 hover:bg-red-50'}`}
                              title={inv.isPaid ? "Cannot delete paid invoice" : "Delete Invoice"}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })
                )}
              </tbody>
              {displayInvoices.length > 0 && (
                <tfoot className="bg-gray-800 text-white font-bold">
                  <tr>
                    <td className="py-4 px-4 text-center uppercase tracking-wider whitespace-nowrap">Total Summary</td>
                    <td className="py-4 px-4 text-right text-[#3498DB] whitespace-nowrap">{tableRental.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td className="py-4 px-4 text-right text-[#F1C40F] whitespace-nowrap">{tableElectric.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td className="py-4 px-4 text-right text-[#3498DB] whitespace-nowrap">{tableWater.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td className="py-4 px-4 text-right text-[#E74C3C] whitespace-nowrap">{tableOther.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td className="py-4 px-4 text-right text-[#2ECC71] text-lg whitespace-nowrap">{tableGrandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    
                    {!isYearlyView && <td colSpan="2" className="py-4 px-4"></td>}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-[#2C3E50]">
          <h2 className="text-xl font-extrabold text-[#2C3E50] mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-[#F39C12]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path></svg>
            Profit Analysis (คำนวณจากยอดที่มีการจ่ายแล้วเท่านั้น)
          </h2>

          {!isYearlyView && (
            <div className="flex flex-col gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">PEA Cost (บิลค่าไฟการไฟฟ้า)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-gray-400">฿</span>
                    <input 
                      type="number" 
                      value={currentPea || ''} 
                      onChange={(e) => handleUtilityChange('pea', e.target.value)}
                      placeholder="ใส่ยอดบิลค่าไฟที่ต้องจ่ายจริง..."
                      className="w-full pl-8 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#F1C40F] outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">PWA Cost (บิลค่าน้ำประปา)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-gray-400">฿</span>
                    <input 
                      type="number" 
                      value={currentPwa || ''} 
                      onChange={(e) => handleUtilityChange('pwa', e.target.value)}
                      placeholder="ใส่ยอดบิลค่าน้ำที่ต้องจ่ายจริง..."
                      className="w-full pl-8 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#3498DB] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px] mb-2">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 font-bold border-b border-gray-300">Category</th>
                  <th className="py-3 px-4 font-bold text-right border-b border-gray-300">Collected from Tenants (THB)</th>
                  <th className="py-3 px-4 font-bold text-right border-b border-gray-300">Actual Cost (THB)</th>
                  <th className="py-3 px-4 font-bold text-right border-b border-gray-300 text-[#27AE60]">Grand Total (THB)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-yellow-50/30">
                  <td className="py-3 px-4 font-bold text-gray-800 whitespace-nowrap">Electricity</td>
                  <td className="py-3 px-4 text-right text-gray-700 whitespace-nowrap">{pdfTotalElectric.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td className="py-3 px-4 text-right text-red-500 whitespace-nowrap">- {currentPea.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td className="py-3 px-4 text-right font-bold text-[#27AE60] whitespace-nowrap">{(pdfTotalElectric - currentPea).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-blue-50/30">
                  <td className="py-3 px-4 font-bold text-gray-800 whitespace-nowrap">Water</td>
                  <td className="py-3 px-4 text-right text-gray-700 whitespace-nowrap">{pdfTotalWater.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td className="py-3 px-4 text-right text-red-500 whitespace-nowrap">- {currentPwa.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td className="py-3 px-4 text-right font-bold text-[#27AE60] whitespace-nowrap">{(pdfTotalWater - currentPwa).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-800 whitespace-nowrap">Room Rental</td>
                  <td className="py-3 px-4 text-right text-gray-700 whitespace-nowrap">{pdfTotalRental.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td className="py-3 px-4 text-right text-gray-400 whitespace-nowrap">0.00</td>
                  <td className="py-3 px-4 text-right font-bold text-[#27AE60] whitespace-nowrap">{pdfTotalRental.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                </tr>
                <tr className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-800 whitespace-nowrap">Other (Ds, Wds, Op, Rf)</td>
                  <td className="py-3 px-4 text-right text-gray-700 whitespace-nowrap">{pdfTotalOther.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td className="py-3 px-4 text-right text-gray-400 whitespace-nowrap">0.00</td>
                  <td className="py-3 px-4 text-right font-bold text-[#27AE60] whitespace-nowrap">{pdfTotalOther.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                </tr>
              </tbody>
              <tfoot className="bg-[#2C3E50] text-white">
                <tr>
                  <td className="py-4 px-4 font-extrabold uppercase whitespace-nowrap">Total Result</td>
                  <td className="py-4 px-4 text-right font-bold text-gray-300 whitespace-nowrap">{pdfGrandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td className="py-4 px-4 text-right font-bold text-red-400 whitespace-nowrap">- {(currentPea + currentPwa).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <span className="font-extrabold text-2xl text-[#2ECC71] border-b-[6px] border-double border-[#2ECC71] pb-2 inline-block leading-none">
                      ฿{finalWebProfit.toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {!isYearlyView && (
            <div className="flex items-center gap-3 mt-4 px-4">
              <button 
                onClick={handleSaveData}
                disabled={!isUnsaved}
                className={`px-6 py-2.5 font-bold rounded shadow-md transition-all duration-300 flex items-center gap-2 ${
                  isUnsaved 
                    ? 'bg-[#3b5998] hover:bg-[#2d4373] text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                Save Data (คลิกเพื่อบันทึก)
              </button>

              {saveSuccess && (
                <div className="flex items-center gap-1 text-green-600 font-extrabold animate-pulse bg-green-100 px-3 py-1.5 rounded-full border border-green-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  <span>บันทึกสำเร็จ!</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col items-end border-t border-gray-200 pt-4">
            <p className="font-black italic text-xl text-[#2C3E50] tracking-wide mb-1">" {THBText(finalWebProfit)} "</p>
            <p className="font-black italic text-lg text-gray-500 tracking-widest uppercase">" {ENGText(finalWebProfit)} "</p>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10 print:hidden">
          <button onClick={() => navigate('/data')} className="bg-[#8FAFC1] hover:bg-[#7a96a8] text-black font-bold py-3 px-10 rounded shadow-md transition-transform active:scale-95">
            Back to Data Page
          </button>
          
          <button 
            onClick={handleSavePdf} 
            disabled={isUnsaved}
            title={isUnsaved ? "กรุณากด Save Data ก่อนพิมพ์เอกสาร" : "Save PDF / Print"}
            className={`${isUnsaved ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-[#2ECC71] hover:bg-[#27AE60] active:scale-95'} text-white font-bold py-3 px-10 rounded shadow-md transition-all duration-300 flex items-center justify-center gap-2`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Save PDF / Print
          </button>
        </div>

      </div>

      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center transform scale-100 transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 border-4 border-red-50">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Delete Financial Data?</h3>
            <p className="text-gray-500 mb-8 text-sm px-2">Are you sure you want to delete this invoice? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, id: null })} 
                className="w-1/2 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                No, Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="w-1/2 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-md shadow-red-200"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default RevenueData;