from fastapi import Header, HTTPException
from app.core.config import settings
async def require_api_key(x_api_key: str|None = Header(default=None)):
    if settings.api_key and x_api_key != settings.api_key: raise HTTPException(401,"Invalid API key")
