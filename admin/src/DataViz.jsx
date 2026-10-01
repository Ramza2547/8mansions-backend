import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart, Doughnut, Bar } from 'react-chartjs-2';

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
  
  const [kpi, setKpi] = useState({ revenue: 0, cost: 0, profit: 0, margin: 0 });
  const [costDetails, setCostDetails] = useState({ pea: 0, pwa: 0, internet: 0, custom: 0 });
  // 🌟 เพิ่มประกาศ State ตัวนี้เพื่อแก้ปัญหา ReferenceError
  const [revenueDetails, setRevenueDetails] = useState({ rental: 0, elec: 0, water: 0, other: 0 });
  
  const [mainChartData, setMainChartData] = useState(null);
  const [revenueDoughnutData, setRevenueDoughnutData] = useState(null);
  const [costDoughnutData, setCostDoughnutData] = useState(null);
  const [roomBarData, setRoomBarData] = useState(null);

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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
    setIsLoading(true);
    setLoadProgress(0);
    setCountdown(60);
    setStatusMessage(retryCount.current > 0 ? `กำลังลองเชื่อมต่อใหม่รอบที่ ${retryCount.current}...` : 'กำลังดึงข้อมูลการเงินทั้งหมด...');

    window.vizInterval = setInterval(() => {
      setLoadProgress((prev) => (prev < 90 ? prev + Math.floor(Math.random() * 5) + 2 : prev));
    }, 1000);

    window.vizCountdown = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    try {
      const [resInvoices, resUtils] = await Promise.all([
        axios.get('https://eightmansions-backend-1.onrender.com/api/invoices/', { timeout: 60000 }),
        axios.get('https://eightmansions-backend-1.onrender.com/api/utility-costs/', { timeout: 60000 })
      ]);

      setAllInvoices(Array.isArray(resInvoices.data) ? resInvoices.data : []);
      setAllUtils(Array.isArray(resUtils.data) ? resUtils.data : []);

      clearInterval(window.vizInterval);
      clearInterval(window.vizCountdown);
      setLoadProgress(100);
      setStatusMessage('โหลดข้อมูลสำเร็จ!');
      
      setTimeout(() => setIsLoading(false), 800);
      retryCount.current = 0;

    } catch (error) {
      clearInterval(window.vizInterval);
      clearInterval(window.vizCountdown);
      setStatusMessage('เซิร์ฟเวอร์ยังไม่ตอบสนอง... กำลังเริ่มโหลดใหม่');
      retryCount.current += 1;
      setTimeout(() => fetchData(), 3000); 
    }
  };

  useEffect(() => {
    if (isLoading) return; 

    const isYearlyView = filterValue.endsWith('-ALL');
    let totalRev = 0, totalCost = 0, totalProfit = 0;
    let tPea = 0, tPwa = 0, tNet = 0, tCustom = 0;
    let tRental = 0, tElecRev = 0, tWaterRev = 0, tOtherRev = 0;
    const roomRevenues = Array(8).fill(0);

    if (isYearlyView) {
      const yearStr = filterValue.split('-')[0];
      const monthlyRevenue = Array(12).fill(0);
      const monthlyCost = Array(12).fill(0);
      const monthlyProfit = Array(12).fill(0);

      allInvoices.forEach(inv => {
        const bMonth = inv.billingMonth || '';
        if (inv.isPaid && bMonth.includes(yearStr)) {
          const monthIndex = MONTHS.indexOf(bMonth.split(' ')[0]);
          const rIdx = ROOMS.indexOf(inv.room);
          const invTotal = Number(inv.totalAmount) || 0;
          const invRental = Number(inv.roomRental) || 0;
          const invElec = Number(inv.elecBill) || 0;
          const invWater = Number(inv.waterBill) || 0;
          const invOther = invTotal - invRental - invElec - invWater;

          if (monthIndex !== -1) monthlyRevenue[monthIndex] += invTotal;
          if (rIdx !== -1) roomRevenues[rIdx] += invTotal;
          
          totalRev += invTotal;
          tRental += invRental;
          tElecRev += invElec;
          tWaterRev += invWater;
          tOtherRev += invOther;
        }
      });

      allUtils.forEach(cost => {
        const bMonth = cost.billingMonth || '';
        if (bMonth.includes(yearStr)) {
          const monthIndex = MONTHS.indexOf(bMonth.split(' ')[0]);
          if (monthIndex !== -1) {
            const pea = Number(cost.pea_cost) || 0;
            const pwa = Number(cost.pwa_cost) || 0;
            const net = Number(cost.internet_cost) || 0;
            
            let customTotal = 0;
            try {
              const parsedCustom = typeof cost.custom_expenses === 'string' ? JSON.parse(cost.custom_expenses) : (cost.custom_expenses || []);
              customTotal = parsedCustom.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
            } catch(e) {}

            const monthCost = pea + pwa + net + customTotal;
            monthlyCost[monthIndex] += monthCost;
            
            tPea += pea; tPwa += pwa; tNet += net; tCustom += customTotal;
            totalCost += monthCost;
          }
        }
      });

      for (let i = 0; i < 12; i++) {
        monthlyProfit[i] = monthlyRevenue[i] - monthlyCost[i];
      }
      totalProfit = totalRev - totalCost;

      setMainChartData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          { type: 'line', label: 'Net Profit', data: monthlyProfit, borderColor: '#2ECC71', backgroundColor: '#2ECC71', borderWidth: 3, tension: 0.4, pointBackgroundColor: '#fff', pointBorderWidth: 2, pointRadius: 4, order: 1 },
          { type: 'bar', label: 'Total Revenue', data: monthlyRevenue, backgroundColor: 'rgba(52, 152, 219, 0.85)', borderRadius: 6, order: 2 },
          { type: 'bar', label: 'Total Cost', data: monthlyCost, backgroundColor: 'rgba(231, 76, 60, 0.85)', borderRadius: 6, order: 3 }
        ]
      });

    } else {
      allInvoices.forEach(inv => {
        if (inv.isPaid && inv.billingMonth === filterValue) {
          const rIdx = ROOMS.indexOf(inv.room);
          const invTotal = Number(inv.totalAmount) || 0;
          const invRental = Number(inv.roomRental) || 0;
          const invElec = Number(inv.elecBill) || 0;
          const invWater = Number(inv.waterBill) || 0;
          const invOther = invTotal - invRental - invElec - invWater;

          if (rIdx !== -1) roomRevenues[rIdx] += invTotal;
          
          totalRev += invTotal;
          tRental += invRental;
          tElecRev += invElec;
          tWaterRev += invWater;
          tOtherRev += invOther;
        }
      });

      const costObj = allUtils.find(c => (c.billingMonth || '') === filterValue);
      if (costObj) {
        tPea = Number(costObj.pea_cost) || 0;
        tPwa = Number(costObj.pwa_cost) || 0;
        tNet = Number(costObj.internet_cost) || 0;
        
        try {
          const parsedCustom = typeof costObj.custom_expenses === 'string' ? JSON.parse(costObj.custom_expenses) : (costObj.custom_expenses || []);
          tCustom = parsedCustom.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        } catch(e) {}

        totalCost = tPea + tPwa + tNet + tCustom;
      }
      totalProfit = totalRev - totalCost;

      setMainChartData({
        labels: ROOMS,
        datasets: [
          { type: 'bar', label: 'Revenue by Room (THB)', data: roomRevenues, backgroundColor: 'rgba(52, 152, 219, 0.85)', borderRadius: 6, borderWidth: 1, borderColor: '#2980B9' }
        ]
      });
    }

    setRevenueDoughnutData({
      labels: ['Room Rental', 'Electricity', 'Water', 'Other (Deposit/Fines)'],
      datasets: [{
        data: [tRental, tElecRev, tWaterRev, tOtherRev],
        backgroundColor: ['#3498DB', '#F1C40F', '#9B59B6', '#95A5A6'],
        borderWidth: 2, hoverOffset: 6
      }]
    });

    setCostDoughnutData({
      labels: ['PEA (ค่าไฟ)', 'PWA (ค่าน้ำ)', 'Internet (ค่าเน็ต)', 'Other Expenses (อื่นๆ)'],
      datasets: [{
        data: [tPea, tPwa, tNet, tCustom],
        backgroundColor: ['#E74C3C', '#3498DB', '#8E44AD', '#F39C12'],
        borderWidth: 2, hoverOffset: 6
      }]
    });

    setRoomBarData({
      labels: ROOMS,
      datasets: [{
        label: 'Total Generated (THB)',
        data: roomRevenues,
        backgroundColor: '#1ABC9C',
        borderRadius: 4
      }]
    });

    const profitMargin = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : 0;

    setKpi({ revenue: totalRev, cost: totalCost, profit: totalProfit, margin: profitMargin });
    setCostDetails({ pea: tPea, pwa: tPwa, internet: tNet, custom: tCustom });
    setRevenueDetails({ rental: tRental, elec: tElecRev, water: tWaterRev, other: tOtherRev });

  }, [filterValue, allInvoices, allUtils, isLoading]); 

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'Inter, sans-serif', weight: 'bold' }, usePointStyle: true, padding: 20 } },
      tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', titleFont: { size: 14 }, bodyFont: { size: 13 }, padding: 12, cornerRadius: 8, callbacks: { label: (c) => ` ${c.dataset.label}: ฿${c.parsed.y.toLocaleString('en-US', {minimumFractionDigits: 2})}` } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } },
      y: { grid: { color: 'rgba(0,0,0,0.06)', borderDash: [5, 5] }, ticks: { callback: (val) => '฿' + val.toLocaleString() } }
    }
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '65%',
    plugins: {
      legend: { position: 'right', labels: { font: { family: 'Inter, sans-serif', size: 12 }, padding: 15, usePointStyle: true } },
      tooltip: { callbacks: { label: (c) => ` ${c.label}: ฿${c.parsed.toLocaleString('en-US', {minimumFractionDigits: 2})}` } }
    }
  };

  const horizontalBarOptions = {
    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ฿${c.parsed.x.toLocaleString('en-US', {minimumFractionDigits: 2})}` } } },
    scales: { x: { grid: { display: false } }, y: { grid: { display: false }, ticks: { font: { weight: 'bold' } } } }
  };

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

      <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full relative">
        {isLoading && (
          <div className="absolute inset-0 bg-[#F4F7F9]/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center py-20 rounded-lg">
            <div className="w-16 h-16 border-4 border-[#8FAFC1] border-t-[#2C3E50] rounded-full animate-spin mb-4 shadow-lg"></div>
            <h3 className="text-xl font-extrabold text-[#2C3E50] mb-2 text-center px-4">{statusMessage}</h3>
            <div className="w-64 bg-gray-300 rounded-full h-2.5 my-3">
              <div className="bg-[#2C3E50] h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${loadProgress}%` }}></div>
            </div>
            <p className="text-[#1A1A1A] font-bold text-sm font-mono mt-1">ใช้เวลาประมาณ: <span className="text-red-600">{countdown}</span> วินาที</p>
          </div>
        )}

        <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
               <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">Data Visualization</h1>
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 mb-6 h-[450px] w-full relative">
            <h2 className="text-xl font-extrabold text-[#2C3E50] mb-1">
              {filterValue.endsWith('-ALL') ? 'Financial Performance Trend' : 'Room Revenue Comparison'}
            </h2>
            <p className="text-sm text-gray-400 mb-6 font-medium">
              {filterValue.endsWith('-ALL') ? 'Monthly revenue, cost, and net profit analysis' : 'Total revenue generated by each room'}
            </p>
            <div className="h-[320px] w-full">
              {mainChartData && <Chart type={filterValue.endsWith('-ALL') ? 'bar' : 'bar'} data={mainChartData} options={chartOptions} />}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[380px] flex flex-col">
              <h2 className="text-lg font-extrabold text-[#2C3E50] mb-4">Revenue Structure</h2>
              <div className="relative flex-1 flex justify-center items-center">
                {kpi.revenue > 0 ? (
                  <Doughnut data={revenueDoughnutData} options={doughnutOptions} />
                ) : (
                  <div className="text-gray-300 font-bold italic">No Revenue Data</div>
                )}
                {kpi.revenue > 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-[110px]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Total</span>
                    <span className="text-sm font-black text-[#2C3E50]">{(kpi.revenue / 1000).toFixed(1)}k</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[380px] flex flex-col">
              <h2 className="text-lg font-extrabold text-[#2C3E50] mb-4">Cost Distribution</h2>
              <div className="relative flex-1 flex justify-center items-center">
                {kpi.cost > 0 ? (
                  <Doughnut data={costDoughnutData} options={doughnutOptions} />
                ) : (
                  <div className="text-gray-300 font-bold italic">No Cost Data</div>
                )}
                {kpi.cost > 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-[120px]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Total</span>
                    <span className="text-sm font-black text-red-500">{(kpi.cost / 1000).toFixed(1)}k</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[380px] flex flex-col">
              <h2 className="text-lg font-extrabold text-[#2C3E50] mb-1">Top Performing Rooms</h2>
              <p className="text-xs text-gray-400 mb-4 font-medium">Ranked by total revenue generated</p>
              <div className="flex-1 w-full relative">
                 {roomBarData && <Bar data={roomBarData} options={horizontalBarOptions} />}
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