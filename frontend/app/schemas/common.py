from pydantic import BaseModel, Field
from datetime import datetime
from typing import Any
class ErrorEnvelope(BaseModel): detail: str; code: str = "error"
class Page(BaseModel): items: list[Any]; total: int; limit: int; offset: int
class CaseCreate(BaseModel): name: str = Field(min_length=1,max_length=255); description: str|None=None
class CaseRead(CaseCreate): id: str; created_at: datetime; updated_at: datetime
class QuestionRequest(BaseModel): session_id: str|None=None; message: str=Field(min_length=1); evidence_ids: list[str]|None=None
