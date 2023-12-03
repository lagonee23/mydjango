from django.db import models


# 주식 테이블    
class Stock(models.Model):
    day = models.DateTimeField("date published")    # 매수시점
    name = models.CharField(max_length=200)
    number = models.IntegerField(default=0)  
    price = models.IntegerField(default=0)
    
    
# 자산 데이터(날짜, 금, 주식)
class Assets(models.Model):
    day = models.DateField(auto_now_add=True)
    stock = models.IntegerField(default=0)
    gold = models.IntegerField(default=0)
    
    def __str__(self) -> str:
        return f"{self.day} ${self.cash}"
    