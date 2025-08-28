import psutil
from metrics.utils import get_platform, get_timestamp
import winreg
import os
import base64
from PIL import Image
from io import BytesIO
import time

# CONFIG
WALLPAPER_MAX_SIZE = (1280, 720)   # starting max resolution
WALLPAPER_TARGET_BYTES = 300_000   # ~300 KB target for binary image (before base64)
WALLPAPER_SEND_INTERVAL = 300      # seconds (5 min)

# persistence across calls
_last_wallpaper_b64 = None
_last_wallpaper_send_time = 0
_last_wallpaper_mtime = 0

def get_background():
    """Return the wallpaper path or None."""
    try:
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"Control Panel\\Desktop"
        )
        wallpaper_path, _ = winreg.QueryValueEx(key, "WallPaper")
        return wallpaper_path if os.path.isfile(wallpaper_path) else None
    except Exception:
        return None

def compress_to_target(path, target_bytes=WALLPAPER_TARGET_BYTES, initial_max=WALLPAPER_MAX_SIZE):
    """
    Try to resize/compress the image until its binary size <= target_bytes.
    Returns a data URI string 'data:image/...;base64,...' or None on failure.
    """
    try:
        img = Image.open(path)
    except Exception as e:
        print("[⚠️] open wallpaper failed:", e)
        return None

    max_size = list(initial_max)
    quality = 75  # start quality for JPEG path

    # We'll attempt a few passes: reduce quality, then reduce resolution
    for attempt in range(6):
        temp_img = img.copy()

        # Resize to max_size (keeping aspect ratio)
        try:
            temp_img.thumbnail(tuple(max_size))
        except Exception:
            pass

        buffer = BytesIO()
        mime = "jpeg"

        # choose PNG for transparency; JPEG otherwise
        if temp_img.mode in ("RGBA", "P"):
            # try converting but keep alpha if we use PNG
            temp_img.save(buffer, format="PNG", optimize=True)
            mime = "png"
        else:
            temp_img = temp_img.convert("RGB")
            temp_img.save(buffer, format="JPEG", quality=quality, optimize=True)
            mime = "jpeg"

        binary = buffer.getvalue()
        size = len(binary)
        # Debug print - helpful while debugging
        # print(f"[debug] attempt={attempt} mime={mime} size={size} max_size={max_size} quality={quality}")

        if size <= target_bytes:
            encoded = base64.b64encode(binary).decode('utf-8')
            return f"data:image/{mime};base64,{encoded}"

        # if not small enough, adjust parameters:
        if mime == "jpeg" and quality > 20:
            quality = max(20, quality - 15)  # degrade quality
        else:
            # reduce resolution by 25% each iteration
            max_size[0] = max(200, int(max_size[0] * 0.75))
            max_size[1] = max(120, int(max_size[1] * 0.75))

    # last-ditch: return None (we'll not send wallpaper)
    return None

def should_send_wallpaper(path):
    """Send wallpaper if interval passed or file changed."""
    global _last_wallpaper_send_time, _last_wallpaper_mtime
    if not path:
        return False
    try:
        mtime = os.path.getmtime(path)
    except Exception:
        return False

    # send if file changed
    if mtime != _last_wallpaper_mtime:
        _last_wallpaper_mtime = mtime
        return True

    # send if interval elapsed
    if time.time() - _last_wallpaper_send_time > WALLPAPER_SEND_INTERVAL:
        return True

    return False

def get_wallpaper_base64_smart():
    """Return wallpaper data URI or None. Reuses last sent value if not changed."""
    global _last_wallpaper_b64, _last_wallpaper_send_time

    path = get_background()
    if not path:
        return None

    if not should_send_wallpaper(path):
        return _last_wallpaper_b64

    # attempt compression to target
    data_uri = compress_to_target(path)
    if data_uri:
        # store last and timestamp
        _last_wallpaper_b64 = data_uri
        _last_wallpaper_send_time = time.time()
        # log final size for debugging
        b64_bytes = data_uri.split(",")[1].encode("utf-8")
        print(f"[i] wallpaper prepared, base64 size bytes={len(b64_bytes)} (approx {len(b64_bytes)/1024:.1f} KB)")
        return data_uri

    # couldn't compress enough -> skip sending
    print("[i] wallpaper skipped (could not compress under target)")
    return None

def collect_metrics():
    cpu = psutil.cpu_percent(interval=1)
    ram = psutil.virtual_memory().percent
    battery_info = psutil.sensors_battery()
    battery = battery_info.percent if battery_info else None
    charging = battery_info.power_plugged if battery_info else None
    coreUsage = psutil.cpu_percent(percpu=True)
    CPUclockSpeed = psutil.cpu_freq().current if psutil.cpu_freq() else None
    availMem = psutil.virtual_memory().available / (1024 ** 3)  # in GB

    wallpaper = get_wallpaper_base64_smart()

    return {
        "cpu_usage": cpu,
        "ram_usage": ram,
        "platform": get_platform(),
        "timestamp": get_timestamp(),
        "battery": battery,
        "charging": charging,
        "core_usage": coreUsage,
        "cpu_clock_speed": CPUclockSpeed,
        "available_memory": availMem,
        "wallpaper": wallpaper
    }
