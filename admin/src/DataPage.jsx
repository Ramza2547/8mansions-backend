import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DataPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingRoom, setEditingRoom] = useState('');
  
  const [viewingHistory, setViewingHistory] = useState(null);
  const [historyRoom, setHistoryRoom] = useState('');
  const [roomHistoryLogs, setRoomHistoryLogs] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  
  // 🎯 1. เพิ่ม State สำหรับจัดการ Filter Dropdown
  const [filterMode, setFilterMode] = useState('all');

  const [alertMessage, setAlertMessage] = useState({ show: false, type: '', text: '' });

  const roomNames = ['A1', 'B1', 'C1', 'D1', 'A2', 'B2', 'C2', 'D2'];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('https://eightmansions-backend-1.onrender.com/api/customers/');
      if (Array.isArray(response.data)) {
        console.log("🔥 ข้อมูลจาก Database:", response.data); 
        setCustomers(response.data);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error("ดึงข้อมูลไม่สำเร็จ", error);
      setCustomers([]); 
      setAlertMessage({ 
        show: true, 
        type: 'warning', 
        text: 'เซิร์ฟเวอร์กำลังตื่นจากโหมดพัก (Cold Start) ⏳ กรุณารอสัก 1-2 นาที แล้วกดรีเฟรชหน้าเว็บอีกครั้งครับ' 
      });
    }
  };

  const handleDeleteClick = (id, room) => {
    if (!id) return;
    navigate('/admin/delete-confirm', { state: { id: id, room: room } });
  };

  const handleEditClick = (customer, room) => {
    if (!customer) return;
    setEditingCustomer(customer); 
    setEditingRoom(room); 
  };

  const handleEditChange = (e) => {
    setEditingCustomer({
      ...editingCustomer,
      [e.target.name]: e.target.value
    });
  };

  const trackChanges = (original, edited) => {
    const changes = [];
    if (original.name !== edited.name) changes.push({ field: 'T1 Name', before: original.name || '-', after: edited.name });
    if (original.nationality !== edited.nationality) changes.push({ field: 'T1 Nationality', before: original.nationality || '-', after: edited.nationality });
    if (original.date_of_birth !== edited.date_of_birth) changes.push({ field: 'T1 DOB', before: formatDate(original.date_of_birth), after: formatDate(edited.date_of_birth) });
    
    if (original.name_2 !== edited.name_2) changes.push({ field: 'T2 Name', before: original.name_2 || '-', after: edited.name_2 });
    if (original.nationality_2 !== edited.nationality_2) changes.push({ field: 'T2 Nationality', before: original.nationality_2 || '-', after: edited.nationality_2 });
    if (original.date_of_birth_2 !== edited.date_of_birth_2) changes.push({ field: 'T2 DOB', before: formatDate(original.date_of_birth_2), after: formatDate(edited.date_of_birth_2) });

    if (original.lease_start !== edited.lease_start) changes.push({ field: 'Lease Start', before: formatDate(original.lease_start), after: formatDate(edited.lease_start) });
    if (original.lease_end !== edited.lease_end) changes.push({ field: 'Lease End', before: formatDate(original.lease_end), after: formatDate(edited.lease_end) });
    return changes;
  };

  const handleSaveEdit = async () => {
    try {
      const originalCustomer = customers.find(c => c.id === editingCustomer.id);
      await axios.put(`https://eightmansions-backend-1.onrender.com/api/customers/${editingCustomer.id}/update/`, editingCustomer);
      
      const detectedChanges = trackChanges(originalCustomer, editingCustomer);
      if (detectedChanges.length > 0) {
        try {
          await axios.post('https://eightmansions-backend-1.onrender.com/api/history/', {
            customer: editingCustomer.id,
            changes: detectedChanges
          });
        } catch (logError) {
          console.error('ไม่สามารถบันทึกประวัติลงฐานข้อมูลได้:', logError);
        }
      }

      setEditingCustomer(null); 
      setEditingRoom(''); 
      fetchCustomers(); 

      setAlertMessage({ show: true, type: 'success', text: 'บันทึกการแก้ไขข้อมูลสำเร็จ!' });
      
    } catch (error) {
      console.error('Update error:', error.response);
      setAlertMessage({ 
        show: true, 
        type: 'error', 
        text: 'เกิดข้อผิดพลาด: ' + JSON.stringify(error.response?.data || error.message) 
      });
    }
  };

  const handleHistoryClick = async (customer, room) => {
    setViewingHistory(customer);
    setHistoryRoom(room);
    
    try {
      const response = await axios.get(`https://eightmansions-backend-1.onrender.com/api/history/?customer=${customer.id}`);
      setRoomHistoryLogs(response.data);
    } catch (error) {
      console.error("ดึงประวัติไม่สำเร็จ", error);
      setRoomHistoryLogs([]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' });
  };

  const allRoomsData = roomNames.map((room) => {
    const cust = customers.find(c => {
      if (!c) return false;
      const dbRoom = String(c?.room || c?.room_number || "").toUpperCase().trim();
      return dbRoom === room.toUpperCase();
    });

    return {
      room: room,
      cust: cust,
      displayName: cust?.name ? cust.name : '-',
      displayNationality: cust?.nationality ? cust.nationality : '-',
      displayDob: formatDate(cust?.date_of_birth),
      displayName2: cust?.name_2 ? cust.name_2 : '',
      displayNationality2: cust?.nationality_2 ? cust.nationality_2 : '',
      displayDob2: formatDate(cust?.date_of_birth_2),
      
      displayLeaseStart: formatDate(cust?.lease_start),
      displayLeaseEnd: formatDate(cust?.lease_end),
      isEmptyRoom: !cust,
      hasTenant2: !!(cust?.name_2) 
    };
  });

  // 🎯 2. อัปเกรดลอจิกกรองข้อมูล (ทำงานร่วมกันทั้งช่อง Search และ Dropdown Filter)
  const filteredRooms = allRoomsData.filter(item => {
    // กรองด้วยคำค้นหา (Search)
    const search = searchTerm.toLowerCase();
    return item.room.toLowerCase().includes(search) || 
           item.displayName.toLowerCase().includes(search) || 
           item.displayNationality.toLowerCase().includes(search) ||
           item.displayName2.toLowerCase().includes(search) || 
           item.displayNationality2.toLowerCase().includes(search);
  }).filter(item => {
    // กรองด้วย Dropdown Mode
    if (filterMode === 'occupied') return !item.isEmptyRoom;
    if (filterMode === 'vacant') return item.isEmptyRoom;
    if (filterMode === 'ending_soon') return !item.isEmptyRoom; // เอาเฉพาะห้องที่มีคนเช่ามาเรียง
    return true; // โหมด 'all'
  }).sort((a, b) => {
    // จัดเรียงข้อมูลถ้าอยู่ในโหมดใกล้หมดสัญญา (Ending Soon)
    if (filterMode === 'ending_soon') {
      const dateA = new Date(a.cust?.lease_end || '9999-12-31');
      const dateB = new Date(b.cust?.lease_end || '9999-12-31');
      return dateA - dateB; // เรียงจากวันที่น้อยไปมาก (ใกล้หมดสัญญาขึ้นก่อน)
    }
    return 0; // โหมดอื่นๆ ให้เรียงตามปกติ (A1-D2)
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEAEA] relative font-sans">
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex items-center justify-between min-h-[60px] flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 sm:gap-6 pl-3 sm:pl-8 py-2 font-bold text-[#1A1A1A] text-[13px] sm:text-[16px] overflow-x-auto whitespace-nowrap">
            <span className="cursor-pointer px-1 sm:px-2 hover:text-white" onClick={() => navigate('/admin')}>Home</span>
            <span className="cursor-pointer px-1 sm:px-2 underline">Data</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-gray-700 transition-colors" onClick={() => navigate('/admin/payment')}>Payment</span>
            <span className="cursor-pointer px-1 sm:px-2 hover:text-gray-700 transition-colors" onClick={() => navigate('/admin/feedback')}>Feedback</span>
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
        <div className="w-full max-w-5xl">
          
          <div className="flex justify-center mb-8">
            <button 
              onClick={() => navigate('/admin/revenue-data')} 
              className="bg-[#2C3E50] hover:bg-black text-white font-extrabold py-3 px-10 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-3 active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              Revenue Data
            </button>
          </div>

          <div className="mb-6 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm gap-4">
            <h2 className="text-xl font-bold text-[#2C3E50] whitespace-nowrap">Rooms Data <span className="text-sm font-normal text-gray-500">({filteredRooms.length} found)</span></h2>
            
            {/* 🎯 3. โซนเครื่องมือค้นหาและฟิลเตอร์ */}
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
              
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className="w-full sm:w-auto p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FAFC1] outline-none cursor-pointer bg-gray-50 text-gray-700 font-medium"
              >
                <option value="all">All Rooms (ทั้งหมด)</option>
                <option value="occupied">Occupied (มีผู้เช่า)</option>
                <option value="vacant">Vacant (ห้องว่าง)</option>
                <option value="ending_soon">Ending Soon (ใกล้หมดสัญญา)</option>
              </select>

              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search room, name, nationality..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FAFC1] outline-none transition-shadow"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 items-start">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((data, index) => (
                <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 sm:p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-transparent hover:border-[#8FAFC1]">
                  
                  <div className="text-[14px] sm:text-[15px] text-[#1A1A1A] leading-relaxed mb-4 sm:mb-0 w-full pr-4">
                    <div className="font-extrabold text-[16px] sm:text-[18px] mb-3 text-[#2C3E50] border-b pb-1">Room {data.room}</div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                      <div><span className="font-semibold text-gray-600">Name (T1):</span> <br/>{data.displayName}</div>
                      <div><span className="font-semibold text-gray-600">Nationality (T1):</span> <br/>{data.displayNationality}</div>
                      <div><span className="font-semibold text-gray-600">Date of Birth:</span> <br/>{data.displayDob}</div>
                      <div></div> 
                    </div>

                    {data.hasTenant2 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                          <div><span className="font-semibold text-gray-600">Name (T2):</span> <br/>{data.displayName2}</div>
                          <div><span className="font-semibold text-gray-600">Nationality (T2):</span> <br/>{data.displayNationality2}</div>
                          <div><span className="font-semibold text-gray-600">Date of Birth:</span> <br/>{data.displayDob2 !== '-' ? data.displayDob2 : '-'}</div>
                          <div></div> 
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                      <div className="col-span-1 sm:col-span-2 mt-3 pt-3 border-t border-dashed">
                        <span className="font-semibold text-blue-700">Lease Start:</span> {data.displayLeaseStart}
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        {/* 🎯 ไฮไลท์สีแดงถ้าเลือกโหมดใกล้หมดสัญญา */}
                        <span className={`font-semibold ${filterMode === 'ending_soon' ? 'text-red-600 font-extrabold bg-red-100 px-1 rounded' : 'text-red-600'}`}>
                          Lease End:
                        </span> {data.displayLeaseEnd}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <button 
                      onClick={() => handleEditClick(data.cust, data.room)}
                      disabled={data.isEmptyRoom}
                      className={`w-full sm:w-auto text-white font-bold py-2 sm:py-3 px-5 rounded transition-all duration-200 text-[14px] sm:text-[15px] shadow-sm
                        ${data.isEmptyRoom ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-[#F39C12] hover:bg-[#D68910] active:scale-95'}`}
                    >
                      Edit
                    </button>

                    <button 
                      onClick={() => handleHistoryClick(data.cust, data.room)}
                      disabled={data.isEmptyRoom}
                      className={`w-full sm:w-auto text-white font-bold py-2 sm:py-3 px-5 rounded transition-all duration-200 text-[14px] sm:text-[15px] shadow-sm
                        ${data.isEmptyRoom ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-[#3498DB] hover:bg-[#2980B9] active:scale-95'}`}
                    >
                      History
                    </button>

                    <button 
                      onClick={() => handleDeleteClick(data.cust?.id, data.room)}
                      disabled={data.isEmptyRoom}
                      className={`w-full sm:w-auto text-white font-bold py-2 sm:py-3 px-5 rounded transition-all duration-200 text-[14px] sm:text-[15px] shadow-sm whitespace-nowrap
                        ${data.isEmptyRoom ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-[#FF0000] hover:bg-red-700 active:scale-95'}`}
                    >
                      Delete
                    </button>
                  </div>

                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 text-center py-10 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-lg">No results found.</p>
                <button onClick={() => {setSearchTerm(''); setFilterMode('all');}} className="mt-4 text-[#3498DB] hover:underline font-bold">Clear Filters</button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Popup Edit Customer */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-lg animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-5 text-[#2C3E50] border-b pb-2">
              Edit Customer <span className="text-[#3498DB]">({editingRoom})</span>
            </h2>
            <div className="flex flex-col gap-4">
              
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-bold text-[#2C3E50] mb-3">Tenant 1</h3>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 text-sm">Name</label>
                    <input type="text" name="name" value={editingCustomer.name || ''} onChange={handleEditChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 text-sm">Nationality</label>
                    <input type="text" name="nationality" value={editingCustomer.nationality || ''} onChange={handleEditChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 text-sm">Date of Birth</label>
                    <input type="date" name="date_of_birth" value={editingCustomer.date_of_birth || ''} onChange={handleEditChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none" />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-800 mb-3">Tenant 2 (Optional)</h3>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 text-sm">Name</label>
                    <input type="text" name="name_2" value={editingCustomer.name_2 || ''} onChange={handleEditChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 text-sm">Nationality</label>
                    <input type="text" name="nationality_2" value={editingCustomer.nationality_2 || ''} onChange={handleEditChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 text-sm">Date of Birth</label>
                    <input type="date" name="date_of_birth_2" value={editingCustomer.date_of_birth_2 || ''} onChange={handleEditChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400 outline-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm text-blue-700">Lease Start</label>
                  <input type="date" name="lease_start" value={editingCustomer.lease_start || ''} onChange={handleEditChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none" />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm text-red-600">Lease End</label>
                  <input type="date" name="lease_end" value={editingCustomer.lease_end || ''} onChange={handleEditChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#8FAFC1] outline-none" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => { setEditingCustomer(null); setEditingRoom(''); }} className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded transition-colors">Cancel</button>
              <button onClick={handleSaveEdit} className="px-5 py-2 bg-[#27AE60] hover:bg-[#1E8449] text-white font-bold rounded transition-colors shadow-md">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Audit Log */}
      {viewingHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-3xl animate-fade-in-up max-h-[90vh] flex flex-col">
            <h2 className="text-2xl font-bold mb-5 text-[#2C3E50] border-b pb-2 shrink-0">
              Audit Log <span className="text-[#3498DB]">({historyRoom})</span>
            </h2>
            
            <div className="overflow-y-auto flex-1 pr-2">
              {roomHistoryLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  <p className="text-lg font-semibold">ผู้เช่ารายนี้ยังไม่มีการแก้ไขข้อมูล</p>
                </div>
              ) : (
                <table className="min-w-full bg-white border border-gray-200 text-left">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="py-3 px-4 border-b text-sm font-semibold text-gray-700">Date & Time</th>
                      <th className="py-3 px-4 border-b text-sm font-semibold text-gray-700">Field Changed</th>
                      <th className="py-3 px-4 border-b text-sm font-semibold text-red-500">Before</th>
                      <th className="py-3 px-4 border-b text-sm font-semibold text-green-600">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomHistoryLogs.map((log, logIndex) => (
                      log.changes.map((change, changeIndex) => (
                        <tr key={`${logIndex}-${changeIndex}`} className="hover:bg-gray-50 border-b last:border-0">
                          <td className="py-3 px-4 text-sm text-gray-600">{formatDateTime(log.timestamp)}</td>
                          <td className="py-3 px-4 text-sm text-gray-800 font-medium">{change.field}</td>
                          <td className="py-3 px-4 text-sm text-red-500 line-through">{change.before}</td>
                          <td className="py-3 px-4 text-sm text-green-600 font-bold">{change.after}</td>
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 shrink-0 pt-4 border-t">
              <button onClick={() => { setViewingHistory(null); setHistoryRoom(''); }} className="px-6 py-2 bg-gray-800 hover:bg-black text-white font-bold rounded transition-colors shadow-md">
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Popup */}
      {alertMessage.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[110] p-4 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col items-center text-center transform transition-all scale-100">
            
            {alertMessage.type === 'success' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-500 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
            )}
            {alertMessage.type === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
            )}
            {alertMessage.type === 'warning' && (
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-500 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
            )}
            
            <h3 className={`text-xl font-extrabold mb-2 
              ${alertMessage.type === 'success' ? 'text-green-700' : ''}
              ${alertMessage.type === 'error' ? 'text-red-700' : ''}
              ${alertMessage.type === 'warning' ? 'text-yellow-600' : ''}
            `}>
              {alertMessage.type === 'success' && 'Success!'}
              {alertMessage.type === 'error' && 'Error!'}
              {alertMessage.type === 'warning' && 'Please Wait'}
            </h3>
            
            <p className="text-gray-600 mb-6 font-medium">{alertMessage.text}</p>
            
            <button
              onClick={() => setAlertMessage({ show: false, type: '', text: '' })}
              className={`px-8 py-3 font-bold text-white rounded-full transition-transform active:scale-95 w-full shadow-md 
                ${alertMessage.type === 'success' ? 'bg-[#27AE60] hover:bg-[#1E8449]' : ''}
                ${alertMessage.type === 'error' ? 'bg-[#E74C3C] hover:bg-[#C0392B]' : ''}
                ${alertMessage.type === 'warning' ? 'bg-[#F39C12] hover:bg-[#D68910]' : ''}
              `}
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default DataPage;