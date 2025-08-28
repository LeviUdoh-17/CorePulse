import os

# Use environment variable for deployment, fallback to localhost for development
METRICS_ENDPOINT = os.getenv('METRICS_ENDPOINT', 'https://corepulse.onrender.com/api/metrics')
DEVICE_ID = 'device-12345-levi'
INTERVAL = 300  # In Seconds

# For local testing, you can override:
# METRICS_ENDPOINT = 'http://localhost:4000/api/metrics'