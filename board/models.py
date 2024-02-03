from django.db import models
    

class Board(models.Model):
    title = models.CharField(max_length=50, null=False, blank=True, unique=True)
    writer = models.CharField(max_length=30, null=True)
    content = models.TextField(null=True)
    regdate = models.DateTimeField(auto_now_add=True)
    readcount = models.IntegerField(default=0)
    
    def __str__(self) -> str:
        return f'Board[title={self.title}, writer={self.writer}]'
    
    def incrementReadCount(self):
        self.readcount += 1
        self.save()
