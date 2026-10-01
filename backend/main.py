import os
from pathlib import Path

# Auto-load .env from project root when running outside Docker Compose
_env_path = Path(__file__).resolve().parent.parent / ".env"
if _env_path.is_file():
    for _line in _env_path.read_text(encoding="utf-8").splitlines():
        _line = _line.strip()
        if _line and not _line.startswith("#") and "=" in _line:
            _k, _v = _line.split("=", 1)
            os.environ.setdefault(_k.strip(), _v.strip())

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import get_current_user
from .database import create_empty_database
from .models import User
from .routers.auth_routes import router as auth_router
from .routers.contract_routes import router as contract_router
from .routers.ai_routes import router as ai_router
from .routers.admin_routes import router as admin_router

# Create the database schema
create_empty_database()


def _parse_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "*").strip()
    if raw == "*":
        return ["*"]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app = FastAPI(
    title="Contract Verifier API",
    description="Upload, xac thuc hop dong, quan ly anh/bien lai va phan tich rui ro AI.",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_cors_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_private_network_headers(request, call_next):
    """Support Private Network Access (PNA) for Chrome/Edge when accessing across LAN devices."""
    response = await call_next(request)
    if request.headers.get("access-control-request-private-network"):
        response.headers["Access-Control-Allow-Private-Network"] = "true"
    return response

app.include_router(auth_router)
app.include_router(contract_router)
app.include_router(ai_router)
app.include_router(admin_router)


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/protected", tags=["system"])
def protected(current_user: User = Depends(get_current_user)):
    return {"message": f"Hello {current_user.full_name}, you are logged in."}
