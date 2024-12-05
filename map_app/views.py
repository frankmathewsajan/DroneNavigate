from django.shortcuts import render
from django.http import JsonResponse
import json
import math

from map_app.utils import calculate_paths


def map_view(request):
    if request.method == 'POST':
        coordinates = json.loads(request.POST.get('coordinates', '[]'))
        # Shortest path and offset calculation logic goes here.
        mst, drone_path = calculate_paths(coordinates)
        return JsonResponse({'mst': mst, 'drone_path': drone_path})
    return render(request, 'map_app/index.html')
