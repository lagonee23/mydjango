from django.urls import path
from . import views


app_name = "board"  # URL 해석시 사용할 namespace 이름

# "/board/"으로 시작하는 URL 패턴
urlpatterns = [
    path("", views.index, name='index')
]
