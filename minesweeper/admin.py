from django.contrib import admin
from .models import Question, UserMessage

# 관리자 페이지에서 Question 모델을 관리할 수 있도록 등록
admin.site.register(Question)

# 관리자 페이지에서 UserMessage 모델을 관리할 수 있도록 등록
admin.site.register(UserMessage)
