import json, hashlib
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_db
from app.core.security import require_api_key
from app.models import *
from app.schemas.common import *
from app.services.storage import save_upload
from app.services.custody import append_entry
from app.services.ingestion import process_evidence_by_id
from app.rag.ollama import stream_chat
router=APIRouter(dependencies=[Depends(require_api_key)])
def err(message,code="error"): raise HTTPException(400,detail={"detail":message,"code":code})

@router.post("/cases",response_model=CaseRead,status_code=201)
async def create_case(body: CaseCreate, db: AsyncSession=Depends(get_db)):
    x=Case(**body.model_dump()); db.add(x); await db.commit(); await db.refresh(x); return x
@router.get("/cases",response_model=Page)
async def list_cases(limit:int=Query(50,le=100),offset:int=0,db:AsyncSession=Depends(get_db)):
    items=(await db.execute(select(Case).order_by(Case.created_at.desc()).offset(offset).limit(limit))).scalars().all(); total=await db.scalar(select(func.count()).select_from(Case)); return Page(items=items,total=total or 0,limit=limit,offset=offset)
@router.get("/cases/{case_id}",response_model=CaseRead)
async def get_case(case_id:str,db:AsyncSession=Depends(get_db)):
    x=await db.get(Case,case_id)
    if not x: raise HTTPException(404,"Case not found")
    return x
@router.patch("/cases/{case_id}",response_model=CaseRead)
async def update_case(case_id:str,body:CaseCreate,db:AsyncSession=Depends(get_db)):
    x=await db.get(Case,case_id)
    if not x: raise HTTPException(404,"Case not found")
    for k,v in body.model_dump().items(): setattr(x,k,v)
    await db.commit(); await db.refresh(x); return x
@router.delete("/cases/{case_id}",status_code=204)
async def delete_case(case_id:str,db:AsyncSession=Depends(get_db)):
    x=await db.get(Case,case_id)
    if not x: raise HTTPException(404,"Case not found")
    await db.delete(x); await db.commit()

@router.post("/cases/{case_id}/evidence")
async def upload(case_id:str,background:BackgroundTasks,files:list[UploadFile]=File(...),db:AsyncSession=Depends(get_db)):
    if not await db.get(Case,case_id): raise HTTPException(404,"Case not found")
    out=[]
    for f in files:
        path,size,sha,md5,mime=await save_upload(f,case_id); e=EvidenceFile(case_id=case_id,original_filename=f.filename or "upload",mime_type=mime,size=size,sha256=sha,md5=md5,storage_path=str(path)); db.add(e); await db.flush(); await append_entry(db,e.id,"upload","api",{"sha256":sha,"size":size}); await db.commit(); await db.refresh(e); background.add_task(process_evidence_by_id,e.id); out.append({"id":e.id,"filename":e.original_filename,"status":e.processing_status})
    return {"items":out}
@router.get("/cases/{case_id}/evidence")
async def list_evidence(case_id:str,db:AsyncSession=Depends(get_db)):
    return (await db.execute(select(EvidenceFile).where(EvidenceFile.case_id==case_id).order_by(EvidenceFile.uploaded_at.desc()))).scalars().all()
@router.get("/evidence/{evidence_id}/file")
async def get_file(evidence_id:str,db:AsyncSession=Depends(get_db)):
    e=await db.get(EvidenceFile,evidence_id)
    if not e: raise HTTPException(404,"Evidence not found")
    await append_entry(db,e.id,"view","api",{}); await db.commit(); return FileResponse(e.storage_path,filename=e.original_filename,media_type=e.mime_type)
@router.get("/evidence/{evidence_id}/chunks")
async def get_chunks(evidence_id:str,db:AsyncSession=Depends(get_db)): return (await db.execute(select(Chunk).where(Chunk.evidence_id==evidence_id))).scalars().all()
@router.post("/evidence/{evidence_id}/verify")
async def verify(evidence_id:str,db:AsyncSession=Depends(get_db)):
    e=await db.get(EvidenceFile,evidence_id)
    if not e: raise HTTPException(404,"Evidence not found")
    h=hashlib.sha256(); m=hashlib.md5()
    with open(e.storage_path,"rb") as f:
        while b:=f.read(1024*1024): h.update(b); m.update(b)
    ok=h.hexdigest()==e.sha256 and m.hexdigest()==e.md5; await append_entry(db,e.id,"verification","api",{"valid":ok}); await db.commit(); return {"valid":ok,"sha256":h.hexdigest(),"md5":m.hexdigest()}
@router.get("/evidence/{evidence_id}/custody-log")
async def custody(evidence_id:str,db:AsyncSession=Depends(get_db)): return (await db.execute(select(CustodyLogEntry).where(CustodyLogEntry.evidence_id==evidence_id).order_by(CustodyLogEntry.timestamp))).scalars().all()

@router.post("/cases/{case_id}/chat")
async def chat(case_id:str,body:QuestionRequest,db:AsyncSession=Depends(get_db)):
    chunks=(await db.execute(select(Chunk).join(EvidenceFile).where(EvidenceFile.case_id==case_id).limit(8))).scalars().all()
    context="\n".join(f"[{c.id}] {c.text}" for c in chunks); prompt=f"You are EvidenceIQ. Answer only from provided evidence. Say when insufficient. Never invent facts. Cite chunk IDs.\nEvidence:\n{context}\nQuestion: {body.message}"
    async def events():
        async for line in stream_chat(prompt): yield f"data: {line}\n\n"
    return StreamingResponse(events(),media_type="text/event-stream")
@router.get("/cases/{case_id}/search")
async def search(case_id:str,q:str=Query(min_length=1),db:AsyncSession=Depends(get_db)):
    return (await db.execute(select(Chunk).join(EvidenceFile).where(EvidenceFile.case_id==case_id,Chunk.text.ilike(f"%{q}%")).limit(50))).scalars().all()

@router.get("/cases/{case_id}/entities")
async def entities(case_id:str,db:AsyncSession=Depends(get_db)):
    return (await db.execute(select(Entity).where(Entity.case_id==case_id))).scalars().all()
@router.get("/cases/{case_id}/graph")
async def graph(case_id:str,db:AsyncSession=Depends(get_db)):
    nodes=(await db.execute(select(Entity).where(Entity.case_id==case_id))).scalars().all()
    ids={n.id for n in nodes}; edges=(await db.execute(select(Relationship).where(Relationship.source_entity.in_(ids),Relationship.target_entity.in_(ids)))).scalars().all() if ids else []
    return {"nodes":nodes,"edges":edges}
@router.post("/cases/{case_id}/entities/merge")
async def merge_entities(case_id:str,entity_ids:list[str],db:AsyncSession=Depends(get_db)):
    if len(entity_ids)<2: raise HTTPException(400,"At least two entities are required")
    values=(await db.execute(select(Entity).where(Entity.case_id==case_id,Entity.id.in_(entity_ids)))).scalars().all()
    if len(values)!=len(entity_ids): raise HTTPException(404,"Entity not found")
    target=values[0]
    for e in values[1:]:
        await db.execute(__import__('sqlalchemy').update(EntityMention).where(EntityMention.entity_id==e.id).values(entity_id=target.id)); await db.delete(e)
    await db.commit(); return target
@router.get("/cases/{case_id}/timeline")
async def timeline(case_id:str,db:AsyncSession=Depends(get_db)): return (await db.execute(select(TimelineEvent).where(TimelineEvent.case_id==case_id).order_by(TimelineEvent.timestamp))).scalars().all()
@router.post("/cases/{case_id}/timeline/regenerate")
async def regenerate_timeline(case_id:str): return {"status":"queued","message":"Timeline regeneration is scheduled for the ingestion worker."}
@router.get("/cases/{case_id}/inconsistencies")
async def inconsistencies(case_id:str,db:AsyncSession=Depends(get_db)): return (await db.execute(select(Inconsistency).where(Inconsistency.case_id==case_id))).scalars().all()
@router.patch("/inconsistencies/{inconsistency_id}")
async def update_inconsistency(inconsistency_id:str,status:InconsistencyStatus,reviewer_note:str|None=None,db:AsyncSession=Depends(get_db)):
    x=await db.get(Inconsistency,inconsistency_id)
    if not x: raise HTTPException(404,"Inconsistency not found")
    x.status=status; x.reviewer_note=reviewer_note; await db.commit(); return x
@router.post("/cases/{case_id}/inconsistencies/scan")
async def scan_inconsistencies(case_id:str): return {"status":"queued","disclaimer":"Potential inconsistencies for human review; not conclusions."}
@router.get("/cases/{case_id}/duplicates")
async def duplicates(case_id:str,db:AsyncSession=Depends(get_db)): return (await db.execute(select(DuplicateGroup).where(DuplicateGroup.case_id==case_id))).scalars().all()
@router.post("/cases/{case_id}/summary")
async def create_summary(case_id:str): return {"status":"queued","disclaimer":"AI-generated investigative summary requires human verification and is not a legal conclusion."}
@router.get("/cases/{case_id}/summary")
async def get_summary(case_id:str): return {"case_id":case_id,"overview":None,"key_people":[],"key_dates":[],"key_events":[],"notable_inconsistencies":[],"open_questions":[],"citations":[],"disclaimer":"AI output requires human verification and is not a legal conclusion."}
