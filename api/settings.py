import os.path

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# todo: specify this as an environment variable, rather than relative to the code?
DOWNLOADED_FILE_CACHE_DIR = os.path.join(BASE_DIR, "download_cache")
# Cache management settings
CACHE_MAX_SIZE_GB = float(os.environ.get("CACHE_MAX_SIZE_GB", 10))
CACHE_FILE_EXPIRY_DAYS = int(os.environ.get("CACHE_FILE_EXPIRY_DAYS", 30))