from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User, Customer
from .serializers import CustomerSerializer
from .models import Feedback
from .serializers import FeedbackSerializer
from rest_framework import viewsets
from .models import Invoice, UtilityCost
from .serializers import InvoiceSerializer, UtilityCostSerializer
import cv2
import pytesseract
import numpy as np
import re
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk
import os
import joblib 

# ==========================================
# 1. ฟังก์ชันสำหรับระบบ Login
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
# 2. ฟังก์ชันจัดการข้อมูลลูกค้า
# ==========================================
@api_view(['GET', 'POST'])
def customer_list(request):
    if request.method == 'GET':
        customers = Customer.objects.filter(is_active=True)
        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
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
        
    serializer = CustomerSerializer(customer, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all().order_by('-created_at')
    serializer_class = FeedbackSerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-createdAt')
    serializer_class = InvoiceSerializer

class UtilityCostViewSet(viewsets.ModelViewSet):
    queryset = UtilityCost.objects.all()
    serializer_class = UtilityCostSerializer
    lookup_field = 'billingMonth'

from .models import HistoryLog
from .serializers import HistoryLogSerializer

class HistoryLogViewSet(viewsets.ModelViewSet):
    serializer_class = HistoryLogSerializer

    def get_queryset(self):
        queryset = HistoryLog.objects.all().order_by('-timestamp')
        customer_id = self.request.query_params.get('customer', None)
        if customer_id is not None:
            queryset = queryset.filter(customer_id=customer_id)
        return queryset

# ==========================================
# 🌟 ระบบ OCR พาสปอร์ตและบัตรประชาชน
# ==========================================
if os.name == 'nt':
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

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

            if doc_type == 'ID Card':
                raw_name = ""
                raw_last_name = ""
                dob_formatted = ""
                lines = extracted_text.split('\n')

                for i, line in enumerate(lines):
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
                                
                                ignore_words = ['last', 'name', 'lest', 'lasi', 'lestoame', 'lastname', 'surname', 'ae', 'ee', 'of', 'boas', 'det', 'af', 'po', 'late']
                                words_next = [w for w in cln_next.split() if w.lower() not in ignore_words]
                                
                                valid_last_names = [w for w in words_next if len(w) >= 3]
                                
                                if valid_last_names:
                                    raw_last_name = " ".join(words_next)
                                    break
                
                full_name = f"{raw_name} {raw_last_name}".strip()
                full_name = " ".join(full_name.split()).title()

                return Response({
                    'name': full_name,
                    'nationality': 'TH',
                    'date_of_birth': dob_formatted
                })

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
            print("🚨 OCR Error Detail:", traceback.format_exc()) 
            return Response({'error': f'การประมวลผลผิดพลาด: {str(e)}'}, status=500)

# ==========================================
# 🌟 ระบบ Sentiment Analysis
# ==========================================
nltk.download('vader_lexicon', quiet=True)

class SentimentAnalysisView(APIView):
    def post(self, request):
        text = request.data.get('text', '')
        if not text:
            return Response({'error': 'ไม่พบข้อความ'}, status=400)

        sia = SentimentIntensityAnalyzer()
        score = sia.polarity_scores(text)
        compound = score['compound']
        
        text_lower = text.lower()
        
        repair_keywords = ['repair', 'fix', 'broken', 'not working', 'leak', 'plumbing', 'aircon', 'water']
        positive_keywords = ['fast', 'good', 'great', 'awesome', 'amazing', 'excellent', 'love', 'best']
        negative_keywords = ['bad', 'slow', 'terrible', 'worst', 'awful', 'dirty']
        
        is_repair = any(k in text_lower for k in repair_keywords)
        has_positive = any(k in text_lower for k in positive_keywords)
        has_negative = any(k in text_lower for k in negative_keywords)
        
        if is_repair:
            result = "🛠️ แจ้งซ่อม (Repair Request) 🚨"
        elif has_positive or compound >= 0.3:
            result = "🟢 เชิงบวก (Positive) 😊"
        elif has_negative or compound <= -0.3:
            result = "🔴 เชิงลบ (Negative) 😡"
        else:
            result = "⚪ ทั่วไป (Neutral) 😐"

        return Response({
            'sentiment': result,
            'score': compound,
            'is_repair': is_repair
        })

# ==========================================
# 🌟 ระบบโหลดโมเดล Machine Learning
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_floor_path = os.path.join(BASE_DIR, 'ml_model_floor.pkl')
model_view_path = os.path.join(BASE_DIR, 'ml_model_view.pkl')

try:
    ml_model_floor = joblib.load(model_floor_path)
    ml_model_view = joblib.load(model_view_path)
    print("✅ ML Models loaded successfully!")
except Exception as e:
    print(f"⚠️ Warning: Could not load ML models. Error: {e}")
    ml_model_floor, ml_model_view = None, None

# ==========================================
# 🌟 API แนะนำห้องพักด้วย AI
# ==========================================
class RecommendRoomView(APIView):
    def post(self, request):
        
        # 🎯 ฟังก์ชันผู้ช่วย: ป้องกันแอปพังเวลารับค่าว่างจาก Frontend
        def safe_int(val, default_val):
            try:
                if val == "" or val is None:
                    return default_val
                return int(val)
            except (ValueError, TypeError):
                return default_val

        # ใช้ safe_int แทน int() ธรรมดา
        age = safe_int(request.data.get('age'), 25)
        gender = safe_int(request.data.get('gender'), 0) 
        budget = safe_int(request.data.get('budget'), 15000)
        occupants = safe_int(request.data.get('occupants'), 1)
        duration = safe_int(request.data.get('duration'), 12)

        # ข้อมูลผู้เช่าคนที่ 2 (ถ้าไม่มีข้อมูล ส่งค่าของคนที่ 1 แทน)
        age2 = safe_int(request.data.get('age2'), age) 
        gender2 = safe_int(request.data.get('gender2'), 1)

        all_rooms = [
            {"Room_ID": "A1", "Floor": 1, "View_Type": "Sunset", "Price": 12000},
            {"Room_ID": "B1", "Floor": 1, "View_Type": "Sunrise", "Price": 13000},
            {"Room_ID": "C1", "Floor": 1, "View_Type": "No sunlight", "Price": 11000},
            {"Room_ID": "D1", "Floor": 1, "View_Type": "No sunlight", "Price": 11000},
            {"Room_ID": "A2", "Floor": 2, "View_Type": "Sunset", "Price": 14000},
            {"Room_ID": "B2", "Floor": 2, "View_Type": "Sunrise", "Price": 15000},
            {"Room_ID": "C2", "Floor": 2, "View_Type": "No sunlight", "Price": 12000},
            {"Room_ID": "D2", "Floor": 2, "View_Type": "No sunlight", "Price": 12000},
        ]

        active_customers = Customer.objects.filter(is_active=True)
        occupied_rooms = []
        for customer in active_customers:
            room_val = str(getattr(customer, 'room_number', getattr(customer, 'room', '')))
            room_val = room_val.replace('Room', '').strip()
            if room_val:
                occupied_rooms.append(room_val)

        available_rooms = [r for r in all_rooms if r['Room_ID'] not in occupied_rooms]

        predicted_floor_1, predicted_view_1 = 1, "Sunrise"
        predicted_floor_2, predicted_view_2 = 1, "Sunrise"
        
        if ml_model_floor and ml_model_view:
            try:
                predicted_floor_1 = ml_model_floor.predict([[age, gender, budget, occupants, duration]])[0]
                predicted_view_1 = ml_model_view.predict([[age, gender, budget, occupants, duration]])[0]
                
                if occupants == 2:
                    predicted_floor_2 = ml_model_floor.predict([[age2, gender2, budget, occupants, duration]])[0]
                    predicted_view_2 = ml_model_view.predict([[age2, gender2, budget, occupants, duration]])[0]
            except Exception as e:
                print(f"⚠️ AI Prediction Error: {e}")

        recommended = []
        for room in available_rooms:
            if room['Price'] > budget:
                continue
            
            score1 = 0
            if room['Floor'] == predicted_floor_1: score1 += 40
            if room['View_Type'] == predicted_view_1: score1 += 40
            
            base_score = score1
            
            if occupants == 2:
                score2 = 0
                if room['Floor'] == predicted_floor_2: score2 += 40
                if room['View_Type'] == predicted_view_2: score2 += 40
                base_score = (score1 + score2) / 2 
            
            price_diff = budget - room['Price']
            price_bonus = min(20, (price_diff / budget) * 20) if price_diff > 0 else 0
            
            room['raw_score'] = base_score + price_bonus
            recommended.append(room)

        recommended = sorted(recommended, key=lambda x: (x['raw_score'], -x['Price']), reverse=True)

        for i, room in enumerate(recommended):
            int_score = int(min(100, room['raw_score'])) 
            if i == 0:
                final_score = int_score if int_score >= 90 else (95 if int_score > 70 else 85)
            else:
                prev_score = recommended[i-1]['Matching_Score']
                final_score = min(int_score, prev_score - 1)
            
            room['Matching_Score'] = max(1, final_score) 
            del room['raw_score'] 

        ai_msg_floor = f"{int(predicted_floor_1)}" if occupants == 1 else f"{int(predicted_floor_1)} and {int(predicted_floor_2)}"
        ai_msg_view = f"{predicted_view_1}" if occupants == 1 else f"{predicted_view_1} / {predicted_view_2}"

        return Response({
            "message": "AI Dual Recommendation",
            "ai_prediction": {"preferred_floor": ai_msg_floor, "preferred_view": ai_msg_view},
            "total_matches": len(recommended),
            "recommended_rooms": recommended
        })