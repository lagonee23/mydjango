from django.shortcuts import render


# /minesweeper/
def index(request):
    x_len, y_len = 26, 13    # 가로,세로 길이
    polygons = []
    for y in range(y_len):
        for x in range(x_len - (y % 2)):
            points = "{},{} {},{} {},{} {},{} {},{} {},{}".format(
                15 + 7 * (y % 2) + 14 * x, 5 + 12 * y,
                22 + 7 * (y % 2) + 14 * x, 9 + 12 * y,
                22 + 7 * (y % 2) + 14 * x, 17 + 12 * y,
                15 + 7 * (y % 2) + 14 * x, 21 + 12 * y,
                8 + 7 * (y % 2) + 14 * x, 17 + 12 * y,
                8 + 7 * (y % 2) + 14 * x, 9 + 12 * y
            )
            polygon_id = f"{x}-{y}"
            polygons.append({"points":points, "polygon_id":polygon_id})
    context = { 
               "polygons": polygons,
               "svg_id": f"{x_len}-{y_len}",
    }
    return render(request, "minesweeper/index.html", context)
