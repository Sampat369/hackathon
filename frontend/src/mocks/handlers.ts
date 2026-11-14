import { http, HttpResponse } from 'msw'
import {
  mockCases,
  mockEvidence,
  mockTimeline,
  mockGraph,
  mockEntities,
  mockInconsistencies,
  mockDuplicateGroups,
  mockSummary,
  mockChatSessions,
  mockMessages,
  mockSearchResults,
  mockCustodyLog,
  mockChunks,
} from './data'
import type { Case, Inconsistency } from '@/types'

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

export const handlers = [
  // ─── Cases ────────────────────────────────────────────────────────────────

  http.get('/api/v1/cases', async () => {
    await delay(300)
    return HttpResponse.json({ items: mockCases, total: mockCases.length, page: 1, page_size: 20, has_next: false })
  }),

  http.get('/api/v1/cases/:id', async ({ params }) => {
    await delay(200)
    const c = mockCases.find(c => c.id === params.id)
    if (!c) return HttpResponse.json({ detail: 'Case not found', status_code: 404 }, { status: 404 })
    return HttpResponse.json(c)
  }),

  http.post('/api/v1/cases', async ({ request }) => {
    await delay(400)
    const body = await request.json() as Partial<Case>
    const newCase: Case = {
      id: `case-${Date.now()}`,
      name: body.name ?? 'New Case',
      description: body.description ?? '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      evidence_count: 0,
      processing_status: 'queued',
      tags: body.tags ?? [],
    }
    mockCases.push(newCase)
    return HttpResponse.json(newCase, { status: 201 })
  }),

  http.patch('/api/v1/cases/:id', async ({ params, request }) => {
    await delay(300)
    const idx = mockCases.findIndex(c => c.id === params.id)
    if (idx === -1) return HttpResponse.json({ detail: 'Not found', status_code: 404 }, { status: 404 })
    const body = await request.json() as Partial<Case>
    mockCases[idx] = { ...mockCases[idx], ...body, updated_at: new Date().toISOString() }
    return HttpResponse.json(mockCases[idx])
  }),

  http.delete('/api/v1/cases/:id', async ({ params }) => {
    await delay(300)
    const idx = mockCases.findIndex(c => c.id === params.id)
    if (idx === -1) return HttpResponse.json({ detail: 'Not found', status_code: 404 }, { status: 404 })
    mockCases.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // ─── Evidence ─────────────────────────────────────────────────────────────

  http.get('/api/v1/cases/:caseId/evidence', async ({ params }) => {
    await delay(300)
    const items = mockEvidence.filter(e => e.case_id === params.caseId)
    return HttpResponse.json({ items, total: items.length, page: 1, page_size: 50, has_next: false })
  }),

  http.post('/api/v1/cases/:caseId/evidence', async ({ params }) => {
    await delay(500)
    // Simulate upload — return queued item
    const newEv = {
      id: `ev-${Date.now()}`,
      case_id: params.caseId as string,
      filename: 'uploaded_file.pdf',
      original_filename: 'uploaded_file.pdf',
      type: 'pdf' as const,
      size: 102400,
      sha256: '',
      integrity_status: 'unchecked' as const,
      processing_status: 'queued' as const,
      upload_date: new Date().toISOString(),
      processed_at: null,
      page_count: null,
      duration: null,
      is_duplicate: false,
      duplicate_of: null,
      metadata: {},
    }
    mockEvidence.push(newEv)
    return HttpResponse.json(newEv, { status: 201 })
  }),

  http.get('/api/v1/evidence/:id', async ({ params }) => {
    await delay(200)
    const ev = mockEvidence.find(e => e.id === params.id)
    if (!ev) return HttpResponse.json({ detail: 'Not found', status_code: 404 }, { status: 404 })
    return HttpResponse.json(ev)
  }),

  http.get('/api/v1/evidence/:id/chunks', async ({ params }) => {
    await delay(200)
    const chunks = mockChunks.filter(c => c.evidence_id === params.id)
    return HttpResponse.json({ items: chunks, total: chunks.length, page: 1, page_size: 50, has_next: false })
  }),

  http.get('/api/v1/evidence/:id/custody-log', async ({ params }) => {
    await delay(200)
    const events = mockCustodyLog.filter(e => e.evidence_id === params.id)
    return HttpResponse.json({ items: events, total: events.length, page: 1, page_size: 50, has_next: false })
  }),

  http.post('/api/v1/evidence/:id/verify', async ({ params }) => {
    await delay(1000)
    const ev = mockEvidence.find(e => e.id === params.id)
    if (!ev) return HttpResponse.json({ detail: 'Not found', status_code: 404 }, { status: 404 })
    return HttpResponse.json({ evidence_id: params.id, integrity_status: ev.integrity_status, verified_at: new Date().toISOString() })
  }),

  // ─── Timeline ─────────────────────────────────────────────────────────────

  http.get('/api/v1/cases/:caseId/timeline', async ({ params }) => {
    await delay(300)
    const items = mockTimeline.filter(t => t.case_id === params.caseId)
    return HttpResponse.json({ items, total: items.length })
  }),

  // ─── Graph & Entities ─────────────────────────────────────────────────────

  http.get('/api/v1/cases/:caseId/graph', async () => {
    await delay(400)
    return HttpResponse.json(mockGraph)
  }),

  http.get('/api/v1/cases/:caseId/entities', async ({ params }) => {
    await delay(300)
    const items = mockEntities.filter(e => e.case_id === params.caseId)
    return HttpResponse.json({ items, total: items.length })
  }),

  // ─── Inconsistencies ──────────────────────────────────────────────────────

  http.get('/api/v1/cases/:caseId/inconsistencies', async ({ params }) => {
    await delay(300)
    const items = mockInconsistencies.filter(i => i.case_id === params.caseId)
    return HttpResponse.json({ items, total: items.length })
  }),

  http.patch('/api/v1/inconsistencies/:id', async ({ params, request }) => {
    await delay(300)
    const idx = mockInconsistencies.findIndex(i => i.id === params.id)
    if (idx === -1) return HttpResponse.json({ detail: 'Not found', status_code: 404 }, { status: 404 })
    const body = await request.json() as Partial<Inconsistency>
    mockInconsistencies[idx] = { ...mockInconsistencies[idx], ...body }
    return HttpResponse.json(mockInconsistencies[idx])
  }),

  // ─── Duplicates ───────────────────────────────────────────────────────────

  http.get('/api/v1/cases/:caseId/duplicates', async () => {
    await delay(300)
    return HttpResponse.json({ items: mockDuplicateGroups, total: mockDuplicateGroups.length })
  }),

  // ─── Summary ──────────────────────────────────────────────────────────────

  http.get('/api/v1/cases/:caseId/summary', async () => {
    await delay(400)
    return HttpResponse.json(mockSummary)
  }),

  http.post('/api/v1/cases/:caseId/summary', async () => {
    await delay(2000)
    return HttpResponse.json({ ...mockSummary, generated_at: new Date().toISOString() }, { status: 201 })
  }),

  // ─── Search ───────────────────────────────────────────────────────────────

  http.get('/api/v1/cases/:caseId/search', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.toLowerCase() ?? ''
    const results = q.length >= 2
      ? mockSearchResults.filter(r => r.content.toLowerCase().includes(q))
      : []
    return HttpResponse.json({ items: results, total: results.length, query: q })
  }),

  // ─── Chat (SSE streaming mock) ────────────────────────────────────────────

  http.post('/api/v1/cases/:caseId/chat', async ({ request }) => {
    await delay(100)
    const body = await request.json() as { message: string; session_id?: string }
    const userMessage = body.message ?? ''

    const assistantTokens = mockMessages[1].content.split(' ')
    const citations = mockMessages[1].citations

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        // Send session info
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'session', session_id: 'session-' + Date.now(), message_id: 'msg-' + Date.now() })}\n\n`))
        await delay(50)

        // Stream tokens
        for (const token of assistantTokens) {
          await delay(30)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', content: token + ' ' })}\n\n`))
        }

        // Send citations
        await delay(100)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'citations', citations })}\n\n`))

        // Done
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', user_message: userMessage })}\n\n`))
        controller.close()
      }
    })

    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }),

  // ─── Chat Sessions ────────────────────────────────────────────────────────

  http.get('/api/v1/cases/:caseId/chat/sessions', async ({ params }) => {
    await delay(200)
    const items = mockChatSessions.filter(s => s.case_id === params.caseId)
    return HttpResponse.json({ items, total: items.length })
  }),

  http.get('/api/v1/cases/:caseId/chat/sessions/:sessionId/messages', async () => {
    await delay(200)
    return HttpResponse.json({ items: mockMessages, total: mockMessages.length })
  }),
]
