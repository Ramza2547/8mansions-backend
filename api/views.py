from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User, Customer
from .serializers import CustomerSerializer
from .models import Feedback
from .serializers import FeedbackSerializer
from rest_framework import viewsets

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
