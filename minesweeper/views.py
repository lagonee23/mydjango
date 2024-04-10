from django.shortcuts import render


# /minesweeper/
def index(request):
    x_len, y_len = 33, 17    # 가로,세로 길이(29, 15)
    polygons = []
    for y in range(y_len):
        for x in range(x_len - (y % 2)):
            points = "{},{} {},{} {},{} {},{} {},{} {},{}".format(
                16 + 7 * (y % 2) + 14 * x, 1 + 12 * y,
                23 + 7 * (y % 2) + 14 * x, 5 + 12 * y,
                23 + 7 * (y % 2) + 14 * x, 13 + 12 * y,
                16 + 7 * (y % 2) + 14 * x, 17 + 12 * y,
                9 + 7 * (y % 2) + 14 * x, 13 + 12 * y,
                9 + 7 * (y % 2) + 14 * x, 5 + 12 * y
            )
            polygon_id = f"{x}-{y}"
            polygons.append({"points":points, "polygon_id":polygon_id})
    context = { 
               "polygons": polygons,
               "svg_id": f"{x_len}-{y_len}",
    }
    return render(request, "minesweeper/index.html", context)
