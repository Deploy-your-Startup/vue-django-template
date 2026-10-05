from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from api import services

router = APIRouter(tags=["Startup"])
private_router = APIRouter(tags=["Startup"])


class HealthResponse(BaseModel):
    status: str


class SessionResponse(BaseModel):
    authenticated: bool


class EntryRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)


class EntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str


@router.get("/health", response_model=HealthResponse, operation_id="getHealth")
async def health():
    return {"status": "ok"}


@router.get("/entries", response_model=list[EntryResponse], operation_id="getEntries")
def entries():
    return services.list_entries()


@private_router.get(
    "/session", response_model=SessionResponse, operation_id="getSession"
)
def session(authorization: str | None = Header(default=None)):
    # OAuth2 Proxy validates signature, issuer and audience before forwarding.
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")
    return {"authenticated": True}


@private_router.post(
    "/entries",
    response_model=EntryResponse,
    status_code=201,
    operation_id="createEntry",
)
def create_entry(data: EntryRequest, authorization: str | None = Header(default=None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")
    return services.create_entry(data.title)
