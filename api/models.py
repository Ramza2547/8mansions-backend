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
    
    # คอลัมน์สำหรับ Soft Delete
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name