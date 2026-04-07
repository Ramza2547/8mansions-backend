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
      await axios.put(`https://eightmansions-backend.onrender.com/api/customers/${editingCustomer.id}/update/`, editingCustomer);
      
      const detectedChanges = trackChanges(originalCustomer, editingCustomer);
      if (detectedChanges.length > 0) {
        const newLog = {
          timestamp: new Date().toISOString(),
          changes: detectedChanges
        };
        const existingLogs = JSON.parse(localStorage.getItem(`history_log_${editingCustomer.id}`)) || [];
        existingLogs.push(newLog);
        localStorage.setItem(`history_log_${editingCustomer.id}`, JSON.stringify(existingLogs));
      }

      alert('บันทึกการแก้ไขข้อมูลสำเร็จ! ✅');
      setEditingCustomer(null); 
      setEditingRoom(''); 
      fetchCustomers(); 
    } catch (error) {
      console.error('Update error:', error.response);
      alert('สาเหตุที่พัง: ' + JSON.stringify(error.response?.data || error.message));
    }
  };

  const handleHistoryClick = (customer, room) => {
    setViewingHistory(customer);
    setHistoryRoom(room);
    const logs = JSON.parse(localStorage.getItem(`history_log_${customer.id}`)) || [];
    setRoomHistoryLogs(logs.reverse());
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

  const allRoomsData = roomNames.map((room, index) => {
    const cust = customers[index];
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

  const filteredRooms = allRoomsData.filter(item => {
    const search = searchTerm.toLowerCase();
    return item.room.toLowerCase().includes(search) || 
           item.displayName.toLowerCase().includes(search) || 
           item.displayNationality.toLowerCase().includes(search) ||
           item.displayName2.toLowerCase().includes(search) || 
           item.displayNationality2.toLowerCase().includes(search);
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
          
          {/* 🎯 ปุ่ม Revenue Data ย้ายมาอยู่ตรงกลาง ด้านบนของช่องค้นหา */}
          <div className="flex justify-center mb-8">
            <button 
              onClick={() => navigate('/admin/revenue-data')} 
              className="bg-[#2C3E50] hover:bg-black text-white font-extrabold py-3 px-10 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-3 active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              Revenue Data
            </button>
          </div>

          {/* ช่องค้นหาข้อมูลลูกค้า */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm gap-4">
            <h2 className="text-xl font-bold text-[#2C3E50]">Rooms Data <span className="text-sm font-normal text-gray-500">({filteredRooms.length} found)</span></h2>
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search room, name, nationality..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-80 p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FAFC1] outline-none transition-shadow"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
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
                        <span className="font-semibold text-red-600">Lease End:</span> {data.displayLeaseEnd}
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
                <p className="text-gray-500 text-lg">No results found for "{searchTerm}"</p>
                <button onClick={() => setSearchTerm('')} className="mt-4 text-[#3498DB] hover:underline">Clear Search</button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Popup Edit / History ปกติ... (ดึงจากโค้ดเดิม) */}
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
    </div>
  );
}

export default DataPage;