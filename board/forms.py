from typing import Any
from django import forms
from django.core.validators import MaxLengthValidator, MinLengthValidator
from .models import Board


def my_validator(value):
    if len(value) < 2:
        raise forms.ValidationError('최소 두 글자 이상은 입력하여야 합니다.')
    return value



# 일반 폼
class RegistForm(forms.Form):
    title = forms.CharField(
        label='제목',
        max_length=20,
        required=True,
        validators=[
            MaxLengthValidator(limit_value=20),
            MinLengthValidator(limit_value=2),
        ]
    )
    writer = forms.CharField(
        label='작성자',
        required=True,
    )
    content = forms.CharField(
        label='내용',
        widget=forms.Textarea,
        required=True,
        validators=[ my_validator ]
    )
    
    # wirter 파라미터 검증에 사용되는 메서드
    def clean_writer(self):
        writer = self.cleaned_data.get('writer', 'XXX')
        if len(writer) > 10:
            raise forms.ValidationError('값이 범위를 벗어남')
        return writer
    
   
# 모델 폼 
class RegistModelForm(forms.ModelForm):
    class Meta:
        model = Board
        fields = ['title', 'writer', 'content']
        
    def clean_title(self):
        title = self.cleaned_data['title']
        if len(title) < 2:
            raise forms.ValidationError('두 글자 이상만 가능합니다.')
        return title
    
    def clean_writer(self):
        return self.cleaned_data['writer']
    
    def clean_content(self):
        return self.cleaned_data['content']
    
    # def clean(self):
    #     print('clean 호출')
    #     print(self.cleaned_data['title'])
    #     print(self.cleaned_data['writer'])
    #     print(self.cleaned_data['content'])
    #     return self.cleaned_data
    