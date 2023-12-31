from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseRedirect
from django.urls import reverse
from .models import Question
import os

from .models import Choice, Question


# /chat/
def index(request):
    latest_question_list = Question.objects.order_by("-pub_date")[:5]
    context = { "latest_question_list": latest_question_list }
    return render(request, "chat/index.html", context)


# /chat/<int:question_id>/
def detail(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    return render(request, "chat/detail.html", {'question': question})


# /chat/<int:question_id>/results/
def results(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    return render(request, "chat/results.html", {"question": question})


# /chat/<int:question_id>/vote/
def vote(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    try:
        selected_choice = question.choice_set.get(pk=request.POST["choice"])
    except (KeyError, Choice.DoesNotExist):
        # Redisplay the question voting form.
        return render(
            request,
            "chat/detail.html",
            {
                "question": question,
                "error_message": "You didn't select a choice.",
            },
        )
    else:
        selected_choice.votes += 1
        selected_choice.save()
        # Always return an HttpResponseRedirect after successfully dealing
        # with POST data. This prevents data from being posted twice if a
        # user hits the Back button.
        return HttpResponseRedirect(reverse("chat:results", args=(question.id,)))