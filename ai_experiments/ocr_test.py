import cv2
import pytesseract
import re
from datetime import datetime

# 🎯 ชี้ Path ไปที่โปรแกรม Tesseract ในเครื่อง
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def parse_mrz(text):
    print("\n=== 🔍 วิเคราะห์ข้อมูลจาก MRZ ===")
    
    # 1. แยกข้อความและหาบรรทัด MRZ
    lines = text.split('\n')
    mrz_lines = [line.replace(" ", "") for line in lines if '<' in line and len(line) > 30]
    
    if len(mrz_lines) < 2:
        print("❌ หาแถบ MRZ ไม่เจอ หรือภาพไม่ชัดพอครับ")
        return None

    line1 = mrz_lines[0]
    line2 = mrz_lines[1]
    
    print(f"บรรทัดที่ 1: {line1}")
    print(f"บรรทัดที่ 2: {line2}")
    print("-" * 30)

    # 2. ดึงชื่อ-นามสกุล (จากบรรทัดที่ 1)
    names = [name for name in line1.split('<') if name]
    given_name = names[2] if len(names) > 2 else ""
    surname = names[3] if len(names) > 3 else ""
    full_name = f"{given_name} {surname}".strip()

    nationality = ""
    dob_formatted = ""
    passport_no = ""

    # 3. ดึงเลขพาสปอร์ต สัญชาติ และวันเกิด (จากบรรทัดที่ 2 ตามมาตรฐานสากล)
    if len(line2) >= 20:
        # เลขพาสปอร์ต (Index 0 ถึง 8)
        passport_no = re.sub(r'[^A-Z0-9]', '', line2[0:9])
        
        # สัญชาติ (Index 10 ถึง 12) รหัส 3 ตัวอักษร
        nationality = line2[10:13].replace('<', '')
        
        # วันเกิด (Index 13 ถึง 18) รูปแบบ YYMMDD
        dob_raw = line2[13:19]
        
        # เช็คว่าเป็นตัวเลขล้วนไหม แล้วแปลงฟอร์แมตให้ตรงกับหน้าเว็บ (DD/MM/YYYY)
        if dob_raw.isdigit():
            year = int(dob_raw[0:2])
            month = dob_raw[2:4]
            day = dob_raw[4:6]
            
            # ตรรกะคำนวณ ค.ศ. (ถ้าเลขปีเกิดน้อยกว่า 26 ตีว่าเป็นยุค 2000s นอกนั้น 1900s)
            current_year = int(datetime.now().strftime("%y"))
            full_year = 2000 + year if year <= current_year else 1900 + year
            
            dob_formatted = f"{day}/{month}/{full_year}"
        else:
            # ดักไว้เผื่อรูปพาสปอร์ตปลอม (Dummy) ใส่ข้อมูลวันเกิดมั่วมาเป็นตัวหนังสือ
            dob_formatted = dob_raw 
    
    # 4. แสดงผลลัพธ์ให้ตรงกับฟอร์มหน้าเว็บ
    print(f"👤 ข้อมูลเตรียมส่งเข้าฟอร์ม:")
    print(f"Name (ชื่อ-นามสกุล)    : {full_name}")
    print(f"Nationality (สัญชาติ) : {nationality}")
    print(f"Date of Birth (วันเกิด) : {dob_formatted}")
    print(f"เลขพาสปอร์ตอ้างอิง     : {passport_no}")
    
    return True

def test_passport_ocr(image_path):
    print(f"กำลังประมวลผลภาพ: {image_path}...")
    
    img = cv2.imread(image_path)
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    custom_config = r'--oem 3 --psm 6'
    extracted_text = pytesseract.image_to_string(gray_img, lang='eng', config=custom_config)
    
    return extracted_text

if __name__ == "__main__":
    sample_image = "dummy.jpg" 
    
    try:
        raw_text = test_passport_ocr(sample_image)
        parse_mrz(raw_text)
    except Exception as e:
        print(f"เกิดข้อผิดพลาด: {e}")