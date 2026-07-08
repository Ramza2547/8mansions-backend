from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api import views

# 🎯 1. นำเข้า RecommendRoomView มาด้วย
from api.views import (
    FeedbackViewSet, 
    InvoiceViewSet, 
    UtilityCostViewSet, 
    HistoryLogViewSet,
    PassportOCRView,
    RecommendRoomView  # 👈 🌟 นำเข้า API แนะนำห้องพักตรงนี้
)

router = DefaultRouter()
router.register(r'feedbacks', FeedbackViewSet)
router.register(r'invoices', InvoiceViewSet)          
router.register(r'utility-costs', UtilityCostViewSet) 
router.register(r'history', HistoryLogViewSet, basename='history') 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', views.login_api),
    path('api/customers/', views.customer_list),
    path('api/customers/<int:pk>/delete/', views.customer_soft_delete),
    path('api/customers/<int:pk>/update/', views.customer_update),
    
    path('api/ocr/passport/', PassportOCRView.as_view(), name='ocr-passport'),
    path('api/sentiment/', views.SentimentAnalysisView.as_view(), name='sentiment-analysis'),
    
    # 🌟 2. เพิ่ม URL สำหรับระบบแนะนำห้องพัก
    path('api/recommend-room/', RecommendRoomView.as_view(), name='recommend-room'),

    path('api/', include(router.urls)),
]