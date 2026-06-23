from django.contrib import admin
from django.urls import path, include  # 🎯 อย่าลืม import include มาด้วย
from rest_framework.routers import DefaultRouter  # 🎯 import เครื่องมือ Router
from api import views

# 🎯 1. เพิ่ม PassportOCRView เข้ามาต่อท้ายของเดิม
from api.views import (
    FeedbackViewSet, 
    InvoiceViewSet, 
    UtilityCostViewSet, 
    HistoryLogViewSet,
    PassportOCRView  # 👈 🌟 นำเข้า API สแกนพาสปอร์ตตรงนี้
)

# 🎯 2. นำเส้นทางใหม่มาลงทะเบียนกับ router ตัวเดิม
router = DefaultRouter()
router.register(r'feedbacks', FeedbackViewSet)
router.register(r'invoices', InvoiceViewSet)          # 🎯 เพิ่มเส้นทางของบิล
router.register(r'utility-costs', UtilityCostViewSet) # 🎯 เพิ่มเส้นทางของต้นทุนค่าน้ำค่าไฟ
router.register(r'history', HistoryLogViewSet, basename='history') 

# 🎯 3. จัดการ urlpatterns (ห้ามมี router.register อยู่ในนี้เด็ดขาด)
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', views.login_api),
    path('api/customers/', views.customer_list),
    path('api/customers/<int:pk>/delete/', views.customer_soft_delete),
    path('api/customers/<int:pk>/update/', views.customer_update),
    
    # 🌟 4. เพิ่ม URL สำหรับรับรูปพาสปอร์ตจาก React (ต้องอยู่ก่อน include router)
    path('api/ocr/passport/', PassportOCRView.as_view(), name='ocr-passport'),
    path('api/sentiment/', views.SentimentAnalysisView.as_view(), name='sentiment-analysis'),

    # 🎯 5. เอา router ทั้งหมดมาผูกรวมกับ api/
    path('api/', include(router.urls)),
]