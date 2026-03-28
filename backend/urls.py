from django.contrib import admin
from django.urls import path
from api import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', views.login_api), # 🌟 ระวังลืมเครื่องหมาย , ตรงบรรทัดนี้นะครับ!
    path('api/customers/', views.customer_list),
    path('api/customers/<int:pk>/delete/', views.customer_soft_delete),
    path('customers/<int:pk>/delete/', views.customer_soft_delete),
    path('customers/<int:pk>/update/', views.customer_update), # 🎯 เพิ่มบรรทัดนี้เข้าไปครับ
]
