from django.test import TestCase
from django.urls import reverse

# Create your tests here.
class IndexViewTest(TestCase):
    def test_index_view_status_code(self):
        response = self.client.get("/ko/")
        self.assertEqual(response.status_code, 200)    

    def test_polygon_points_format(self):
        response = self.client.get(reverse('minesweeper:index'))
        polygons = response.context['polygons']
        print("-"*69)
        print("Response :", response)
        for polygon in polygons:
            # points 형식 검증
            points = polygon['points'].split(' ')
            self.assertEqual(len(points), 6)  # 6개의 x, y 쌍이 있어야 함(육각형)
            # ID 포맷 검증
            polygon_id = polygon['polygon_id']
            self.assertTrue('-' in polygon_id)  # ID에 '-'가 포함되어 있는지