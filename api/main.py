"""
Main file for Neo Viewer API.

Copyright CNRS 2023
Authors: Andrew P. Davison, Onur Ates, Shailesh Appukuttan, Hélissande Fragnaud and Corentin Fragnaud
Licence: MIT (see LICENSE)
"""

import os
from pathlib import Path

from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from .resources.v1 import router as router_v1
from .metadata import title, description
from .settings import HOMEPAGE_DIR, REACT_DIR


app = FastAPI(
    title=title,
    description=description,
    version="1.8",
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request, exc):
    """Over-ride error handler to add "error" field, for backwards compatibility"""
    return JSONResponse(
        status_code=exc.status_code,
        content=jsonable_encoder(
            {"detail": exc.detail, "error": exc.detail}
        ),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Over-ride error handler to add "error" field, for backwards compatibility"""
    error_detail = exc.errors()
    try:
        error_messages = ", ".join(
            [f"{item['loc'][1]} parameter is {item['type']}" for item in error_detail]
        )
    except Exception:
        err_messages = str(error_detail)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({"detail": error_detail, "error": error_messages}),
    )

app.include_router(router_v1, prefix="/api/v1")
app.include_router(router_v1, prefix="/api")

# Static HTML pages served from the homepage directory.
# These need explicit routes because StaticFiles(html=True) only serves index.html
# for directory requests; it does not strip .html extensions from filenames.
_DEMO_PAGES = ["angularjs", "guide_react_deploy", "guide_angular_usage", "guide_plotly_interactivity"]

for _page in _DEMO_PAGES:
    _path = Path(HOMEPAGE_DIR) / f"{_page}.html"
    if _path.exists():
        app.add_api_route(f"/{_page}", lambda p=_path: FileResponse(p), include_in_schema=False)

if os.path.isdir(REACT_DIR):
    _react_index = Path(REACT_DIR) / "index.html"
    if _react_index.exists():
        app.add_api_route("/react", lambda p=_react_index: FileResponse(p), include_in_schema=False)
    app.mount("/react", StaticFiles(directory=REACT_DIR, html=True), name="react")

if os.path.isdir(HOMEPAGE_DIR):
    app.mount("/", StaticFiles(directory=HOMEPAGE_DIR, html=True), name="homepage")
