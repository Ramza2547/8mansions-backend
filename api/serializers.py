from rest_framework import serializers
from .models import Customer # ถ้าตารางคุณชื่ออื่น ให้เปลี่ยนชื่อตรงนี้นะครับ
from .models import Feedback # อย่าลืม import Feedback ถ้ายังไม่ได้ทำ
from rest_framework import serializers
from .models import Invoice, UtilityCost

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__' # แปลงข้อมูลทุกคอลัมน์

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'

class UtilityCostSerializer(serializers.ModelSerializer):
    class Meta:
        model = UtilityCost
        fields = '__all__'