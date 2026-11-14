from sqlalchemy.ext.asyncio import AsyncSession
from app.models import EvidenceFile, Chunk, ProcessingStatus
from app.parsers.text import extract
from app.ingestion.chunking import chunk_text
from app.services.custody import append_entry
from app.rag.ollama import embed
from app.core.db import SessionLocal
from sqlalchemy import select
async def process_evidence(db: AsyncSession, evidence: EvidenceFile):
    evidence.processing_status=ProcessingStatus.processing; await db.commit()
    try:
        for text, meta in extract(evidence.storage_path,evidence.mime_type):
            for part, idx in chunk_text(text):
                emb=await embed(part); db.add(Chunk(evidence_id=evidence.id,text=part,page=meta.get("page"),embedding_id=f"{evidence.id}:{idx}"))
        evidence.processing_status=ProcessingStatus.ready; await append_entry(db,evidence.id,"processing","system",{"status":"ready"}); await db.commit()
    except Exception as exc:
        evidence.processing_status=ProcessingStatus.failed; evidence.processing_error=str(exc); await append_entry(db,evidence.id,"processing","system",{"status":"failed","error":str(exc)}); await db.commit()

async def process_evidence_by_id(evidence_id: str):
    async with SessionLocal() as db:
        evidence=await db.get(EvidenceFile,evidence_id)
        if evidence: await process_evidence(db,evidence)
