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

    def __str__(self):
        return self.name

