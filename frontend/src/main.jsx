import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // <-- เพิ่มบรรทัดนี้เข้าไปครับ เพื่อให้เว็บรู้จักไฟล์ล้างขอบ

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)