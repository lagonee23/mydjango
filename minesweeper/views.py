from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseRedirect
from django.urls import reverse

from .models import Choice, Question


# /minesweeper/
def index(request):
    x_len, y_len = 5, 3    # 가로,세로 길이
    polygons = []
    for y in range(y_len):
        for x in range(x_len - (y % 2)):
            points = "{},{} {},{} {},{} {},{} {},{} {},{}".format(
                10 + 7 * (y % 2) + 14 * x, 5 + 12 * y,
                17 + 7 * (y % 2) + 14 * x, 9 + 12 * y,
                17 + 7 * (y % 2) + 14 * x, 17 + 12 * y,
                10 + 7 * (y % 2) + 14 * x, 21 + 12 * y,
                3 + 7 * (y % 2) + 14 * x, 17 + 12 * y,
                3 + 7 * (y % 2) + 14 * x, 9 + 12 * y
            )
            polygons.append(points)
    latest_question_list = Question.objects.order_by("-pub_date")[:5]
    context = { 
               "latest_question_list": latest_question_list,
               "polygons": polygons,
    }
    return render(request, "minesweeper/index.html", context)


# /minesweeper/<int:question_id>/
def detail(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    return render(request, "minesweeper/detail.html", {'question': question})


# /minesweeper/<int:question_id>/results/
def results(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    return render(request, "minesweeper/results.html", {"question": question})


# /minesweeper/<int:question_id>/vote/
def vote(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    try:
        selected_choice = question.choice_set.get(pk=request.POST["choice"])
    except (KeyError, Choice.DoesNotExist):
        # Redisplay the question voting form.
        return render(
            request,
            "minesweeper/detail.html",
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
        return HttpResponseRedirect(reverse("minesweeper:results", args=(question.id,)))