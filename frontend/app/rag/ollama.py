import httpx
from app.core.config import settings
async def embed(text: str):
    async with httpx.AsyncClient(base_url=settings.ollama_base_url,timeout=120) as c:
        r=await c.post("/api/embeddings",json={"model":settings.embed_model,"prompt":text}); r.raise_for_status(); return r.json()["embedding"]
async def stream_chat(prompt: str):
    async with httpx.AsyncClient(base_url=settings.ollama_base_url,timeout=None) as c:
        async with c.stream("POST","/api/chat",json={"model":settings.chat_model,"messages":[{"role":"user","content":prompt}],"stream":True}) as r:
            r.raise_for_status()
            async for line in r.aiter_lines():
                if line: yield line
async def ollama_health():
    try:
        async with httpx.AsyncClient(base_url=settings.ollama_base_url,timeout=3) as c:
            tags=(await c.get("/api/tags")).json().get("models",[]); names={m.get("name") for m in tags}; return {"connected":True,"chat_model":settings.chat_model in names,"embed_model":settings.embed_model in names}
    except Exception as e: return {"connected":False,"error":str(e)}
