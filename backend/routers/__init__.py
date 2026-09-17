"""API routers for the Contract Verifier service."""
from .auth_routes import router as auth_router
from .contract_routes import router as contract_router
from .ai_routes import router as ai_router

__all__ = ["auth_router", "contract_router", "ai_router"]
