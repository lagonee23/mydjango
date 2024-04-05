from django.urls import path
from . import views


app_name = "minesweeper"  # URL 해석시 사용할 namespace 이름

urlpatterns = [
    path("", views.index, name="index"),
]