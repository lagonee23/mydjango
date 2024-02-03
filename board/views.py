from django.shortcuts import render, redirect
from django.urls import reverse
from .models import Board
from .forms import RegistForm
from .forms import RegistModelForm


# Create your views here.
def index(request):
    return render(request, 'board/index.html')


def list(request):
    board_list = Board.objects.all().order_by('-id')
    context = { 'board_list':board_list }
    return render(request, 'board/list.html', context)


def read(request, id):
    board = Board.objects.get(pk=id)
    board.incrementReadCount()
    return render(request, 'board/read.html', {'board':board})


# 일반 Form을 사용한 예
def regist(request):
    if request.method == 'POST':
        registForm = RegistForm(request.POST)
        if registForm.is_valid():  # 유효성 검증
            title = registForm.cleaned_data['title']
            writer = registForm.cleaned_data['writer']
            content = registForm.cleaned_data['content']
            Board(title=title, writer=writer, content=content).save()  # 모델에 저장
            return redirect(reverse('board:list'))
        else:
            return render(request, 'board/regist.html', {'form': registForm})
    else:
        form = RegistForm()
        return render(request, 'board/regist.html', {'form': form})
    
   
# 모델 Form을 사용한 예 
def edit(request, id):
    board = Board.objects.get(pk=id)
    if request.method == 'POST':
        form = RegistModelForm(request.POST, instance=board)
        if form.is_valid():
            form.save()
        return redirect(reverse('board:read', args=(id,)))
    else:
        form = RegistModelForm(instance=board)
    return render(request, 'board/edit.html', {'form': form})
    
    
def remove(request, id):
    board = Board.objects.get(pk=id)
    if request.method == 'POST':
        board.delete()
        return redirect(reverse('board:list'))
    else:
        return render(request, 'board/remove.html', {'board': board})        
