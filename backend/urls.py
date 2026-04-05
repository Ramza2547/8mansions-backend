from django.contrib import admin
from django.urls import path, include  # 🎯 อย่าลืม import include มาด้วย
from rest_framework.routers import DefaultRouter  # 🎯 import เครื่องมือ Router
from api import views
from api.views import FeedbackViewSet  # 🎯 import ตัว FeedbackViewSet

# 🎯 1. สร้างตัวแปร router และลงทะเบียน feedbacks
router = DefaultRouter()
router.register(r'feedbacks', FeedbackViewSet)

# 🎯 2. จัดการ urlpatterns
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', views.login_api),
    path('api/customers/', views.customer_list),
    path('api/customers/<int:pk>/delete/', views.customer_soft_delete),
    path('api/customers/<int:pk>/update/', views.customer_update),
    
    # 🎯 3. เอา router เส้นทางใหม่ของเรามาผูกรวมกับ api/
    path('api/', include(router.urls)),
]