# ใช้ Python 3.11 เป็นระบบฐาน
FROM python:3.11-slim

# 🎯 เพิ่ม build-essential เพื่อให้ติดตั้งแพ็กเกจ Python บางตัวได้ลื่นไหล
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-tha \
    libgl1 \
    libglib2.0-0 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# ตั้งค่าโฟลเดอร์ทำงาน
WORKDIR /app

# ก๊อปปี้และติดตั้งไลบรารีจาก requirements.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ก๊อปปี้โค้ดทั้งหมดในโปรเจกต์ลงไป
COPY . .

# สั่งรันเซิร์ฟเวอร์บนพอร์ตที่ Render เตรียมไว้ให้อัตโนมัติ
CMD ["sh", "-c", "python manage.py runserver 0.0.0.0:${PORT:-8000}"]