import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# todo: specify this as an environment variable, rather than relative to the code?
DOWNLOADED_FILE_CACHE_DIR = os.path.join(BASE_DIR, "download_cache")

HOMEPAGE_DIR = os.environ.get("HOMEPAGE_DIR", os.path.join(BASE_DIR, "..", "homepage"))
REACT_DIR    = os.environ.get("REACT_DIR",    os.path.join(BASE_DIR, "..", "js", "react", "demo", "build"))

# Usage tracking with EBRAINS Stats (Matomo): disabled unless MATOMO_SITE_ID is set (42 in production)
MATOMO_TRACKING_URL = os.environ.get("MATOMO_TRACKING_URL", "https://stats.humanbrainproject.eu")
MATOMO_SITE_ID = int(os.environ["MATOMO_SITE_ID"]) if os.environ.get("MATOMO_SITE_ID") else None
# needed for Matomo to accept the client IP address we send, which gives visitor locations
MATOMO_TOKEN_AUTH = os.environ.get("MATOMO_TOKEN_AUTH")
