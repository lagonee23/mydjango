from django.db import models
from django.utils import timezone
    

class Board(models.Model):
    title = models.CharField(max_length=50, blank=True)
    writer = models.CharField(max_length=30, null=True)
    content = models.TextField(null=True)
    regdate = models.DateTimeField(auto_now=timezone.now)
    readcount = models.IntegerField(default=0)
    
    def __str__(self) -> str:
        return f'{self.title}, {self.writer}({self.readcount})'
    
    def incrementReadCount(self):
        self.readcount += 1
        self.save()
