import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import get_current_user
from .database import create_empty_database
from .models import User
from .routers.auth_routes import router as auth_router
from .routers.contract_routes import router as contract_router
from .routers.ai_routes import router as ai_router

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

app.include_router(auth_router)
app.include_router(contract_router)
app.include_router(ai_router)


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/protected", tags=["system"])
def protected(current_user: User = Depends(get_current_user)):
    return {"message": f"Hello {current_user.full_name}, you are logged in."}
