import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function AdminFeedbackDashboard({ feedbacks, onClose, filterMonth }) {
  const [chartData, setChartData] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const COLORS = {
    'Positive': '#2ECC71',
    'Negative': '#E74C3C',
    'Neutral': '#95A5A6',
    'Repair': '#E67E22'
  };

  useEffect(() => {
    const analyzeData = async () => {
      if (!feedbacks || feedbacks.length === 0) {
        setIsAnalyzing(false);
        return;
      }

      let counts = { Positive: 0, Negative: 0, Neutral: 0, Repair: 0 };

      try {
        const analysisPromises = feedbacks.map(fb =>
          axios.post('https://eightmansions-backend-1.onrender.com/api/sentiment/', { text: fb.comment })
        );
        const results = await Promise.all(analysisPromises);
        
        results.forEach(res => {
          const sentimentStr = res.data.sentiment;
          if (sentimentStr.includes('เชิงบวก')) counts.Positive++;
          else if (sentimentStr.includes('เชิงลบ')) counts.Negative++;
          else if (sentimentStr.includes('แจ้งซ่อม')) counts.Repair++;
          else counts.Neutral++;
        });

        const finalChartData = [
          { name: 'Positive', value: counts.Positive },
          { name: 'Negative', value: counts.Negative },
          { name: 'Neutral', value: counts.Neutral },
          { name: 'Repair', value: counts.Repair }
        ].filter(item => item.value > 0); 

        setChartData(finalChartData);
      } catch (error) {
        console.error("Dashboard Analysis Error:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeData();
  }, [feedbacks]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4 animate-fade-in">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl relative flex flex-col items-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-extrabold text-2xl transition-colors">
          ✕
        </button>
        <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-2">Sentiment Analysis Report</h2>
        <p className="text-gray-500 mb-6 font-medium">
          {filterMonth ? `Data for ${filterMonth}` : 'All-time Data'} ({feedbacks.length} Feedbacks)
        </p>

        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-12 h-12 border-4 border-[#8FAFC1] border-t-black rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-bold animate-pulse">AI is analyzing feedbacks...</p>
          </div>
        ) : chartData.length > 0 ? (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={chartData} cx="50%" cy="50%" 
                  labelLine={false} 
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                  outerRadius={100} 
                  fill="#8884d8" 
                  dataKey="value"
                >
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-red-500 py-10 font-bold">No sentiment data to display.</p>
        )}
      </div>
    </div>
  );
}

export default AdminFeedbackDashboard;