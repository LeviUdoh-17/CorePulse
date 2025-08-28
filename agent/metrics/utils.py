import socket
import platform
from datetime import datetime

def get_device_id():
    return socket.gethostname()

def get_platform():
    return platform.system()

def get_timestamp():
    return datetime.utcnow().isoformat()
