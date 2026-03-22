from rest_framework import serializers
from .models import Customer # ถ้าตารางคุณชื่ออื่น ให้เปลี่ยนชื่อตรงนี้นะครับ

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__' # แปลงข้อมูลทุกคอลัมน์