import enum, uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Integer, BigInteger, Float, DateTime, ForeignKey, JSON, Enum, Table, Column, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db import Base

def uid(): return str(uuid.uuid4())
def now(): return datetime.now(timezone.utc)

class ProcessingStatus(str, enum.Enum): queued="queued"; processing="processing"; ready="ready"; failed="failed"
class EntityType(str, enum.Enum): person="person"; date="date"; location="location"; org="org"; phone="phone"; email="email"; other="other"
class InconsistencyStatus(str, enum.Enum): open="open"; reviewed="reviewed"; dismissed="dismissed"

class Case(Base):
    __tablename__="cases"; id: Mapped[str]=mapped_column(String(36), primary_key=True, default=uid); name: Mapped[str]=mapped_column(String(255)); description: Mapped[str|None]=mapped_column(Text); created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now); updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now,onupdate=now)
    evidence=relationship("EvidenceFile", cascade="all, delete-orphan")

class EvidenceFile(Base):
    __tablename__="evidence_files"; id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid); case_id: Mapped[str]=mapped_column(ForeignKey("cases.id",ondelete="CASCADE"),index=True); original_filename: Mapped[str]=mapped_column(String(500)); mime_type: Mapped[str]=mapped_column(String(200)); size: Mapped[int]=mapped_column(BigInteger); sha256: Mapped[str]=mapped_column(String(64),index=True); md5: Mapped[str]=mapped_column(String(32)); storage_path: Mapped[str]=mapped_column(String(1000)); uploaded_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now); processing_status: Mapped[ProcessingStatus]=mapped_column(Enum(ProcessingStatus),default=ProcessingStatus.queued); processing_error: Mapped[str|None]=mapped_column(Text); extracted_metadata: Mapped[dict]=mapped_column(JSON,default=dict)
    chunks=relationship("Chunk",cascade="all, delete-orphan")

class Chunk(Base):
    __tablename__="chunks"; id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid); evidence_id: Mapped[str]=mapped_column(ForeignKey("evidence_files.id",ondelete="CASCADE"),index=True); text: Mapped[str]=mapped_column(Text); page: Mapped[int|None]=mapped_column(Integer); timestamp: Mapped[str|None]=mapped_column(String(80)); line_range: Mapped[str|None]=mapped_column(String(80)); message_index: Mapped[int|None]=mapped_column(Integer); embedding_id: Mapped[str|None]=mapped_column(String(255));

class Entity(Base):
    __tablename__="entities"; id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid); case_id: Mapped[str]=mapped_column(ForeignKey("cases.id",ondelete="CASCADE"),index=True); type: Mapped[EntityType]=mapped_column(Enum(EntityType)); value: Mapped[str]=mapped_column(String(500)); normalized_value: Mapped[str]=mapped_column(String(500),index=True)
class EntityMention(Base):
    __tablename__="entity_mentions"; id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid); entity_id: Mapped[str]=mapped_column(ForeignKey("entities.id",ondelete="CASCADE")); chunk_id: Mapped[str]=mapped_column(ForeignKey("chunks.id",ondelete="CASCADE"))
class Relationship(Base):
    __tablename__="relationships"; id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid); source_entity: Mapped[str]=mapped_column(String(36)); target_entity: Mapped[str]=mapped_column(String(36)); type: Mapped[str]=mapped_column(String(100)); evidence_chunk_ids: Mapped[list]=mapped_column(JSON,default=list)
class TimelineEvent(Base):
    __tablename__="timeline_events"; id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid); case_id: Mapped[str]=mapped_column(ForeignKey("cases.id",ondelete="CASCADE")); timestamp: Mapped[datetime]=mapped_column(DateTime(timezone=True)); timestamp_precision: Mapped[str]=mapped_column(String(30)); description: Mapped[str]=mapped_column(Text); source_chunk_ids: Mapped[list]=mapped_column(JSON,default=list); confidence: Mapped[float]=mapped_column(Float,default=0)
class Inconsistency(Base):
    __tablename__="inconsistencies"; id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid); case_id: Mapped[str]=mapped_column(ForeignKey("cases.id",ondelete="CASCADE")); description: Mapped[str]=mapped_column(Text); severity: Mapped[str]=mapped_column(String(30)); chunk_ids_a: Mapped[list]=mapped_column(JSON,default=list); chunk_ids_b: Mapped[list]=mapped_column(JSON,default=list); status: Mapped[InconsistencyStatus]=mapped_column(Enum(InconsistencyStatus),default=InconsistencyStatus.open); reviewer_note: Mapped[str|None]=mapped_column(Text)
class DuplicateGroup(Base):
    __tablename__="duplicate_groups"; id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid); case_id: Mapped[str]=mapped_column(ForeignKey("cases.id",ondelete="CASCADE")); evidence_ids: Mapped[list]=mapped_column(JSON); type: Mapped[str]=mapped_column(String(20)); similarity: Mapped[float]=mapped_column(Float)
class ChatSession(Base):
    __tablename__="chat_sessions"; id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid); case_id: Mapped[str]=mapped_column(ForeignKey("cases.id",ondelete="CASCADE")); created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class ChatMessage(Base):
    __tablename__="chat_messages"; id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid); session_id: Mapped[str]=mapped_column(ForeignKey("chat_sessions.id",ondelete="CASCADE")); role: Mapped[str]=mapped_column(String(20)); content: Mapped[str]=mapped_column(Text); citations: Mapped[list]=mapped_column(JSON,default=list); created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class CustodyLogEntry(Base):
    __tablename__="custody_log"; id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid); evidence_id: Mapped[str]=mapped_column(ForeignKey("evidence_files.id",ondelete="CASCADE"),index=True); action: Mapped[str]=mapped_column(String(50)); actor: Mapped[str]=mapped_column(String(255)); timestamp: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now); details: Mapped[dict]=mapped_column(JSON,default=dict); prev_hash: Mapped[str|None]=mapped_column(String(64)); entry_hash: Mapped[str]=mapped_column(String(64),unique=True)
