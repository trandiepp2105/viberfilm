import os
from django.conf import settings
import json
import uuid
def save_img(file):
    directory = os.path.join(settings.MEDIA_ROOT, 'banner')
    os.makedirs(directory, exist_ok=True)
    
    filename, ext = os.path.splitext(file.name)
    path = os.path.join(directory, file.name)
    
    while os.path.exists(path):
        new_filename = f"{filename}_{uuid.uuid4().hex[:8]}{ext}"
        path = os.path.join(directory, new_filename)
    
    with open(path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    
    return path.replace(f"{settings.MEDIA_ROOT}/", settings.MEDIA_URL)
def ensure_list_int(value):
    """Parse JSON and make sure the value is list[int]"""
    try:
        # Step 1: Parse JSON
        parsed_value = json.loads(value) if isinstance(value, str) else value
        
        # Step 2: Check if it is already list[int]
        if isinstance(parsed_value, list) and all(isinstance(x, int) for x in parsed_value):
            return parsed_value
        
        # Step 3: If not list[int], check if it is a string of the form "1, 2, 3"
        if isinstance(parsed_value, str):
            return [int(x.strip()) for x in parsed_value.split(",") if x.strip().isdigit()]

    except (json.JSONDecodeError, TypeError, ValueError):
        raise ValueError("Invalid value for list[int]")

    return []  # If invalid, return empty list
