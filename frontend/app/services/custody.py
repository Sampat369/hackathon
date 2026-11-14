import hashlib, json
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import CustodyLogEntry
from app.models.models import now
async def append_entry(db: AsyncSession, evidence_id: str, action: str, actor: str, details: dict):
    last=(await db.execute(select(CustodyLogEntry).where(CustodyLogEntry.evidence_id==evidence_id).order_by(CustodyLogEntry.timestamp.desc()))).scalars().first()
    prev=last.entry_hash if last else None
    payload=json.dumps({"evidence_id":evidence_id,"action":action,"actor":actor,"details":details,"prev_hash":prev},sort_keys=True,default=str)
    entry=CustodyLogEntry(evidence_id=evidence_id,action=action,actor=actor,timestamp=now(),details=details,prev_hash=prev,entry_hash=hashlib.sha256(payload.encode()).hexdigest())
    db.add(entry); await db.flush(); return entry
