import hashlib, os, re, uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.core.config import settings
ALLOWED={"application/pdf","text/plain","text/csv","application/json","message/rfc822","application/vnd.openxmlformats-officedocument.wordprocessingml.document","audio/mpeg","audio/wav","image/png","image/jpeg"}
def safe_name(name): return re.sub(r"[^A-Za-z0-9._-]", "_", Path(name or "upload").name)[:180]
async def save_upload(upload: UploadFile, case_id: str):
    ext=Path(upload.filename or "").suffix.lower(); mime=(upload.content_type or "application/octet-stream").lower()
    if mime not in ALLOWED and ext not in {".eml",".mbox",".msg",".docx",".pdf",".txt",".json",".csv",".png",".jpg",".jpeg",".mp3",".wav"}: raise HTTPException(415,"Disallowed evidence type")
    root=Path(settings.storage_root).resolve()/case_id; root.mkdir(parents=True,exist_ok=True); path=root/(str(uuid.uuid4())+"_"+safe_name(upload.filename)); sha=hashlib.sha256(); md5=hashlib.md5(); size=0
    with path.open("wb") as f:
        while chunk:=await upload.read(1024*1024):
            size+=len(chunk)
            if size>settings.max_upload_bytes: path.unlink(missing_ok=True); raise HTTPException(413,"Evidence file exceeds size limit")
            sha.update(chunk); md5.update(chunk); f.write(chunk)
    os.chmod(path,0o440); return path, size, sha.hexdigest(), md5.hexdigest(), mime
