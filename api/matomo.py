"""
Server-side usage tracking with Matomo (EBRAINS Stats).

Most use of the API comes from visualiser components embedded in other web sites,
so it is not seen by the JavaScript tracker on our own pages.
"""

import asyncio
import logging
import time
from urllib.parse import urlencode, urlsplit, urlunsplit, urlparse

import httpx
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger("matomo")


def _url_for_tracking(request: Request) -> str:
    """
    The request URL, with any user name and password, the query string and the fragment
    removed from the data file location given in the "url" parameter.

    The data file location may be a pre-signed or token-bearing link, and anyone with
    view access to the Matomo site can read the URLs it records.
    """
    if "url" not in request.query_params:
        return str(request.url)
    params = []
    for key, value in request.query_params.multi_items():
        if key == "url":
            parts = urlsplit(value)
            host = parts.netloc.rpartition("@")[2]
            value = urlunsplit((parts.scheme, host, parts.path, "", ""))
        params.append((key, value))
    return str(request.url.replace(query=urlencode(params)))


class MatomoMiddleware(BaseHTTPMiddleware):
    """Record each request to a path under `path_prefix` as a Matomo page view."""

    def __init__(self, app, matomo_url: str, idsite: int, token_auth: str = None,
                 path_prefix: str = "/api"):
        super().__init__(app)
        self.tracking_url = f"{matomo_url.rstrip('/')}/matomo.php"
        self.idsite = idsite
        self.token_auth = token_auth
        self.path_prefix = path_prefix
        self.client = httpx.AsyncClient(timeout=5.0)
        # strong references to in-flight tracking tasks, so they are not garbage-collected
        self._tasks = set()

    async def dispatch(self, request: Request, call_next):
        start = time.monotonic()
        response = await call_next(request)
        if response.status_code == 404 or not request.url.path.startswith(self.path_prefix):
            return response
        ua = request.headers.get("user-agent")
        if ua and ua.startswith("kube-probe/"):
            # Kubernetes health checks
            return response
        urlref = request.headers.get("referer")
        if urlref and urlparse(urlref).hostname == request.url.hostname:
            # calls from our own pages (e.g. the React demo) are already counted
            # by the JavaScript tracker on those pages
            return response
        server_time_ms = int((time.monotonic() - start) * 1000)

        params = {
            "idsite": self.idsite,
            "rec": 1,
            "url": _url_for_tracking(request),
            "action_name": request.url.path,
            "send_image": 0,
            "pf_srv": server_time_ms,
        }
        if ua:
            params["ua"] = ua
        lang = request.headers.get("accept-language")
        if lang:
            params["lang"] = lang
        # for embedded visualisers, the referrer is the page doing the embedding
        if urlref:
            params["urlref"] = urlref
        if self.token_auth:
            # Matomo only accepts the client IP (which gives the visitor location)
            # from an authenticated request
            forwarded_for = request.headers.get("x-forwarded-for")
            if forwarded_for:
                client_ip = forwarded_for.split(",")[0].strip()
            else:
                client_ip = request.client.host if request.client else None
            if client_ip:
                params["cip"] = client_ip
                params["token_auth"] = self.token_auth

        # Send the tracking request without waiting for it, so Matomo latency
        # is not added to the API's response time
        task = asyncio.create_task(self._track(params))
        self._tasks.add(task)
        task.add_done_callback(self._tasks.discard)

        return response

    async def _track(self, params):
        # token_auth is a Matomo credential and cip is personal data: never log them
        loggable = {k: v for k, v in params.items() if k not in ("token_auth", "cip")}
        try:
            # send params as a form body, not the query string, to keep token_auth out of URLs
            tracking_response = await self.client.post(self.tracking_url, data=params)
        except Exception as exc:
            logger.error("Matomo tracking request failed: %s", exc)
            return
        if tracking_response.is_success:
            logger.debug("Matomo tracking request succeeded: %s", loggable)
        else:
            logger.warning(
                "Matomo tracking request returned status %s: %s",
                tracking_response.status_code,
                tracking_response.text[:200],
            )
