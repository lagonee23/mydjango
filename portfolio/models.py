from django.db import models

# Create your models here.
class Assets(models.Model):
    day = models.DateField(auto_now_add=True)
    cash = models.IntegerField()
    
    def __str__(self) -> str:
        return f"{self.day} ${self.cash}"