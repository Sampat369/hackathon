// ─── Status / Enum Types ────────────────────────────────────────────────────

export type ProcessingStatus = 'queued' | 'processing' | 'ready' | 'failed'
export type EvidenceType = 'pdf' | 'image' | 'document' | 'email' | 'chat' | 'audio' | 'video' | 'other'
export type EntityType = 'person' | 'organization' | 'location' | 'email' | 'phone' | 'date' | 'other'
export type InconsistencyStatus = 'open' | 'reviewed' | 'resolved' | 'dismissed'
export type InconsistencySeverity = 'high' | 'medium' | 'low'
export type TimePrecision = 'exact' | 'approximate' | 'date_only' | 'month_only' | 'year_only'
export type IntegrityStatus = 'verified' | 'mismatch' | 'unchecked'

// ─── Case ───────────────────────────────────────────────────────────────────

export interface Case {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
  evidence_count: number
  processing_status: ProcessingStatus
  tags: string[]
}

// ─── Evidence ───────────────────────────────────────────────────────────────

export interface Evidence {
  id: string
  case_id: string
  filename: string
  original_filename: string
  type: EvidenceType
  size: number
  sha256: string
  integrity_status: IntegrityStatus
  processing_status: ProcessingStatus
  upload_date: string
  processed_at: string | null
  page_count: number | null
  duration: number | null
  is_duplicate: boolean
  duplicate_of: string | null
  metadata: Record<string, unknown>
}

export interface EvidenceChunk {
  id: string
  evidence_id: string
  content: string
  page: number | null
  timestamp_start: number | null
  timestamp_end: number | null
  chunk_index: number
}

export interface CustodyEvent {
  id: string
  evidence_id: string
  action: string
  performed_by: string
  timestamp: string
  notes: string | null
  hash_before: string | null
  hash_after: string | null
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface Citation {
  number: number
  evidence_id: string
  evidence_filename: string
  snippet: string
  page: number | null
  timestamp: number | null
  chunk_id: string
}

export interface EvidenceRef {
  id: string
  filename: string
  type: EvidenceType
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations: Citation[]
  created_at: string
  metadata: Record<string, unknown>
}

export interface ChatSession {
  id: string
  case_id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

// ─── Timeline ────────────────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string
  case_id: string
  timestamp: string
  timestamp_end: string | null
  precision: TimePrecision
  title: string
  description: string
  evidence_ids: string[]
  entity_ids: string[]
  tags: string[]
  is_inferred: boolean
}

// ─── Entities & Graph ────────────────────────────────────────────────────────

export interface Entity {
  id: string
  case_id: string
  name: string
  type: EntityType
  aliases: string[]
  description: string | null
  evidence_count: number
  mention_count: number
  metadata: Record<string, unknown>
}

export interface GraphNode {
  id: string
  label: string
  type: EntityType
  size: number
  color: string
  metadata: Record<string, unknown>
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
  weight: number
  evidence_ids: string[]
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

// ─── Inconsistencies ─────────────────────────────────────────────────────────

export interface Inconsistency {
  id: string
  case_id: string
  title: string
  description: string
  severity: InconsistencySeverity
  status: InconsistencyStatus
  evidence_ids: string[]
  chunk_ids: string[]
  created_at: string
  reviewed_at: string | null
  reviewer_notes: string | null
  snippets: Array<{
    evidence_id: string
    evidence_filename: string
    text: string
    page: number | null
  }>
}

// ─── Duplicates ──────────────────────────────────────────────────────────────

export interface DuplicateGroup {
  id: string
  case_id: string
  primary_evidence_id: string
  duplicate_evidence_ids: string[]
  similarity_score: number
  detection_method: string
  created_at: string
  primary?: Evidence
  duplicates?: Evidence[]
}

// ─── Summary ─────────────────────────────────────────────────────────────────

export interface Summary {
  id: string
  case_id: string
  generated_at: string
  model: string
  executive_summary: string
  key_facts: string[]
  key_persons: Array<{ name: string; role: string; significance: string }>
  key_organizations: Array<{ name: string; role: string }>
  chronology: Array<{ date: string; event: string }>
  inconsistencies_summary: string
  evidence_gaps: string[]
  recommendations: string[]
  word_count: number
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchResult {
  chunk_id: string
  evidence_id: string
  evidence_filename: string
  evidence_type: EvidenceType
  content: string
  page: number | null
  timestamp: number | null
  score: number
  highlights: string[]
}

// ─── Generic ─────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  has_next: boolean
}

export interface ApiError {
  detail: string
  status_code: number
  errors?: Record<string, string[]>
}
