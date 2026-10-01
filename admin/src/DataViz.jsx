import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart, Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(...registerables);

function DataViz() {
  const navigate = useNavigate();
  const [filterValue, setFilterValue] = useState(new Date().getFullYear().toString() + '-ALL');
  
  const [allInvoices, setAllInvoices] = useState([]);
  const [allUtils, setAllUtils] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [countdown, setCountdown] = useState(60);
  const [statusMessage, setStatusMessage] = useState('กำลังเชื่อมต่อฐานข้อมูล...');
  const retryCount = useRef(0);
  
  const [kpi, setKpi] = useState({ revenue: 0, cost: 0, profit: 0, margin: 0, pending: 0 });
  
  // 🌟 States สำหรับเก็บข้อมูลกราฟทั้ง 10 กราฟ
  const [mainChartData, setMainChartData] = useState(null); 
  const [revenueDoughnutData, setRevenueDoughnutData] = useState(null); 
  const [costDoughnutData, setCostDoughnutData] = useState(null); 
  const [roomBarData, setRoomBarData] = useState(null); 
  const [collectionData, setCollectionData] = useState(null); 
  const [utilityPnLData, setUtilityPnLData] = useState(null); 
  const [compositionData, setCompositionData] = useState(null); 
  const [expenseTrendData, setExpenseTrendData] = useState(null); 
  const [marginTrendData, setMarginTrendData] = useState(null); 
  const [passiveIncomeData, setPassiveIncomeData] = useState(null); 

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const ROOMS = ['A1', 'B1', 'C1', 'D1', 'A2', 'B2', 'C2', 'D2'];

  const generateFilterOptions = () => {
    const yearlyOptions = [];
    const monthlyOptions = [];
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() - 1);
    const targetYear = targetDate.getFullYear();

    for (let y = targetYear; y >= 2024; y--) {
      yearlyOptions.push({ value: `${y}-ALL`, label: `${y} (Yearly Overview)` });
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
    fetchData();
    return () => {
      if (window.vizInterval) clearInterval(window.vizInterval);
      if (window.vizCountdown) clearInterval(window.vizCountdown);
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true); setLoadProgress(0); setCountdown(60);
    setStatusMessage(retryCount.current > 0 ? `กำลังลองเชื่อมต่อใหม่รอบที่ ${retryCount.current}...` : 'กำลังดึงข้อมูลการเงินทั้งหมด...');

    window.vizInterval = setInterval(() => setLoadProgress(p => p < 90 ? p + Math.floor(Math.random() * 5) + 2 : p), 1000);
    window.vizCountdown = setInterval(() => setCountdown(p => p > 0 ? p - 1 : 0), 1000);

    try {
      const [resInvoices, resUtils] = await Promise.all([
        axios.get('https://eightmansions-backend-1.onrender.com/api/invoices/', { timeout: 60000 }),
        axios.get('https://eightmansions-backend-1.onrender.com/api/utility-costs/', { timeout: 60000 })
      ]);

      setAllInvoices(Array.isArray(resInvoices.data) ? resInvoices.data : []);
      setAllUtils(Array.isArray(resUtils.data) ? resUtils.data : []);

      clearInterval(window.vizInterval); clearInterval(window.vizCountdown);
      setLoadProgress(100); setStatusMessage('โหลดข้อมูลสำเร็จ!');
      setTimeout(() => setIsLoading(false), 800);
      retryCount.current = 0;
    } catch (error) {
      clearInterval(window.vizInterval); clearInterval(window.vizCountdown);
      setStatusMessage('เซิร์ฟเวอร์ยังไม่ตอบสนอง... กำลังเริ่มโหลดใหม่');
      retryCount.current += 1;
      setTimeout(() => fetchData(), 3000); 
    }
  };

  useEffect(() => {
    if (isLoading) return; 

    const isYearlyView = filterValue.endsWith('-ALL');
    const yearStr = isYearlyView ? filterValue.split('-')[0] : '';
    
    let totalInvoiceRev = 0, totalCost = 0, totalProfit = 0;
    let tPea = 0, tPwa = 0, tNet = 0, tCustom = 0;
    let tRental = 0, tElecRev = 0, tWaterRev = 0, tOtherRev = 0, tWash = 0;
    
    const roomRevenues = Array(8).fill(0);
    const roomRentArr = Array(8).fill(0);
    const roomElecArr = Array(8).fill(0);
    const roomWaterArr = Array(8).fill(0);
    const roomOtherArr = Array(8).fill(0);

    const monthlyRevenue = Array(12).fill(0);
    const monthlyCost = Array(12).fill(0);
    const monthlyProfit = Array(12).fill(0);
    const monthlyMargin = Array(12).fill(0);
    const mRent = Array(12).fill(0), mElec = Array(12).fill(0), mWater = Array(12).fill(0), mOther = Array(12).fill(0), mWash = Array(12).fill(0);
    const mPea = Array(12).fill(0), mPwa = Array(12).fill(0), mNet = Array(12).fill(0);

    const periodInvoices = isYearlyView 
      ? allInvoices.filter(inv => (inv.billingMonth || '').includes(yearStr))
      : allInvoices.filter(inv => inv.billingMonth === filterValue);

    periodInvoices.forEach(inv => {
      const isPaid = inv.isPaid;
      const bMonth = inv.billingMonth || '';
      const monthIndex = MONTHS.indexOf(bMonth.split(' ')[0]);
      const rIdx = ROOMS.indexOf(inv.room);
      
      const invTotal = Number(inv.totalAmount) || 0;
      const invRental = Number(inv.roomRental) || 0;
      const invElec = Number(inv.elecBill) || 0;
      const invWater = Number(inv.waterBill) || 0;
      const invOther = invTotal - invRental - invElec - invWater;

      if (isPaid) {
        totalInvoiceRev += invTotal;
        tRental += invRental; tElecRev += invElec; tWaterRev += invWater; tOtherRev += invOther;
        
        if (isYearlyView && monthIndex !== -1) {
          monthlyRevenue[monthIndex] += invTotal;
          mRent[monthIndex] += invRental; mElec[monthIndex] += invElec; mWater[monthIndex] += invWater; mOther[monthIndex] += invOther;
        }
        if (rIdx !== -1) {
          roomRevenues[rIdx] += invTotal;
          roomRentArr[rIdx] += invRental; roomElecArr[rIdx] += invElec; roomWaterArr[rIdx] += invWater; roomOtherArr[rIdx] += invOther;
        }
      }
    });

    const periodUtils = isYearlyView 
      ? allUtils.filter(c => (c.billingMonth || '').includes(yearStr))
      : allUtils.filter(c => c.billingMonth === filterValue);

    periodUtils.forEach(cost => {
      const bMonth = cost.billingMonth || '';
      const monthIndex = MONTHS.indexOf(bMonth.split(' ')[0]);

      const pea = Number(cost.pea_cost) || 0;
      const pwa = Number(cost.pwa_cost) || 0;
      const net = Number(cost.internet_cost) || 0;
      const wash = Number(cost.washing_machine_income) || 0;
      
      let customTotal = 0;
      try {
        const parsedCustom = typeof cost.custom_expenses === 'string' ? JSON.parse(cost.custom_expenses) : (cost.custom_expenses || []);
        customTotal = parsedCustom.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      } catch(e) {}

      const monthCost = pea + pwa + net + customTotal;
      
      totalCost += monthCost;
      tPea += pea; tPwa += pwa; tNet += net; tCustom += customTotal; tWash += wash;

      if (isYearlyView && monthIndex !== -1) {
        monthlyCost[monthIndex] += monthCost;
        monthlyRevenue[monthIndex] += wash; 
        mWash[monthIndex] += wash;
        mPea[monthIndex] += pea; mPwa[monthIndex] += pwa; mNet[monthIndex] += net;
      }
    });

    const grandTotalRevenue = totalInvoiceRev + tWash;
    totalProfit = grandTotalRevenue - totalCost;
    const profitMargin = grandTotalRevenue > 0 ? ((totalProfit / grandTotalRevenue) * 100).toFixed(1) : 0;

    const expectedFromInvoices = periodInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    const totalPending = expectedFromInvoices - totalInvoiceRev;

    setKpi({ revenue: grandTotalRevenue, cost: totalCost, profit: totalProfit, margin: profitMargin, pending: totalPending });

    if (isYearlyView) {
      for (let i = 0; i < 12; i++) {
        monthlyProfit[i] = monthlyRevenue[i] - monthlyCost[i];
        monthlyMargin[i] = monthlyRevenue[i] > 0 ? (monthlyProfit[i] / monthlyRevenue[i]) * 100 : 0;
      }
      setMainChartData({
        labels: MONTHS_SHORT,
        datasets: [
          { type: 'line', label: 'Net Profit', data: monthlyProfit, borderColor: '#2ECC71', backgroundColor: '#2ECC71', borderWidth: 3, tension: 0.4, pointRadius: 4, order: 1 },
          { type: 'bar', label: 'Total Revenue', data: monthlyRevenue, backgroundColor: 'rgba(52, 152, 219, 0.85)', borderRadius: 4, order: 2 },
          { type: 'bar', label: 'Total Cost', data: monthlyCost, backgroundColor: 'rgba(231, 76, 60, 0.85)', borderRadius: 4, order: 3 }
        ]
      });
      
      setExpenseTrendData({
        labels: MONTHS_SHORT,
        datasets: [
          { label: 'PEA (Electricity)', data: mPea, borderColor: '#E74C3C', backgroundColor: 'rgba(231, 76, 60, 0.1)', fill: true, tension: 0.4 },
          { label: 'PWA (Water)', data: mPwa, borderColor: '#3498DB', backgroundColor: 'rgba(52, 152, 219, 0.1)', fill: true, tension: 0.4 },
          { label: 'Internet', data: mNet, borderColor: '#9B59B6', borderDash: [5, 5], tension: 0.4 }
        ]
      });

      setMarginTrendData({
        labels: MONTHS_SHORT,
        datasets: [{ label: 'Profit Margin (%)', data: monthlyMargin, borderColor: '#8E44AD', backgroundColor: 'rgba(142, 68, 173, 0.2)', fill: true, tension: 0.4 }]
      });

      setCompositionData({
        labels: MONTHS_SHORT,
        datasets: [
          { label: 'Rental', data: mRent, backgroundColor: '#3498DB' },
          { label: 'Electric', data: mElec, backgroundColor: '#F1C40F' },
          { label: 'Water', data: mWater, backgroundColor: '#9B59B6' },
          { label: 'Washing Mach.', data: mWash, backgroundColor: '#1ABC9C' },
          { label: 'Other', data: mOther, backgroundColor: '#95A5A6' }
        ]
      });

      setPassiveIncomeData({
        labels: MONTHS_SHORT,
        datasets: [
          { label: 'Washing Machine', data: mWash, backgroundColor: '#1ABC9C', borderRadius: 4 },
          { label: 'Other Fees', data: mOther, backgroundColor: '#F39C12', borderRadius: 4 }
        ]
      });

    } else {
      setMainChartData({
        labels: ROOMS,
        datasets: [{ type: 'bar', label: 'Revenue by Room', data: roomRevenues, backgroundColor: 'rgba(52, 152, 219, 0.85)', borderRadius: 4 }]
      });

      setExpenseTrendData({
        labels: ['PEA', 'PWA', 'Internet', 'Custom'],
        datasets: [{ label: 'Cost Breakdown', data: [tPea, tPwa, tNet, tCustom], backgroundColor: ['#E74C3C', '#3498DB', '#9B59B6', '#F39C12'], borderRadius: 4 }]
      });

      setMarginTrendData({
        labels: [filterValue],
        datasets: [{ label: 'Profit Margin (%)', data: [profitMargin], backgroundColor: '#8E44AD', borderRadius: 4 }]
      });

      setCompositionData({
        labels: ROOMS,
        datasets: [
          { label: 'Rental', data: roomRentArr, backgroundColor: '#3498DB' },
          { label: 'Electric', data: roomElecArr, backgroundColor: '#F1C40F' },
          { label: 'Water', data: roomWaterArr, backgroundColor: '#9B59B6' },
          { label: 'Other', data: roomOtherArr, backgroundColor: '#95A5A6' }
        ]
      });

      setPassiveIncomeData({
        labels: [filterValue],
        datasets: [
          { label: 'Washing Machine', data: [tWash], backgroundColor: '#1ABC9C', borderRadius: 4 },
          { label: 'Other Fees', data: [tOtherRev], backgroundColor: '#F39C12', borderRadius: 4 }
        ]
      });
    }

    setRevenueDoughnutData({
      labels: ['Room Rental', 'Electricity', 'Water', 'Washing Machine', 'Other'],
      datasets: [{ data: [tRental, tElecRev, tWaterRev, tWash, tOtherRev], backgroundColor: ['#3498DB', '#F1C40F', '#9B59B6', '#1ABC9C', '#95A5A6'], borderWidth: 2, hoverOffset: 6 }]
    });

    setCostDoughnutData({
      labels: ['PEA (Electric)', 'PWA (Water)', 'Internet', 'Other Expenses'],
      datasets: [{ data: [tPea, tPwa, tNet, tCustom], backgroundColor: ['#E74C3C', '#3498DB', '#8E44AD', '#F39C12'], borderWidth: 2, hoverOffset: 6 }]
    });

    setRoomBarData({
      labels: ROOMS,
      datasets: [{ label: 'Total Generated (THB)', data: roomRevenues, backgroundColor: '#1ABC9C', borderRadius: 4 }]
    });

    setCollectionData({
      labels: ['Collected (Paid)', 'Pending (Unpaid)'],
      datasets: [{ data: [grandTotalRevenue, totalPending], backgroundColor: ['#2ECC71', '#E74C3C'], borderWidth: 2, hoverOffset: 6 }]
    });

    setUtilityPnLData({
      labels: ['Electricity', 'Water'],
      datasets: [
        { label: 'Collected from Tenants', data: [tElecRev, tWaterRev], backgroundColor: '#2ECC71', borderRadius: 4 },
        { label: 'Actual Cost (Bills)', data: [tPea, tPwa], backgroundColor: '#E74C3C', borderRadius: 4 }
      ]
    });

  }, [filterValue, allInvoices, allUtils, isLoading]); 

  // ==========================================
  // 🎨 Chart Options
  // ==========================================
  const defaultOpts = {
    responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'Inter', weight: 'bold' }, usePointStyle: true, padding: 15 } },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, cornerRadius: 8, callbacks: { label: (c) => ` ${c.dataset.label}: ฿${c.parsed.y.toLocaleString('en-US', {minimumFractionDigits: 2})}` } }
    },
    scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.06)', borderDash: [5, 5] }, ticks: { callback: (val) => '฿' + val.toLocaleString() } } }
  };

  const stackedOpts = { ...defaultOpts, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: 'rgba(0,0,0,0.06)' } } } };
  
  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false, cutout: '65%',
    plugins: {
      legend: { position: 'right', labels: { font: { size: 11 }, usePointStyle: true } },
      tooltip: { callbacks: { label: (c) => ` ${c.label}: ฿${c.parsed.toLocaleString('en-US', {minimumFractionDigits: 2})}` } }
    }
  };

  // 🌟 เพิ่ม Horizontal Bar Options ที่ตกหล่นไป
  const horizontalBarOptions = {
    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ฿${c.parsed.x.toLocaleString('en-US', {minimumFractionDigits: 2})}` } } },
    scales: { x: { grid: { display: false } }, y: { grid: { display: false }, ticks: { font: { weight: 'bold' } } } }
  };

  const lineOpts = { ...defaultOpts, plugins: { ...defaultOpts.plugins, tooltip: { ...defaultOpts.plugins.tooltip, callbacks: { label: (c) => ` ${c.dataset.label}: ${c.parsed.y.toLocaleString('en-US', {minimumFractionDigits: 1})}${c.dataset.label.includes('%') ? '%' : ' ฿'}` } } } };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F7F9] font-sans pb-10 relative">
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex items-center justify-between min-h-[60px] flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 sm:gap-6 pl-3 sm:pl-8 py-2 font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] overflow-x-auto whitespace-nowrap">
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/admin')}>Home</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/data')}>Data</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/admin/payment')}>Payment</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/admin/feedback')}>Feedback</span>
          </div>
          <div className="flex items-center ml-auto">
            <span onClick={() => navigate('/')} className="mr-3 sm:mr-8 cursor-pointer font-bold hover:text-red-700 text-[13px] sm:text-[16px]">Log out</span>
            <div className="bg-black min-h-[60px] px-3 sm:px-6 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="h-[25px] sm:h-[40px]" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 p-4 sm:p-8 max-w-[1400px] mx-auto w-full relative min-h-[80vh]">
        {isLoading && (
          <div className="fixed inset-0 top-[60px] z-[100] flex flex-col items-center justify-center pb-[15vh] bg-[#F4F7F9]/95 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-[#8FAFC1] border-t-[#2C3E50] rounded-full animate-spin mb-6 shadow-lg"></div>
            <h3 className="text-xl font-extrabold text-[#2C3E50] mb-3 text-center px-4">{statusMessage}</h3>
            <div className="w-64 bg-gray-300 rounded-full h-2.5 my-3 shadow-inner">
              <div className="bg-[#2C3E50] h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${loadProgress}%` }}></div>
            </div>
            <p className="text-[#1A1A1A] font-bold text-sm font-mono mt-2">ใช้เวลาประมาณ: <span className="text-red-600">{countdown}</span> วินาที</p>
          </div>
        )}

        <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
               <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Financial Analytics</h1>
               <p className="text-gray-500 text-sm mt-1">Advanced Financial & Performance Insights</p>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
              <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} disabled={isLoading} className="border-none outline-none bg-transparent font-extrabold text-[#2C3E50] cursor-pointer min-w-[150px] disabled:opacity-50">
                <optgroup label="Yearly Overview">
                  {filterOptions.yearly.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </optgroup>
                <optgroup label="Monthly Details">
                  {filterOptions.monthly.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </optgroup>
              </select>
            </div>
          </div>

          {/* 🌟 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="flex justify-between items-start">
                 <p className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-2">Total Revenue</p>
                 <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
              </div>
              <p className="text-3xl font-black text-[#2C3E50]">฿{kpi.revenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="flex justify-between items-start">
                 <p className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-2">Total Costs</p>
                 <div className="p-2 bg-red-50 rounded-lg text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg></div>
              </div>
              <p className="text-3xl font-black text-red-500">฿{kpi.cost.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center ring-2 ring-[#2ECC71] ring-offset-2">
              <div className="flex justify-between items-start">
                 <p className="text-sm font-extrabold text-[#27AE60] uppercase tracking-widest mb-2">Net Profit</p>
                 <div className="p-2 bg-green-50 rounded-lg text-green-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
              </div>
              <p className="text-3xl font-black text-[#27AE60]">฿{kpi.profit.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="flex justify-between items-start">
                 <p className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-2">Profit Margin</p>
                 <div className="p-2 bg-purple-50 rounded-lg text-purple-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg></div>
              </div>
              <p className="text-3xl font-black text-[#8E44AD]">{kpi.margin}%</p>
            </div>
          </div>

          {/* 🌟 1. Main Trend */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 mb-6 h-[450px] w-full relative">
            <h2 className="text-xl font-extrabold text-[#2C3E50] mb-1">
              {filterValue.endsWith('-ALL') ? '1. Financial Performance Trend (ผลประกอบการ)' : '1. Room Revenue Comparison (รายได้แต่ละห้อง)'}
            </h2>
            <p className="text-sm text-gray-400 mb-6 font-medium">Monthly revenue, cost, and net profit analysis</p>
            <div className="h-[320px] w-full">
              {mainChartData && <Chart type="bar" data={mainChartData} options={defaultOpts} />}
            </div>
          </div>

          {/* 🌟 Row 2: 3 Column Charts (Doughnuts) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[380px] flex flex-col">
              <h2 className="text-lg font-extrabold text-[#2C3E50] mb-4">2. Revenue Structure</h2>
              <div className="relative flex-1 flex justify-center items-center">
                {kpi.revenue > 0 ? <Doughnut data={revenueDoughnutData} options={doughnutOpts} /> : <div className="text-gray-300 font-bold italic">No Data</div>}
                {kpi.revenue > 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-[110px]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Total</span>
                    <span className="text-sm font-black text-[#2C3E50]">{(kpi.revenue / 1000).toFixed(1)}k</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[380px] flex flex-col">
              <h2 className="text-lg font-extrabold text-[#2C3E50] mb-4">3. Cost Distribution</h2>
              <div className="relative flex-1 flex justify-center items-center">
                {kpi.cost > 0 ? <Doughnut data={costDoughnutData} options={doughnutOpts} /> : <div className="text-gray-300 font-bold italic">No Data</div>}
                {kpi.cost > 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-[120px]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Total</span>
                    <span className="text-sm font-black text-red-500">{(kpi.cost / 1000).toFixed(1)}k</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[380px] flex flex-col">
              <h2 className="text-lg font-extrabold text-[#2C3E50] mb-4">4. Collection Status</h2>
              <div className="relative flex-1 flex justify-center items-center">
                {collectionData ? <Doughnut data={collectionData} options={doughnutOpts} /> : <div className="text-gray-300 font-bold italic">No Data</div>}
                {collectionData && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-[120px]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Pending</span>
                    <span className="text-sm font-black text-red-500">{(kpi.pending / 1000).toFixed(1)}k</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🌟 Row 3: 2 Column Deep Dives */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[400px] flex flex-col">
              <h2 className="text-lg font-extrabold text-[#2C3E50] mb-1">5. Revenue Composition Trend</h2>
              <p className="text-xs text-gray-400 mb-4 font-medium">Stacked breakdown of income sources</p>
              <div className="flex-1 w-full relative">
                 {compositionData && <Bar data={compositionData} options={stackedOpts} />}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[400px] flex flex-col">
              <h2 className="text-lg font-extrabold text-[#2C3E50] mb-1">6. Operating Expense Trend</h2>
              <p className="text-xs text-gray-400 mb-4 font-medium">Tracking major utility bills over time</p>
              <div className="flex-1 w-full relative">
                 {expenseTrendData && <Chart type={filterValue.endsWith('-ALL') ? 'line' : 'bar'} data={expenseTrendData} options={lineOpts} />}
              </div>
            </div>
          </div>

          {/* 🌟 Row 4: 2 Column Deep Dives */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[400px] flex flex-col">
              <h2 className="text-lg font-extrabold text-[#2C3E50] mb-1">7. Utility Profitability</h2>
              <p className="text-xs text-gray-400 mb-4 font-medium">Collected from tenants vs Actual Paid to PEA/PWA</p>
              <div className="flex-1 w-full relative">
                 {utilityPnLData && <Bar data={utilityPnLData} options={defaultOpts} />}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[400px] flex flex-col">
              <h2 className="text-lg font-extrabold text-[#2C3E50] mb-1">8. Top Performing Rooms</h2>
              <p className="text-xs text-gray-400 mb-4 font-medium">Ranked by total revenue generated</p>
              <div className="flex-1 w-full relative">
                 {roomBarData && <Bar data={roomBarData} options={{...horizontalBarOptions, plugins: { legend: { display: false } }}} />}
              </div>
            </div>
          </div>

          {/* 🌟 Row 5: 2 Column Deep Dives */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[400px] flex flex-col">
              <h2 className="text-lg font-extrabold text-[#2C3E50] mb-1">9. Profit Margin Trend</h2>
              <p className="text-xs text-gray-400 mb-4 font-medium">Percentage of revenue kept as profit</p>
              <div className="flex-1 w-full relative">
                 {marginTrendData && <Chart type={filterValue.endsWith('-ALL') ? 'line' : 'bar'} data={marginTrendData} options={lineOpts} />}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[400px] flex flex-col">
              <h2 className="text-lg font-extrabold text-[#2C3E50] mb-1">10. Passive Income Analysis</h2>
              <p className="text-xs text-gray-400 mb-4 font-medium">Washing Machine and Other Fees</p>
              <div className="flex-1 w-full relative">
                 {passiveIncomeData && <Bar data={passiveIncomeData} options={defaultOpts} />}
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <button onClick={() => navigate('/admin/financial-data')} className="bg-[#2C3E50] hover:bg-black text-white font-extrabold py-3.5 px-10 rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Financial Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataViz;