import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DataPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);

  const roomNames = ['A1', 'B1', 'C1', 'D1', 'A2', 'B2', 'C2', 'D2'];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('https://eightmansions-backend.onrender.com/api/customers/');
      if (Array.isArray(response.data)) {
        setCustomers(response.data);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error("ดึงข้อมูลไม่สำเร็จ", error);
      setCustomers([]);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      alert('ห้องนี้ยังไม่มีข้อมูลลูกค้าให้ลบครับ');
      return;
    }
    
    if(window.confirm('คุณแน่ใจหรือไม่ที่จะลบลูกค้ารายนี้?')) {
      try {
        await axios.put(`https://eightmansions-backend.onrender.com/api/customers/${id}/delete/`);
        fetchCustomers(); 
      } catch (error) {
        alert('ลบข้อมูลไม่สำเร็จ');
      }
    }
  };

  // 🎯 ฟังก์ชันวิเศษ แปลงวันที่ yyyy-mm-dd ให้กลายเป็น dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA]">
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex items-center justify-between min-h-[60px] flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 sm:gap-6 pl-3 sm:pl-8 py-2 font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] overflow-x-auto whitespace-nowrap">
            <span className="cursor-pointer px-1 sm:px-2" onClick={() => navigate('/admin')}>Home</span>
            <span className="cursor-pointer px-1 sm:px-2 underline">Data</span>
            <span className="cursor-pointer px-1 sm:px-2">Payment</span>
            <span className="cursor-pointer px-1 sm:px-2">Feedback</span>
          </div>
          <div className="flex items-center ml-auto">
            <span onClick={() => navigate('/')} className="mr-3 sm:mr-8 cursor-pointer font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] whitespace-nowrap hover:text-red-700 transition-colors">Log out</span>
            <div className="bg-black min-h-[60px] px-3 sm:px-6 flex items-center justify-center">
              <img src="/logo.png" alt="8 Mansions Logo" className="h-[25px] sm:h-[40px]" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex justify-center flex-1 py-8 sm:py-12 px-4 sm:px-10">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
          
          {roomNames.map((room, index) => {
            const cust = customers[index]; 
            const displayName = cust?.name ? cust.name : '-';
            const displayNationality = cust?.nationality ? cust.nationality : '-';
            
            // เรียกใช้ฟังก์ชัน formatDate เพื่อให้โชว์เป็น dd/mm/yyyy
            const displayDob = formatDate(cust?.date_of_birth);
            const displayLeaseStart = formatDate(cust?.lease_start);
            const displayLeaseEnd = formatDate(cust?.lease_end);

            return (
              <div key={room} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 sm:p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-transparent hover:border-[#8FAFC1]">
                
                <div className="text-[14px] sm:text-[15px] text-[#1A1A1A] leading-relaxed mb-4 sm:mb-0 w-full pr-4">
                  <div className="font-extrabold text-[16px] sm:text-[18px] mb-3 text-[#2C3E50] border-b pb-1">Room {room}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                    <div><span className="font-semibold text-gray-600">Name:</span> <br/>{displayName}</div>
                    <div><span className="font-semibold text-gray-600">Nationality:</span> <br/>{displayNationality}</div>
                    <div><span className="font-semibold text-gray-600">Date of Birth:</span> <br/>{displayDob}</div>
                    <div></div> {/* ช่องว่างจัด Layout */}
                    
                    {/* ข้อมูลสัญญาเช่า */}
                    <div className="col-span-1 sm:col-span-2 mt-2 pt-2 border-t border-dashed">
                      <span className="font-semibold text-blue-700">Lease Start:</span> {displayLeaseStart}
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <span className="font-semibold text-red-600">Lease End:</span> {displayLeaseEnd}
                    </div>
                  </div>
                </div>

                <button onClick={() => handleDelete(cust?.id)}
                  className="w-full sm:w-auto bg-[#FF0000] hover:bg-red-700 text-white font-bold py-2 sm:py-3 px-5 rounded transition-colors duration-200 text-[14px] sm:text-[15px] shadow-sm active:scale-95 whitespace-nowrap"
                >
                  Delete
                </button>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}

export default DataPage;