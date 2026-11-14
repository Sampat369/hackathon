import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { casesApi, evidenceApi, timelineApi, graphApi, entitiesApi, inconsistenciesApi, duplicatesApi, summaryApi, searchApi } from '@/api/endpoints'
import { POLLING_INTERVAL, QUERY_STALE_TIME } from '@/lib/constants'
import type { Case, Evidence, Inconsistency } from '@/types'

// ─── Cases ───────────────────────────────────────────────────────────────────

export function useCases(options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: ['cases'],
    queryFn: () => casesApi.list(),
    staleTime: QUERY_STALE_TIME,
    ...(options as object),
  })
}

export function useCase(id: string | undefined) {
  return useQuery({
    queryKey: ['cases', id],
    queryFn: () => casesApi.get(id!),
    enabled: !!id,
    staleTime: QUERY_STALE_TIME,
  })
}

export function useCreateCase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; description: string; tags?: string[] }) =>
      casesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cases'] }),
  })
}

export function useUpdateCase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<Case, 'name' | 'description' | 'tags'>> }) =>
      casesApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['cases'] })
      qc.invalidateQueries({ queryKey: ['cases', id] })
    },
  })
}

export function useDeleteCase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => casesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cases'] }),
  })
}

// ─── Evidence ────────────────────────────────────────────────────────────────

export function useEvidence(caseId: string | undefined) {
  return useQuery({
    queryKey: ['evidence', caseId],
    queryFn: () => evidenceApi.list(caseId!),
    enabled: !!caseId,
    staleTime: QUERY_STALE_TIME,
    refetchInterval: (query) => {
      const data = query.state.data as { items: Evidence[] } | undefined
      const hasActive = data?.items.some(
        e => e.processing_status === 'processing' || e.processing_status === 'queued'
      )
      return hasActive ? POLLING_INTERVAL : false
    },
  })
}

export function useEvidenceItem(id: string | undefined) {
  return useQuery({
    queryKey: ['evidence-item', id],
    queryFn: () => evidenceApi.get(id!),
    enabled: !!id,
    staleTime: QUERY_STALE_TIME,
  })
}

export function useEvidenceChunks(id: string | undefined) {
  return useQuery({
    queryKey: ['evidence-chunks', id],
    queryFn: () => evidenceApi.getChunks(id!),
    enabled: !!id,
    staleTime: QUERY_STALE_TIME,
  })
}

export function useCustodyLog(id: string | undefined) {
  return useQuery({
    queryKey: ['custody-log', id],
    queryFn: () => evidenceApi.getCustodyLog(id!),
    enabled: !!id,
    staleTime: QUERY_STALE_TIME,
  })
}

export function useVerifyEvidence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => evidenceApi.verify(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['evidence-item', id] })
      qc.invalidateQueries({ queryKey: ['custody-log', id] })
    },
  })
}

// ─── Timeline ────────────────────────────────────────────────────────────────

export function useTimeline(caseId: string | undefined) {
  return useQuery({
    queryKey: ['timeline', caseId],
    queryFn: () => timelineApi.list(caseId!),
    enabled: !!caseId,
    staleTime: QUERY_STALE_TIME,
  })
}

// ─── Graph & Entities ─────────────────────────────────────────────────────────

export function useGraph(caseId: string | undefined) {
  return useQuery({
    queryKey: ['graph', caseId],
    queryFn: () => graphApi.get(caseId!),
    enabled: !!caseId,
    staleTime: QUERY_STALE_TIME,
  })
}

export function useEntities(caseId: string | undefined) {
  return useQuery({
    queryKey: ['entities', caseId],
    queryFn: () => entitiesApi.list(caseId!),
    enabled: !!caseId,
    staleTime: QUERY_STALE_TIME,
  })
}

// ─── Inconsistencies ──────────────────────────────────────────────────────────

export function useInconsistencies(caseId: string | undefined) {
  return useQuery({
    queryKey: ['inconsistencies', caseId],
    queryFn: () => inconsistenciesApi.list(caseId!),
    enabled: !!caseId,
    staleTime: QUERY_STALE_TIME,
  })
}

export function useUpdateInconsistency() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<Inconsistency, 'status' | 'reviewer_notes'>> }) =>
      inconsistenciesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inconsistencies'] }),
  })
}

// ─── Duplicates ───────────────────────────────────────────────────────────────

export function useDuplicates(caseId: string | undefined) {
  return useQuery({
    queryKey: ['duplicates', caseId],
    queryFn: () => duplicatesApi.list(caseId!),
    enabled: !!caseId,
    staleTime: QUERY_STALE_TIME,
  })
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export function useSummary(caseId: string | undefined) {
  return useQuery({
    queryKey: ['summary', caseId],
    queryFn: () => summaryApi.get(caseId!),
    enabled: !!caseId,
    staleTime: QUERY_STALE_TIME,
    retry: false,
  })
}

export function useGenerateSummary() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (caseId: string) => summaryApi.generate(caseId),
    onSuccess: (_, caseId) => qc.invalidateQueries({ queryKey: ['summary', caseId] }),
  })
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function useSearch(caseId: string | undefined, q: string) {
  return useQuery({
    queryKey: ['search', caseId, q],
    queryFn: () => searchApi.search(caseId!, q),
    enabled: !!caseId && q.length >= 2,
    staleTime: 10_000,
  })
}
