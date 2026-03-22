from django.db import models

# 1. ตารางสำหรับทำระบบ Login
class User(models.Model):
    username = models.CharField(max_length=50, unique=True)
    password_hash = models.CharField(max_length=255) # ✅ เพิ่ม max_length เข้าไป
    role = models.CharField(max_length=20)

    def __str__(self):
        return self.username

# 2. ตารางสำหรับเก็บข้อมูลลูกค้า (เพิ่มระบบ Soft Delete แล้ว)
class Customer(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    
    # คอลัมน์สำหรับ Soft Delete
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"