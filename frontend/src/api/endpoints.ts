import { apiClient } from './client'
import type {
  Case,
  Evidence,
  EvidenceChunk,
  CustodyEvent,
  Entity,
  GraphData,
  Inconsistency,
  DuplicateGroup,
  Summary,
  SearchResult,
  TimelineEvent,
  PaginatedResponse,
} from '@/types'

// ─── Cases ───────────────────────────────────────────────────────────────────

export const casesApi = {
  list: () => apiClient.get<PaginatedResponse<Case>>('/cases'),
  get: (id: string) => apiClient.get<Case>(`/cases/${id}`),
  create: (data: { name: string; description: string; tags?: string[] }) =>
    apiClient.post<Case>('/cases', data),
  update: (id: string, data: Partial<Pick<Case, 'name' | 'description' | 'tags'>>) =>
    apiClient.patch<Case>(`/cases/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/cases/${id}`),
}

// ─── Evidence ────────────────────────────────────────────────────────────────

export const evidenceApi = {
  list: (caseId: string) =>
    apiClient.get<PaginatedResponse<Evidence>>(`/cases/${caseId}/evidence`),
  get: (id: string) => apiClient.get<Evidence>(`/evidence/${id}`),
  upload: (caseId: string, formData: FormData) =>
    apiClient.postForm<Evidence>(`/cases/${caseId}/evidence`, formData),
  getChunks: (id: string) =>
    apiClient.get<PaginatedResponse<EvidenceChunk>>(`/evidence/${id}/chunks`),
  getCustodyLog: (id: string) =>
    apiClient.get<PaginatedResponse<CustodyEvent>>(`/evidence/${id}/custody-log`),
  verify: (id: string) =>
    apiClient.post<{ evidence_id: string; integrity_status: string; verified_at: string }>(
      `/evidence/${id}/verify`
    ),
}

// ─── Timeline ────────────────────────────────────────────────────────────────

export const timelineApi = {
  list: (caseId: string) =>
    apiClient.get<{ items: TimelineEvent[]; total: number }>(`/cases/${caseId}/timeline`),
}

// ─── Graph ────────────────────────────────────────────────────────────────────

export const graphApi = {
  get: (caseId: string) => apiClient.get<GraphData>(`/cases/${caseId}/graph`),
}

// ─── Entities ─────────────────────────────────────────────────────────────────

export const entitiesApi = {
  list: (caseId: string) =>
    apiClient.get<{ items: Entity[]; total: number }>(`/cases/${caseId}/entities`),
}

// ─── Inconsistencies ──────────────────────────────────────────────────────────

export const inconsistenciesApi = {
  list: (caseId: string) =>
    apiClient.get<{ items: Inconsistency[]; total: number }>(`/cases/${caseId}/inconsistencies`),
  update: (id: string, data: Partial<Pick<Inconsistency, 'status' | 'reviewer_notes'>>) =>
    apiClient.patch<Inconsistency>(`/inconsistencies/${id}`, data),
}

// ─── Duplicates ───────────────────────────────────────────────────────────────

export const duplicatesApi = {
  list: (caseId: string) =>
    apiClient.get<{ items: DuplicateGroup[]; total: number }>(`/cases/${caseId}/duplicates`),
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export const summaryApi = {
  get: (caseId: string) => apiClient.get<Summary>(`/cases/${caseId}/summary`),
  generate: (caseId: string) => apiClient.post<Summary>(`/cases/${caseId}/summary`),
}

// ─── Search ───────────────────────────────────────────────────────────────────

export const searchApi = {
  search: (caseId: string, q: string) =>
    apiClient.get<{ items: SearchResult[]; total: number; query: string }>(
      `/cases/${caseId}/search?q=${encodeURIComponent(q)}`
    ),
}
