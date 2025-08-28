import time
from metrics.collector import collect_metrics
from metrics.utils import get_device_id
from network.sender import send_metrics
from config.settings import INTERVAL

print("🔥 Agent is live...")

while True:
    data = collect_metrics()
    data["device_id"] = get_device_id()
    status, msg = send_metrics(data)
    print(f"Status: {status}, Response: {msg}")
    time.sleep(INTERVAL)
