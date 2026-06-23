from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User, Customer
from .serializers import CustomerSerializer
from .models import Feedback
from .serializers import FeedbackSerializer
from rest_framework import viewsets
from rest_framework import viewsets
from .models import Invoice, UtilityCost
from .serializers import InvoiceSerializer, UtilityCostSerializer
import cv2
import pytesseract
import numpy as np
import re
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk
import os

# ==========================================
# 1. ฟังก์ชันสำหรับระบบ Login (ฝังโค้ดสายลับไว้แล้ว)
# ==========================================
@api_view(['POST'])
def login_api(request):
    req_username = request.data.get('username')
    req_password = request.data.get('password')
    
    print("\n--- DEBUG LOGIN ---")
    print(f"1. ชื่อที่ React ส่งมา: '{req_username}'")
    print(f"2. รหัสที่ React ส่งมา: '{req_password}'")
    
    try:
        user = User.objects.get(username=req_username, password_hash=req_password)
        print("3. ผลลัพธ์: สำเร็จ! เจอข้อมูลในฐานข้อมูล")
        return Response({
            "status": "success",
            "role": user.role
        })
    except User.DoesNotExist:
        print("3. ผลลัพธ์: ล้มเหลว! หาในฐานข้อมูลไม่เจอ")
        return Response({"status": "error", "message": "Wrong Username Or Password"}, status=400)

# ==========================================
# 2. ฟังก์ชันจัดการข้อมูลลูกค้า (ดึงข้อมูล และ เพิ่มข้อมูลใหม่)
# ==========================================
@api_view(['GET', 'POST'])
def customer_list(request):
    if request.method == 'GET':
        # ดึงมาเฉพาะคนที่ is_active=True (คนที่ยังไม่ถูกลบ)
        customers = Customer.objects.filter(is_active=True)
        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        # รับข้อมูลมาสร้างลูกค้าใหม่
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# ==========================================
# 3. ฟังก์ชันลบข้อมูลลูกค้าแบบซ่อน (Soft Delete)
# ==========================================
@api_view(['PUT', 'DELETE'])
def customer_soft_delete(request, pk):
    try:
        customer = Customer.objects.get(pk=pk)
    except Customer.DoesNotExist:
        return Response(status=404)
        
    # เปลี่ยนสถานะเป็น False แทนการลบทิ้งจริงๆ
    customer.is_active = False
    customer.save()
    return Response(status=204)

# ==========================================
# 4. ฟังก์ชันแก้ไขข้อมูลลูกค้า (Update)
# ==========================================
@api_view(['PUT'])
def customer_update(request, pk):
    try:
        customer = Customer.objects.get(pk=pk)
    except Customer.DoesNotExist:
        return Response(status=404)
        
    # partial=True หมายถึง อนุญาตให้แก้ไขแค่บางช่องได้
    serializer = CustomerSerializer(customer, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all().order_by('-created_at') # เรียงจากใหม่ไปเก่า
    serializer_class = FeedbackSerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-createdAt')
    serializer_class = InvoiceSerializer

class UtilityCostViewSet(viewsets.ModelViewSet):
    queryset = UtilityCost.objects.all()
    serializer_class = UtilityCostSerializer
    lookup_field = 'billingMonth' # ค้นหา/อัปเดตข้อมูลด้วยชื่อเดือนได้เลย

from .models import HistoryLog
from .serializers import HistoryLogSerializer

class HistoryLogViewSet(viewsets.ModelViewSet):
    serializer_class = HistoryLogSerializer

    def get_queryset(self):
        # ดึงประวัติทั้งหมด เรียงจากใหม่ไปเก่า
        queryset = HistoryLog.objects.all().order_by('-timestamp')
        # ถ้า React ส่งรหัสลูกค้ามา (customer_id) ให้กรองเอาเฉพาะของคนนั้น
        customer_id = self.request.query_params.get('customer', None)
        if customer_id is not None:
            queryset = queryset.filter(customer_id=customer_id)
        return queryset

# 🌟 2. อัปเกรดระบบหาตำแหน่ง Tesseract แบบอัตโนมัติ
# (os.name == 'nt' หมายถึงกำลังรันอยู่บน Windows)
if os.name == 'nt':
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
# ถ้าไม่ใช่ Windows (เช่นอยู่บน Render) ระบบจะไปเรียกใช้ Tesseract ของฝั่ง Linux แทน

class PassportOCRView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('passport_image')
        doc_type = request.data.get('doc_type', 'Passport') 

        if not file_obj:
            return Response({'error': 'ไม่พบไฟล์รูปภาพ'}, status=400)

        try:
            file_bytes = np.asarray(bytearray(file_obj.read()), dtype=np.uint8)
            img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
            gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            custom_config = r'--oem 3 --psm 6'
            extracted_text = pytesseract.image_to_string(gray_img, lang='eng', config=custom_config)
# ==========================================
            # 🇹🇭 ลอจิกใหม่สุดล้ำสำหรับ "บัตรประชาชนไทย (ID Card)"
            # ==========================================
            if doc_type == 'ID Card':
                raw_name = ""
                raw_last_name = ""
                dob_formatted = ""
                lines = extracted_text.split('\n')

                for i, line in enumerate(lines):
                    # 🎯 1. จับวันเกิดแบบล็อคเป้าเดือนภาษาอังกฤษ (Jan, Feb, ...) เพื่อแก้ปัญหา 01/01/2367
                    dob_match = re.search(r'(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{4})', line, re.IGNORECASE)
                    if dob_match and not dob_formatted:
                        day = dob_match.group(1).zfill(2)
                        month_str = dob_match.group(2).lower()[:3]
                        year = int(dob_match.group(3))

                        months_map = {'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
                                      'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'}
                        month = months_map.get(month_str, '01')
                        if year > 2400: year -= 543
                        dob_formatted = f"{day}/{month}/{year}"

                    # 🎯 2. กรองชื่อและนามสกุลให้เป๊ะ
                    line_lower = line.lower()
                    if 'name' in line_lower and 'last' not in line_lower and not raw_name:
                        idx = line_lower.find('name')
                        text_after = line[idx+4:]
                        text_after = re.sub(r'(?i)\b(mr|mrs|miss|ms|master)\b\.?', '', text_after)
                        eng_text = re.sub(r'[^A-Za-z\s]', '', text_after).strip()
                        
                        words = [w for w in eng_text.split() if len(w) >= 2]
                        raw_name = " ".join(words)
                        
                        for j in range(1, 4):
                            if i + j < len(lines):
                                next_line = lines[i+j]
                                cln_next = re.sub(r'[^A-Za-z\s]', '', next_line).strip()
                                if not cln_next: continue
                                
                                # 🔥 เพิ่มคำขยะที่ OCR ชอบอ่านภาษาไทยพลาดลงไปใน Blacklist
                                ignore_words = ['last', 'name', 'lest', 'lasi', 'lestoame', 'lastname', 'surname', 'ae', 'ee', 'of', 'boas', 'det', 'af', 'po', 'late']
                                words_next = [w for w in cln_next.split() if w.lower() not in ignore_words]
                                
                                # คัดเฉพาะคำที่น่าจะเป็นนามสกุลจริงๆ (ยาวตั้งแต่ 3 ตัวอักษรขึ้นไป)
                                valid_last_names = [w for w in words_next if len(w) >= 3]
                                
                                if valid_last_names:
                                    raw_last_name = " ".join(words_next)
                                    break
                
                # ประกอบร่างชื่อให้สวยงาม
                full_name = f"{raw_name} {raw_last_name}".strip()
                full_name = " ".join(full_name.split()).title()

                return Response({
                    'name': full_name,
                    'nationality': 'TH',
                    'date_of_birth': dob_formatted
                })

            # ==========================================
            # ✈️ ลอจิกสำหรับ "พาสปอร์ต (Passport)" (ใช้ของเดิม)
            # ==========================================
            lines = extracted_text.split('\n')
            mrz_lines = [line.replace(" ", "") for line in lines if '<' in line and len(line) > 30]

            if len(mrz_lines) < 2:
                return Response({'error': 'ระบบหาแถบ MRZ ไม่เจอ กรุณาอัปโหลดรูปที่ชัดเจน หรือกรอกข้อมูลด้วยตนเอง'}, status=400)

            line1 = mrz_lines[0]
            line2 = mrz_lines[1]

            name_field = line1[5:]
            name_parts = name_field.split('<<')
            
            surname = name_parts[0].replace('<', ' ').strip()
            given_name = ""
            if len(name_parts) > 1:
                given_name = name_parts[1].replace('<', ' ').strip()

            full_name = f"{given_name} {surname}".strip().title()

            nationality = ""
            dob_formatted = ""

            if len(line2) >= 20:
                nationality = line2[10:13].replace('<', '')
                dob_raw = line2[13:19]
                
                if dob_raw.isdigit():
                    year = int(dob_raw[0:2])
                    month = dob_raw[2:4]
                    day = dob_raw[4:6]
                    current_year = int(datetime.now().strftime("%y"))
                    full_year = 2000 + year if year <= current_year else 1900 + year
                    dob_formatted = f"{day}/{month}/{full_year}"

            return Response({
                'name': full_name,
                'nationality': nationality,
                'date_of_birth': dob_formatted
            })
            
        except Exception as e:
            import traceback
            print("🚨 OCR Error Detail:", traceback.format_exc()) # พิมพ์ลง Logs ของ Render
            return Response({'error': f'การประมวลผลผิดพลาด: {str(e)}'}, status=500)
        
# ดาวน์โหลดดิกชันนารี (ใส่ไว้ข้างนอกคลาสเพื่อให้โหลดแค่ครั้งเดียว)
nltk.download('vader_lexicon', quiet=True)

class SentimentAnalysisView(APIView):
    def post(self, request):
        text = request.data.get('text', '')
        if not text:
            return Response({'error': 'ไม่พบข้อความ'}, status=400)

        sia = SentimentIntensityAnalyzer()
        score = sia.polarity_scores(text)
        compound = score['compound']
        
        # ลอจิกแจ้งซ่อม (Keyword Matching)
        repair_keywords = ['repair', 'fix', 'broken', 'not working', 'leak', 'plumbing', 'aircon', 'water']
        is_repair = any(k in text.lower() for k in repair_keywords)
        
        if is_repair:
            result = "🛠️ แจ้งซ่อม (Repair Request) 🚨"
        elif compound >= 0.4:
            result = "🟢 เชิงบวก (Positive) 😊"
        elif compound <= -0.4:
            result = "🔴 เชิงลบ (Negative) 😡"
        else:
            result = "⚪ ทั่วไป (Neutral) 😐"

        return Response({
            'sentiment': result,
            'score': compound,
            'is_repair': is_repair
        })