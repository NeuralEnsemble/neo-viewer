"""
Main file for Neo Viewer API.

Copyright CNRS 2023
Authors: Andrew P. Davison, Onur Ates, Shailesh Appukuttan, Hélissande Fragnaud and Corentin Fragnaud
Licence: MIT (see LICENSE)
"""

from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from .resources.v1 import router as router_v1
from .resources.v2 import router as router_v2
from .metadata import title, description


app = FastAPI(
    title=title,
    description=description,
    version="2.0",
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
app.include_router(router_v2, prefix="/api/v2")