from django.db import models
from django.db import models

# 1. ตารางสำหรับทำระบบ Login
class User(models.Model):
    username = models.CharField(max_length=50, unique=True)
    password_hash = models.CharField(max_length=255) # ✅ เพิ่ม max_length เข้าไป
    role = models.CharField(max_length=20)

    def __str__(self):
        return self.username

# 2. ตารางสำหรับเก็บข้อมูลลูกค้า 
class Customer(models.Model):
    room = models.CharField(max_length=10, null=True, blank=True)
    name = models.CharField(max_length=200)        # เปลี่ยนเป็น Name รวม
    nationality = models.CharField(max_length=100) # เพิ่ม สัญชาติ
    date_of_birth = models.DateField()             # เพิ่ม วันเกิด (รูปแบบ YYYY-MM-DD)
    
    # 🎯 เพิ่ม 2 บรรทัดนี้ สำหรับสัญญาเช่า
    lease_start = models.DateField(null=True, blank=True) 
    lease_end = models.DateField(null=True, blank=True)

    is_active = models.BooleanField(default=True)

    # คอลัมน์สำหรับ Soft Delete
    is_active = models.BooleanField(default=True)

    # 🎯 เพิ่มบรรทัดนี้: มันจะจับเวลาปัจจุบันให้อัตโนมัติทุกครั้งที่มีการกด Save Edit ครับ
    updated_at = models.DateTimeField(auto_now=True)

# ข้อมูลผู้เช่าคนที่ 2 (ยอมให้ว่างได้ null=True, blank=True)
    name_2 = models.CharField(max_length=255, null=True, blank=True)
    nationality_2 = models.CharField(max_length=100, null=True, blank=True)
    date_of_birth_2 = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return self.name
    
class Feedback(models.Model):
    room = models.CharField(max_length=10)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Room {self.room} - {self.created_at}"

# 🎯 1. ตารางเก็บข้อมูลบิลรายเดือน
class Invoice(models.Model):
    room = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    dueDate = models.DateField()
    billingMonth = models.CharField(max_length=50) # เช่น 'March 2026'
    roomRental = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    elecBill = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    waterBill = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    remark = models.CharField(max_length=200, blank=True, null=True)
    totalAmount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    isPaid = models.BooleanField(default=False) # สถานะการจ่ายเงิน
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice {self.room} - {self.billingMonth}"

# 🎯 2. ตารางเก็บต้นทุนค่าไฟการไฟฟ้า (PEA) และประปา (PWA) รายเดือน
class UtilityCost(models.Model):
    billingMonth = models.CharField(max_length=50, unique=True) # ห้ามซ้ำกันใน 1 เดือน
    pea_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pwa_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Utility Cost - {self.billingMonth}"

class HistoryLog(models.Model):
    # เชื่อมกับลูกค้าคนนั้นๆ (ถ้าลูกค้าโดนลบ ประวัติก็จะโดนลบตามไปด้วย)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='history_logs')
    # เก็บวันเวลาที่แก้ไขอัตโนมัติ
    timestamp = models.DateTimeField(auto_now_add=True)
    # เก็บข้อมูลที่เปลี่ยนไปในรูปแบบ JSON (เช่น เปลี่ยนชื่อจาก A เป็น B)
    changes = models.JSONField(default=list)

    def __str__(self):
        return f"Log for {self.customer.name} at {self.timestamp}"