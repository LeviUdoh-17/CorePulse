import requests
from config import settings

def send_metrics(data):
    try:
        res = requests.post(settings.METRICS_ENDPOINT, json=data)
        return res.status_code, res.text
    except Exception as e:
        return None, f"Network Error: {e}"