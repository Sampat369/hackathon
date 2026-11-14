import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy loaded page views
const CasesDashboard = lazy(() => import('@/features/cases/CasesDashboard'))
const EvidenceLibrary = lazy(() => import('@/features/evidence/EvidenceLibrary'))
const EvidenceViewer = lazy(() => import('@/features/evidence/EvidenceViewer'))
const ChatView = lazy(() => import('@/features/chat/ChatView'))
const Timeline = lazy(() => import('@/features/timeline/Timeline'))
const EntitiesGraph = lazy(() => import('@/features/graph/EntitiesGraph'))
const Inconsistencies = lazy(() => import('@/features/inconsistencies/Inconsistencies'))
const Duplicates = lazy(() => import('@/features/duplicates/Duplicates'))
const SummaryView = lazy(() => import('@/features/summary/SummaryView'))

function PageFallback() {
  return (
    <div className="space-y-6 p-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid gap-6 md:grid-cols-3 pt-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/cases" replace />} />

          <Route
            path="/cases"
            element={
              <Suspense fallback={<PageFallback />}>
                <CasesDashboard />
              </Suspense>
            }
          />

          <Route
            path="/cases/:caseId"
            element={<Navigate to="evidence" replace />}
          />

          <Route
            path="/cases/:caseId/evidence"
            element={
              <Suspense fallback={<PageFallback />}>
                <EvidenceLibrary />
              </Suspense>
            }
          />

          <Route
            path="/cases/:caseId/evidence/:evidenceId"
            element={
              <Suspense fallback={<PageFallback />}>
                <EvidenceViewer />
              </Suspense>
            }
          />

          <Route
            path="/cases/:caseId/chat"
            element={
              <Suspense fallback={<PageFallback />}>
                <ChatView />
              </Suspense>
            }
          />

          <Route
            path="/cases/:caseId/chat/:sessionId"
            element={
              <Suspense fallback={<PageFallback />}>
                <ChatView />
              </Suspense>
            }
          />

          <Route
            path="/cases/:caseId/timeline"
            element={
              <Suspense fallback={<PageFallback />}>
                <Timeline />
              </Suspense>
            }
          />

          <Route
            path="/cases/:caseId/entities"
            element={
              <Suspense fallback={<PageFallback />}>
                <EntitiesGraph />
              </Suspense>
            }
          />

          <Route
            path="/cases/:caseId/inconsistencies"
            element={
              <Suspense fallback={<PageFallback />}>
                <Inconsistencies />
              </Suspense>
            }
          />

          <Route
            path="/cases/:caseId/duplicates"
            element={
              <Suspense fallback={<PageFallback />}>
                <Duplicates />
              </Suspense>
            }
          />

          <Route
            path="/cases/:caseId/summary"
            element={
              <Suspense fallback={<PageFallback />}>
                <SummaryView />
              </Suspense>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/cases" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
