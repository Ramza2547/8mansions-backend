import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DataPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  
  // ตัวแปรสำหรับฟอร์มเพิ่มลูกค้าใหม่ (ปรับชื่อฟิลด์ให้ตรงกับ Database ของคุณนะครับ)
  const [newCustomer, setNewCustomer] = useState({ first_name: '', last_name: '', phone: '' });

  // 1. ดึงข้อมูลทันทีที่เปิดหน้านี้
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/customers/');
      setCustomers(response.data);
    } catch (error) {
      console.error("ดึงข้อมูลไม่สำเร็จ", error);
    }
  };

  // 2. ฟังก์ชันเพิ่มลูกค้า
  const handleAddCustomer = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/api/customers/', newCustomer);
      alert('เพิ่มลูกค้ารายใหม่สำเร็จ!');
      setNewCustomer({ first_name: '', last_name: '', phone: '' }); // เคลียร์ช่องพิมพ์
      fetchCustomers(); // โหลดตารางใหม่
    } catch (error) {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };

  // 3. ฟังก์ชัน Soft Delete
  const handleDelete = async (id) => {
    if(window.confirm('คุณแน่ใจหรือไม่ที่จะลบลูกค้ารายนี้?')) {
      try {
        await axios.put(`http://127.0.0.1:8000/api/customers/${id}/delete/`);
        fetchCustomers(); // โหลดตารางใหม่ (คนที่ถูกลบจะหายไป)
      } catch (error) {
        alert('ลบข้อมูลไม่สำเร็จ');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F0F0F0' }}>
      
      {/* 🟢 แถบเมนูด้านบน (Navbar) */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: '#8FAFC1', // สีฟ้าตามแบบ Figma
        height: '60px' 
      }}>
        
        {/* เมนูฝั่งซ้าย */}
        <div style={{ display: 'flex', gap: '30px', paddingLeft: '30px', fontWeight: 'bold', color: '#1A1A1A' }}>
          <span style={{ cursor: 'pointer' }}>Home</span>
          {/* ✅ เพิ่ม onClick ตรงนี้เพื่อให้เปลี่ยนไปหน้า /data */}
          <span 
            style={{ cursor: 'pointer' }} 
            onClick={() => navigate('/data')}
          >
            Data
          </span>
          <span style={{ cursor: 'pointer' }}>Payment</span>
          <span style={{ cursor: 'pointer' }}>Feedback</span>
        </div>

        {/* เมนูฝั่งขวา (Log out และ Logo) */}
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <span 
            onClick={handleLogout}
            style={{ marginRight: '30px', cursor: 'pointer', fontWeight: 'bold', color: '#1A1A1A' }}
          >
            Log out
          </span>
          {/* กล่องดำพื้นหลังโลโก้ */}
          <div style={{ backgroundColor: 'black', height: '100%', padding: '0 20px', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="8 Mansions Logo" style={{ height: '40px' }} />
          </div>
        </div>
      </nav>

      {/* 🔵 พื้นที่จัดการข้อมูล (แบ่งซ้าย-ขวา) */}
      <div style={{ padding: '40px', display: 'flex', gap: '40px' }}>
        
        {/* ฝั่งซ้าย: ฟอร์มเพิ่มข้อมูล */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '300px', height: 'fit-content', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, color: '#2C3E50' }}>+ เพิ่มลูกค้าใหม่</h3>
          <input 
            type="text" placeholder="ชื่อ (First Name)" 
            value={newCustomer.first_name} onChange={(e) => setNewCustomer({...newCustomer, first_name: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
          />
          <input 
            type="text" placeholder="นามสกุล (Last Name)" 
            value={newCustomer.last_name} onChange={(e) => setNewCustomer({...newCustomer, last_name: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
          />
          <input 
            type="text" placeholder="เบอร์โทร (Phone)" 
            value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
            style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
          />
          <button onClick={handleAddCustomer} style={{ width: '100%', padding: '10px', backgroundColor: '#7BA4B6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            บันทึกข้อมูล
          </button>
        </div>

        {/* ฝั่งขวา: ตารางแสดงข้อมูล */}
        <div style={{ flex: 1, backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, color: '#2C3E50' }}>รายชื่อลูกค้า (Active)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F0F0F0', borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>ชื่อ - นามสกุล</th>
                <th style={{ padding: '12px' }}>เบอร์โทร</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust) => (
                <tr key={cust.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{cust.id}</td>
                  <td style={{ padding: '12px' }}>{cust.first_name} {cust.last_name}</td>
                  <td style={{ padding: '12px' }}>{cust.phone}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {/* ปุ่ม Soft Delete */}
                    <button 
                      onClick={() => handleDelete(cust.id)}
                      style={{ padding: '6px 12px', backgroundColor: '#E74C3C', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>ยังไม่มีข้อมูลลูกค้า</p>}
        </div>

      </div>
    </div>
  );
}
{/* เมนูฝั่งซ้าย */}
<div style={{ display: 'flex', gap: '20px', fontWeight: 'bold', alignItems: 'center' }}>

    {/* 🌟 เพิ่ม onClick ตรงนี้เพื่อพากลับไปหน้า Home (Admin Dashboard) */}
    <span onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>Home</span>

    <span style={{ cursor: 'pointer', textDecoration: 'underline' }}>Data</span>
    <span style={{ cursor: 'pointer' }}>Payment</span>
    <span style={{ cursor: 'pointer' }}>Feedback</span>
</div>
export default DataPage;