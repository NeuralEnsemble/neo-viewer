"""
Tests of server-side Matomo tracking, using a mock Matomo server.
"""

import asyncio
import time
import urllib.parse

import httpx
from fastapi import FastAPI

from ..matomo import MatomoMiddleware


def make_app(**kwargs):
    app = FastAPI()

    @app.get("/api/v1/ping")
    async def api_ping():
        return {"ok": True}

    @app.get("/api/blockdata/")
    async def api_blockdata(url: str):
        return {"ok": True}

    @app.get("/page")
    async def page():
        return {"ok": True}

    app.add_middleware(MatomoMiddleware, matomo_url="https://stats.example.org", idsite=99, **kwargs)
    return app


def run(app, requests, matomo_delay=0.0):
    """Make the requests, then wait for tracking to finish; return the tracking requests Matomo received."""
    received = []

    async def mock_matomo(request):
        await asyncio.sleep(matomo_delay)
        received.append(request)
        return httpx.Response(204)

    async def main():
        timings = []
        transport = httpx.ASGITransport(app=app, client=("198.51.100.1", 1234))
        async with httpx.AsyncClient(transport=transport, base_url="https://neoviewer.example.org") as client:
            await client.get("/not-found")  # builds the middleware stack, and is not tracked
            middleware = app.middleware_stack
            while not isinstance(middleware, MatomoMiddleware):
                middleware = middleware.app
            middleware.client = httpx.AsyncClient(transport=httpx.MockTransport(mock_matomo))
            for path, headers in requests:
                start = time.monotonic()
                response = await client.get(path, headers=headers)
                timings.append(time.monotonic() - start)
                assert response.status_code == 200
            await asyncio.gather(*middleware._tasks)
        return timings

    timings = asyncio.run(main())
    return received, timings


def form(request):
    return dict(urllib.parse.parse_qsl(request.content.decode()))


def test_api_requests_are_tracked():
    received, _ = run(make_app(), [("/api/v1/ping?x=1", {"referer": "https://papers.example.org/lp1"})])
    assert len(received) == 1
    params = form(received[0])
    assert str(received[0].url) == "https://stats.example.org/matomo.php"
    assert params["idsite"] == "99"
    assert params["url"] == "https://neoviewer.example.org/api/v1/ping?x=1"
    assert params["urlref"] == "https://papers.example.org/lp1"
    assert "token_auth" not in params and "cip" not in params


def test_pages_own_api_calls_and_probes_are_not_tracked():
    received, _ = run(make_app(), [
        ("/page", {}),
        ("/api/v1/ping", {"referer": "https://neoviewer.example.org/react/"}),
        ("/api/v1/ping", {"user-agent": "kube-probe/1.31"}),
    ])
    assert received == []


def test_token_and_ip_are_sent_in_body_and_not_logged(caplog):
    caplog.set_level("DEBUG", logger="matomo")
    received, _ = run(make_app(token_auth="SECRET-TOKEN"),
                      [("/api/v1/ping", {"x-forwarded-for": "203.0.113.7, 10.0.0.1"})])
    params = form(received[0])
    assert params["token_auth"] == "SECRET-TOKEN"
    assert params["cip"] == "203.0.113.7"
    assert "SECRET-TOKEN" not in str(received[0].url)
    assert "SECRET-TOKEN" not in caplog.text and "203.0.113.7" not in caplog.text


def test_response_does_not_wait_for_matomo():
    received, timings = run(make_app(), [("/api/v1/ping", {})], matomo_delay=1.0)
    assert len(received) == 1
    assert timings[0] < 0.5


def test_data_file_query_string_is_not_tracked():
    data_url = "https://ada:SECRET@bucket.example.org:8443/data/recording.nwb?X-Amz-Signature=SECRET&X-Amz-Expires=600#frag"
    query = urllib.parse.urlencode({"url": data_url, "type": "nwb"})
    received, _ = run(make_app(), [(f"/api/blockdata/?{query}", {})])
    tracked = urllib.parse.urlsplit(form(received[0])["url"])
    tracked_params = dict(urllib.parse.parse_qsl(tracked.query))
    assert tracked.path == "/api/blockdata/"
    assert tracked_params == {"url": "https://bucket.example.org:8443/data/recording.nwb", "type": "nwb"}
    assert "SECRET" not in form(received[0])["url"]


def test_api_request_still_receives_full_data_file_url():
    seen = {}
    app = FastAPI()

    @app.get("/api/blockdata/")
    async def api_blockdata(url: str):
        seen["url"] = url
        return {"ok": True}

    app.add_middleware(MatomoMiddleware, matomo_url="https://stats.example.org", idsite=99)
    data_url = "https://bucket.example.org/data/recording.nwb?token=abc"
    run(app, [(f"/api/blockdata/?{urllib.parse.urlencode({'url': data_url})}", {})])
    assert seen["url"] == data_url
