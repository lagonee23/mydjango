from django.shortcuts import render
from .models import Board


# Create your views here.
def index(request):
    return render(request, 'board/index.html')


def list(request):
    board_list = Board.objects.all()
    context = { 'board_list':board_list }
    return render(request, 'board/list.html', context)
