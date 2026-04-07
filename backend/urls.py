from django.contrib import admin
from django.urls import path, include  # 🎯 อย่าลืม import include มาด้วย
from rest_framework.routers import DefaultRouter  # 🎯 import เครื่องมือ Router
from api import views
# 🎯 1. เพิ่ม InvoiceViewSet และ UtilityCostViewSet เข้ามาต่อท้าย
from api.views import FeedbackViewSet, InvoiceViewSet, UtilityCostViewSet  

# 🎯 2. นำเส้นทางใหม่มาลงทะเบียนกับ router ตัวเดิม
router = DefaultRouter()
router.register(r'feedbacks', FeedbackViewSet)
router.register(r'invoices', InvoiceViewSet)          # 🎯 เพิ่มเส้นทางของบิล
router.register(r'utility-costs', UtilityCostViewSet) # 🎯 เพิ่มเส้นทางของต้นทุนค่าน้ำค่าไฟ

# 🎯 3. จัดการ urlpatterns
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', views.login_api),
    path('api/customers/', views.customer_list),
    path('api/customers/<int:pk>/delete/', views.customer_soft_delete),
    path('api/customers/<int:pk>/update/', views.customer_update),
    
    # 🎯 4. เอา router ทั้งหมดมาผูกรวมกับ api/
    path('api/', include(router.urls)),
]