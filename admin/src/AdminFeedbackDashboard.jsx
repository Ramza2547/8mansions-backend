import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);
import { Pie } from 'react-chartjs-2';


function AdminFeedbackDashboard() {
  const navigate = useNavigate();
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [filterMonth, setFilterMonth] = useState('');
  const [chartData, setChartData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  
  const [analyzedFeedbacks, setAnalyzedFeedbacks] = useState([]); 
  const [selectedSentiment, setSelectedSentiment] = useState(null); 
  const [summaryMetrics, setSummaryMetrics] = useState({ total: 0, top: '-', urgent: 0 });

  const COLORS = {
    'Positive': '#2ECC71',
    'Negative': '#E74C3C',
    'Neutral': '#95A5A6',
    'Repair': '#E67E22'
  };

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get('https://eightmansions-backend-1.onrender.com/api/feedbacks/');
        setAllFeedbacks(response.data);
        if (response.data.length === 0) setIsAnalyzing(false);
      } catch (error) {
        console.error("Fetch Error:", error);
        setIsAnalyzing(false);
      }
    };
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    const analyzeData = async () => {
      if (allFeedbacks.length === 0) return;
      setIsAnalyzing(true);
      setSelectedSentiment(null); 

      const filtered = allFeedbacks.filter(fb => {
        if (!filterMonth) return true;
        const fbDate = new Date(fb.created_at);
        return `${fbDate.getFullYear()}-${String(fbDate.getMonth() + 1).padStart(2, '0')}` === filterMonth;
      });

      if (filtered.length === 0) {
        setChartData(null);
        setAnalyzedFeedbacks([]);
        setSummaryMetrics({ total: 0, top: '-', urgent: 0 });
        setIsAnalyzing(false);
        return;
      }

      let counts = { Positive: 0, Negative: 0, Neutral: 0, Repair: 0 };
      let tempAnalyzed = []; 

      try {
        const analysisPromises = filtered.map(fb =>
          axios.post('https://eightmansions-backend-1.onrender.com/api/sentiment/', { text: fb.comment })
        );
        const results = await Promise.all(analysisPromises);
        
        results.forEach((res, index) => {
          const sentimentStr = res.data.sentiment;
          let category = 'Neutral';
          
          if (sentimentStr.includes('เชิงบวก')) category = 'Positive';
          else if (sentimentStr.includes('เชิงลบ')) category = 'Negative';
          else if (sentimentStr.includes('แจ้งซ่อม')) category = 'Repair';
          
          counts[category]++;
          tempAnalyzed.push({ ...filtered[index], category }); 
        });

        const finalLabels = [];
        const finalValues = [];
        const finalColors = [];

        ['Positive', 'Negative', 'Neutral', 'Repair'].forEach(key => {
          if (counts[key] > 0) {
            finalLabels.push(key);
            finalValues.push(counts[key]);
            finalColors.push(COLORS[key]);
          }
        });

        setChartData({
          labels: finalLabels,
          datasets: [{
            data: finalValues,
            backgroundColor: finalColors,
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 10 
          }],
        });

        setAnalyzedFeedbacks(tempAnalyzed);
        
        const topSentiment = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        setSummaryMetrics({
          total: filtered.length,
          top: counts[topSentiment] === 0 ? '-' : topSentiment,
          urgent: counts.Repair
        });

      } catch (error) {
        console.error("Dashboard Analysis Error:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    if (allFeedbacks.length > 0) {
      analyzeData();
    }
  }, [allFeedbacks, filterMonth]);

  const generateMonthOptions = () => {
    const options = [];
    let current = new Date(2026, 0); 
    const currentDate = new Date();
    while (current <= currentDate) {
      options.push({ 
        value: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`, 
        label: `${current.toLocaleString('en-US', { month: 'short' })} ${current.getFullYear()}` 
      });
      current.setMonth(current.getMonth() + 1);
    }
    return options.reverse(); 
  };

  const handleChartClick = (event, elements) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      const clickedLabel = chartData.labels[index];
      setSelectedSentiment(clickedLabel);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] font-sans">
      
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex items-center justify-between min-h-[60px] flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 sm:gap-6 pl-3 sm:pl-8 py-2 font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] overflow-x-auto whitespace-nowrap">
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/admin')}>Home</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/data')}>Data</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/admin/payment')}>Payment</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white text-white" onClick={() => navigate('/admin/feedback')}>Feedback</span>
          </div>
          <div className="flex items-center ml-auto">
            <span onClick={() => navigate('/')} className="mr-3 sm:mr-8 cursor-pointer font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] whitespace-nowrap hover:text-red-700">Log out</span>
            <div className="bg-black min-h-[60px] px-3 sm:px-6 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="h-[25px] sm:h-[40px]" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center p-4 sm:p-8">
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl w-full max-w-6xl">
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4 gap-4">
             <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">Sentiment Overview</h2>
             
             <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg p-1 shadow-sm">
                  <span className="text-sm font-bold text-gray-600 px-3">Filter:</span>
                  <select 
                    value={filterMonth} 
                    onChange={(e) => setFilterMonth(e.target.value)} 
                    className="p-2 bg-transparent text-gray-800 font-bold outline-none cursor-pointer"
                  >
                    <option value="">-- All-Time --</option>
                    {generateMonthOptions().map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <button onClick={() => navigate('/admin/feedback')} className="text-gray-500 hover:text-white hover:bg-[#8FAFC1] font-bold px-4 py-2 bg-gray-100 rounded-lg transition-colors">
                  Back
                </button>
             </div>
          </div>
          
          <p className="text-gray-500 mb-8 font-medium text-center md:text-left">
            {filterMonth ? `Data for ${filterMonth}` : 'All-time Data'} ({summaryMetrics.total} Feedbacks)
          </p>

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-[#8FAFC1] border-t-black rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-bold animate-pulse text-lg">AI is analyzing {filterMonth ? 'filtered' : 'all'} data...</p>
            </div>
          ) : chartData ? (
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              
              {/* 🎯 คอลัมน์ซ้าย: แก้ไขกราฟให้สมบูรณ์ */}
              <div className="flex flex-col items-center justify-center w-full">
                
                {/* 🎯 ป้ายคำแนะนำแบบมีลูกเล่น (Pulse) */}
                <span className="bg-[#EAEAEA] text-[#8FAFC1] font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full mb-6 shadow-sm animate-pulse border border-[#8FAFC1]/30">
                  👆 Click on chart slices to see details
                </span>

                {/* 🎯 ใส่คลาส relative เพื่อแก้กราฟหาย */}
                <div className="relative w-full flex justify-center items-center h-[280px] sm:h-[350px]">
                  <Pie 
                    data={chartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      onClick: handleChartClick, 
                      plugins: {
                        legend: { position: 'bottom', labels: { font: { size: 14, weight: 'bold' }, padding: 20 } },
                        tooltip: { 
                          titleFont: { size: 16 }, 
                          bodyFont: { size: 14 },
                          callbacks: { 
                            label: function(context) {
                              let label = context.label || '';
                              let value = context.parsed || 0;
                              let total = context.dataset.data.reduce((a, b) => a + b, 0);
                              let percentage = Math.round((value / total) * 100) + '%';
                              return ` ${label}: ${value} feedback (${percentage})`;
                            }
                          }
                        },
                      }
                    }} 
                  />
                </div>
              </div>

              {/* คอลัมน์ขวา: Summary Cards & Drill-down List */}
              <div className="flex flex-col gap-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col justify-center items-center">
                    <span className="text-gray-500 font-bold text-sm">Most Sentiment</span>
                    <span className="text-2xl font-extrabold mt-1" style={{ color: COLORS[summaryMetrics.top] || '#1A1A1A' }}>
                      {summaryMetrics.top}
                    </span>
                  </div>
                  <div className={`border p-4 rounded-xl shadow-sm flex flex-col justify-center items-center ${summaryMetrics.urgent > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <span className={`${summaryMetrics.urgent > 0 ? 'text-red-500' : 'text-green-600'} font-bold text-sm`}>Urgent (Repair)</span>
                    <span className={`text-2xl font-extrabold mt-1 ${summaryMetrics.urgent > 0 ? 'text-red-600' : 'text-green-700'}`}>
                      {summaryMetrics.urgent} Cases
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-inner p-4 h-[250px] overflow-y-auto relative">
                  {!selectedSentiment ? (
                    <div className="flex h-full items-center justify-center text-gray-400 font-bold text-center">
                      Select a slice on the pie chart <br/> to view detailed feedbacks.
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-3 sticky top-0 bg-white pb-2 border-b">
                        <h3 className="font-bold text-lg" style={{ color: COLORS[selectedSentiment] }}>
                          {selectedSentiment} Feedbacks
                        </h3>
                        <button onClick={() => setSelectedSentiment(null)} className="text-gray-400 hover:text-gray-700 text-sm font-bold bg-gray-100 px-2 py-1 rounded">
                          Clear
                        </button>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        {analyzedFeedbacks
                          .filter(fb => fb.category === selectedSentiment)
                          .map((fb, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                              <div className="font-bold text-gray-800 mb-1 flex justify-between">
                                <span>Room: {fb.room || 'N/A'}</span>
                                <span className="text-xs text-gray-400">{new Date(fb.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-gray-600 italic">"{fb.comment}"</p>
                            </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>
          ) : (
            <p className="text-red-500 py-20 font-bold text-xl text-center">No sentiment data for this month.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminFeedbackDashboard;