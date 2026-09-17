import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Chart, Doughnut, Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// 🎯 ลงทะเบียน Plugin ให้ครบ และรวม ChartDataLabels ไว้ตรงนี้เลย
ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler, ChartDataLabels
);

function DataViz() {
  const navigate = useNavigate();
  const [filterValue, setFilterValue] = useState(new Date().getFullYear().toString() + '-ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [kpi, setKpi] = useState({ revenue: 0, cost: 0, profit: 0 });

  const [mainChartData, setMainChartData] = useState(null);
  const [breakdownChartData, setBreakdownChartData] = useState(null);
  const [costChartData, setCostChartData] = useState(null);

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
    const fetchAndProcessData = async () => {
      setIsLoading(true);
      try {
        const [resInvoices, resUtils] = await Promise.all([
          axios.get('https://eightmansions-backend-1.onrender.com/api/invoices/'),
          axios.get('https://eightmansions-backend-1.onrender.com/api/utility-costs/')
        ]);

        const isYearlyView = filterValue.endsWith('-ALL');
        let totalRev = 0, totalCost = 0, totalProfit = 0;
        let totalPEA = 0, totalPWA = 0;

        if (isYearlyView) {
          const yearStr = filterValue.split('-')[0];
          
          const monthlyRevenue = Array(12).fill(0);
          const monthlyCost = Array(12).fill(0);
          const monthlyProfit = Array(12).fill(0);
          const monthlyRental = Array(12).fill(0);
          const monthlyElecRev = Array(12).fill(0);
          const monthlyWaterRev = Array(12).fill(0);

          resInvoices.data.forEach(inv => {
            // 🎯 ป้องกัน Error หน้าขาว: ดักกรณี billingMonth เป็นค่าว่าง
            const bMonth = inv.billingMonth || '';
            if (inv.isPaid && bMonth.includes(yearStr)) {
              const monthIndex = MONTHS.indexOf(bMonth.split(' ')[0]);
              if (monthIndex !== -1) {
                monthlyRevenue[monthIndex] += Number(inv.totalAmount) || 0;
                monthlyRental[monthIndex] += Number(inv.roomRental) || 0;
                monthlyElecRev[monthIndex] += Number(inv.elecBill) || 0;
                monthlyWaterRev[monthIndex] += Number(inv.waterBill) || 0;
                totalRev += Number(inv.totalAmount) || 0;
              }
            }
          });

          resUtils.data.forEach(cost => {
            // 🎯 ป้องกัน Error หน้าขาว: ดักกรณี billingMonth เป็นค่าว่าง
            const bMonth = cost.billingMonth || '';
            if (bMonth.includes(yearStr)) {
              const monthIndex = MONTHS.indexOf(bMonth.split(' ')[0]);
              if (monthIndex !== -1) {
                const pea = Number(cost.pea_cost) || 0;
                const pwa = Number(cost.pwa_cost) || 0;
                monthlyCost[monthIndex] += (pea + pwa);
                totalPEA += pea;
                totalPWA += pwa;
                totalCost += (pea + pwa);
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
              { type: 'line', label: 'Net Profit', data: monthlyProfit, borderColor: '#2ECC71', backgroundColor: 'rgba(46, 204, 113, 0.1)', borderWidth: 3, tension: 0.4, fill: true, order: 1 },
              { type: 'bar', label: 'Total Revenue', data: monthlyRevenue, backgroundColor: 'rgba(52, 152, 219, 0.8)', borderRadius: 4, order: 2 },
              { type: 'bar', label: 'Total Cost', data: monthlyCost, backgroundColor: 'rgba(231, 76, 60, 0.8)', borderRadius: 4, order: 3 }
            ]
          });

          setBreakdownChartData({
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
              { label: 'Room Rental', data: monthlyRental, backgroundColor: '#3498DB' },
              { label: 'Electric Income', data: monthlyElecRev, backgroundColor: '#F1C40F' },
              { label: 'Water Income', data: monthlyWaterRev, backgroundColor: '#9B59B6' }
            ]
          });

        } else {
          // โหมดรายเดือน
          const roomRevenues = Array(8).fill(0);
          const roomRental = Array(8).fill(0);
          const roomElec = Array(8).fill(0);
          const roomWater = Array(8).fill(0);
          
          resInvoices.data.forEach(inv => {
            const bMonth = inv.billingMonth || '';
            if (inv.isPaid && bMonth === filterValue) {
              const rIdx = ROOMS.indexOf(inv.room);
              if (rIdx !== -1) {
                roomRevenues[rIdx] += Number(inv.totalAmount) || 0;
                roomRental[rIdx] += Number(inv.roomRental) || 0;
                roomElec[rIdx] += Number(inv.elecBill) || 0;
                roomWater[rIdx] += Number(inv.waterBill) || 0;
                totalRev += Number(inv.totalAmount) || 0;
              }
            }
          });

          const costObj = resUtils.data.find(c => (c.billingMonth || '') === filterValue);
          if (costObj) {
            totalPEA = Number(costObj.pea_cost) || 0;
            totalPWA = Number(costObj.pwa_cost) || 0;
            totalCost = totalPEA + totalPWA;
          }
          totalProfit = totalRev - totalCost;

          setMainChartData({
            labels: ROOMS,
            datasets: [
              { type: 'bar', label: `รายรับสุทธิแต่ละห้อง (${filterValue})`, data: roomRevenues, backgroundColor: 'rgba(46, 204, 113, 0.8)', borderRadius: 4 }
            ]
          });

          setBreakdownChartData({
            labels: ROOMS,
            datasets: [
              { label: 'Room Rental', data: roomRental, backgroundColor: '#3498DB' },
              { label: 'Electric Income', data: roomElec, backgroundColor: '#F1C40F' },
              { label: 'Water Income', data: roomWater, backgroundColor: '#9B59B6' }
            ]
          });
        }

        setCostChartData({
          labels: ['PEA (ค่าไฟการไฟฟ้า)', 'PWA (ค่าน้ำประปา)'],
          datasets: [{
            data: [totalPEA, totalPWA],
            backgroundColor: ['#E74C3C', '#3498DB'],
            hoverOffset: 4,
            borderWidth: 2
          }]
        });

        setKpi({ revenue: totalRev, cost: totalCost, profit: totalProfit });

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndProcessData();
  }, [filterValue]);

  // 🎯 Options: ปิด datalabels ไม่ให้กวนกราฟแท่งและกราฟเส้น
  const commonOptions = {
    responsive: true, 
    maintainAspectRatio: false,
    layout: { padding: { bottom: 10 } }, 
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12, weight: 'bold' } } },
      tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ฿${c.parsed.y.toLocaleString('en-US', {minimumFractionDigits: 2})}` } },
      datalabels: { display: false } // ปิดปลั๊กอิน DataLabels ตรงนี้
    },
    scales: { 
      x: { ticks: { padding: 5 } }, 
      y: { display: true, grid: { color: 'rgba(0,0,0,0.05)' } } 
    }
  };

  const stackedOptions = {
    ...commonOptions,
    scales: { 
      x: { stacked: true, ticks: { padding: 5 } }, 
      y: { stacked: true, grid: { color: 'rgba(0,0,0,0.05)' } } 
    }
  };

  // 🎯 Options โดนัท: เปิด datalabels เพื่อโชว์เปอร์เซ็นต์
  const doughnutOptions = {
    responsive: true, 
    maintainAspectRatio: false,
    layout: { padding: 20 },
    plugins: { 
      legend: { position: 'right' },
      tooltip: { callbacks: { label: (c) => ` ${c.label}: ฿${c.parsed.toLocaleString('en-US', {minimumFractionDigits: 2})}` } },
      datalabels: {
        display: true, // เปิดใช้งานเฉพาะกราฟนี้
        color: '#fff',
        font: { weight: 'bold', size: 12 },
        formatter: (value, ctx) => {
          let total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          if (total === 0 || value === 0) return '';
          let percentage = Math.round((value / total) * 100) + '%';
          return `฿${value.toLocaleString()}\n(${percentage})`;
        },
        textAlign: 'center'
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] font-sans pb-10">
      
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
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

      <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
            Financial Dashboard
          </h1>
          <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-300">
            <label className="font-bold text-gray-700 mr-2">Filter:</label>
            <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="p-1 sm:p-2 border-none outline-none bg-transparent font-bold text-[#9B59B6] cursor-pointer min-w-[150px]">
              <optgroup label="Yearly Overview">
                {filterOptions.yearly.map(opt => <option key={opt.value} value={opt.value} className="font-bold">{opt.label}</option>)}
              </optgroup>
              <optgroup label="Monthly Details">
                {filterOptions.monthly.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </optgroup>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
            <p className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-2xl sm:text-3xl font-black text-gray-800">฿{kpi.revenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-red-500">
            <p className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Cost (PEA/PWA)</p>
            <p className="text-2xl sm:text-3xl font-black text-red-600">฿{kpi.cost.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500">
            <p className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Net Profit</p>
            <p className="text-2xl sm:text-3xl font-black text-green-600">฿{kpi.profit.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[400px]">
            <div className="w-12 h-12 border-4 border-[#9B59B6] border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-lg font-bold text-gray-500">Loading Dashboard...</div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 h-[400px] w-full border border-gray-200">
              <h2 className="text-lg font-extrabold text-gray-700 mb-2 text-center">
                {filterValue.endsWith('-ALL') ? 'Trend Analysis (รายรับ-ต้นทุน-กำไร)' : 'Room Performance (รายรับสุทธิแต่ละห้อง)'}
              </h2>
              {mainChartData && <Chart type="bar" data={mainChartData} options={commonOptions} />}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-[350px] w-full border border-gray-200">
                <h2 className="text-lg font-extrabold text-gray-700 mb-2 text-center">Revenue Breakdown (โครงสร้างรายได้)</h2>
                {breakdownChartData && <Bar data={breakdownChartData} options={stackedOptions} />}
              </div>

              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-[350px] w-full border border-gray-200 flex flex-col items-center">
                <h2 className="text-lg font-extrabold text-gray-700 mb-2 text-center">Cost Distribution (สัดส่วนต้นทุน)</h2>
                <div className="relative w-full h-[250px] flex justify-center">
                  {kpi.cost > 0 ? (
                    <Doughnut data={costChartData} options={doughnutOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 font-bold italic">No Cost Data</div>
                  )}
                </div>
              </div>

            </div>
          </>
        )}

        <div className="mt-10 flex justify-center">
          <button onClick={() => navigate('/admin/payment')} className="bg-[#8FAFC1] hover:bg-[#7a96a8] text-black font-bold py-3 px-10 rounded-lg shadow-md transition-transform active:scale-95">
            Back to Payment Data
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default DataViz;