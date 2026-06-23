import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function GuestForm() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const ocrData = location.state?.ocrData || null;
  const initialHasSecondTenant = location.state?.hasSecondTenant || false;

  const [hasSecondTenant, setHasSecondTenant] = useState(initialHasSecondTenant);
  const [duration, setDuration] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', nationality: '', date_of_birth: '',
    lease_start: '', lease_end: '',
    name_2: '', nationality_2: '', date_of_birth_2: '',
  });

  useEffect(() => {
    if (ocrData) {
      setFormData(prev => ({
        ...prev,
        name: ocrData.tenant1?.name || '',
        nationality: ocrData.tenant1?.nationality || '',
        date_of_birth: ocrData.tenant1?.date_of_birth || '',
        name_2: ocrData.tenant2?.name || '',
        nationality_2: ocrData.tenant2?.nationality || '',
        date_of_birth_2: ocrData.tenant2?.date_of_birth || '',
      }));
    }
  }, [ocrData]);

  // 🎯 ฟังก์ชันช่วยแปลงรูปแบบจาก DD/MM/YYYY ไปเป็น YYYY-MM-DD เพื่อให้กล่องปฏิทิน HTML เข้าใจและยอมแสดงผล
  const convertDmyToYmd = (dmyStr) => {
    if (!dmyStr || !dmyStr.includes('/')) return '';
    const [day, month, year] = dmyStr.split('/');
    return `${year}-${month}-${day}`;
  };

  const calculateEndDate = (startDateStr, months) => {
    if (!startDateStr || !months) return '';
    let day, month, year;
    
    if (startDateStr.includes('/')) {
      [day, month, year] = startDateStr.split('/');
    } else if (startDateStr.includes('-')) {
      [year, month, day] = startDateStr.split('-');
    } else {
      return '';
    }
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    date.setMonth(date.getMonth() + parseInt(months));
    
    const rDay = String(date.getDate()).padStart(2, '0');
    const rMonth = String(date.getMonth() + 1).padStart(2, '0');
    const rYear = date.getFullYear();
    
    return `${rDay}/${rMonth}/${rYear}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'duration') {
      setDuration(value);
      setFormData({ ...formData, lease_end: calculateEndDate(formData.lease_start, value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    navigate('/recommend-room', { state: { formData, duration, hasSecondTenant } });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F0] font-sans">
      <nav className="sticky top-0 z-50 w-full bg-[#8FAFC1] shadow-md">
        <div className="flex justify-between items-stretch w-full min-h-[80px]">
          <div className="flex gap-10 items-center px-[5%]">
            <span onClick={() => navigate('/')} className="cursor-pointer text-[18px] font-medium hover:underline">Home</span>
            <span onClick={() => navigate('/booking')} className="cursor-pointer text-[18px] font-medium underline">Booking</span>
            <span onClick={() => navigate('/comment')} className="cursor-pointer text-[18px] font-medium hover:underline">Comment</span>
          </div>
          <div className="bg-black px-[30px] flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="h-[70px] w-auto block" />
          </div>
        </div>
      </nav>

      <div className="flex-1 flex justify-center items-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg my-8">
          <form onSubmit={handleNext} className="flex flex-col gap-4">
            
            {/* Tenant 1 */}
            <div className="p-4 bg-gray-50 border rounded-lg">
              <h3 className="font-bold border-b pb-2 mb-3 text-[#2C3E50]">Tenant 1 (ผู้เช่าหลัก)</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Name (ชื่อ-นามสกุล)</label>
                  <input type="text" name="name" placeholder="Name - Surname" required value={formData.name} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#8FAFC1]" />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Nationality (สัญชาติ)</label>
                  <input type="text" name="nationality" placeholder="Nationality" required value={formData.nationality} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#8FAFC1]" />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Date of Birth (วันเกิด)</label>
                  <input type="text" name="date_of_birth" placeholder="DD/MM/YYYY" required value={formData.date_of_birth} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#8FAFC1]" />
                </div>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-3 py-1">
              <input type="checkbox" id="checkT2" checked={hasSecondTenant} onChange={(e) => setHasSecondTenant(e.target.checked)} className="w-5 h-5" />
              <label htmlFor="checkT2" className="font-bold cursor-pointer text-[#2C3E50]">Add 2nd Tenant (เพิ่มผู้เช่าคนที่ 2)</label>
            </div>

            {/* Tenant 2 */}
            {hasSecondTenant && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-bold text-green-800 border-b pb-2 mb-3">Tenant 2 (ผู้เช่าร่วม)</h3>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 text-sm">Name (ชื่อ-นามสกุล)</label>
                    <input type="text" name="name_2" placeholder="Name - Surname" required={hasSecondTenant} value={formData.name_2} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 text-sm">Nationality (สัญชาติ)</label>
                    <input type="text" name="nationality_2" placeholder="Nationality" required={hasSecondTenant} value={formData.nationality_2} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1 text-sm">Date of Birth (วันเกิด)</label>
                    <input type="text" name="date_of_birth_2" placeholder="DD/MM/YYYY" required={hasSecondTenant} value={formData.date_of_birth_2} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Lease Details */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <h3 className="font-bold border-b pb-2 mb-3 text-[#2C3E50]">Lease Details (ข้อมูลสัญญาเช่า)</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Lease Start Date (วันเริ่มสัญญา)</label>
                  {/* 🎯 คืนค่ากลับมาใช้กล่องแบบดึงปฏิทินได้ (type="date") แต่ intercept ข้อมูลเซ็ตลงฟอร์มเป็น dd/mm/yyyy */}
                  <input 
                    type="date" 
                    name="lease_start" 
                    value={formData.lease_start ? convertDmyToYmd(formData.lease_start) : ''} 
                    onChange={(e) => {
                      const ymd = e.target.value;
                      if (!ymd) {
                        setFormData({ ...formData, lease_start: '', lease_end: '' });
                        return;
                      }
                      const [y, m, d] = ymd.split('-');
                      const dmy = `${d}/${m}/${y}`; // สลับแกนเก็บลงฟอร์มหลักเป็น dd/mm/yyyy
                      setFormData({ ...formData, lease_start: dmy, lease_end: calculateEndDate(dmy, duration) });
                    }} 
                    className="p-2 border rounded focus:ring-2 focus:ring-[#92B0C3] w-full bg-white cursor-pointer" 
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Lease Duration (ระยะเวลาเช่า)</label>
                  <select name="duration" required value={duration} onChange={handleChange} className="p-2 border rounded focus:ring-2 focus:ring-[#92B0C3] bg-white w-full cursor-pointer">
                    <option value="" disabled>Select Duration</option>
                    <option value="1">1 Month (1 เดือน)</option>
                    <option value="6">6 Months (6 เดือน)</option>
                    <option value="12">1 Year (1 ปี)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Lease End Date (วันหมดสัญญา)</label>
                  <input type="text" name="lease_end" readOnly value={formData.lease_end} className="p-2 border rounded bg-gray-100 text-gray-500 w-full cursor-not-allowed" />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button type="button" onClick={() => navigate(-1)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow">Back</button>
              <button type="submit" className="flex-1 bg-[#8FAFC1] hover:bg-[#7fa1b5] text-white font-bold py-3 rounded-lg shadow">Next</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GuestForm;