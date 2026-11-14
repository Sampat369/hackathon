import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import {
  useEvidenceItem,
  useEvidenceChunks,
  useCustodyLog,
  useVerifyEvidence,
} from '@/hooks/queries'
import { formatBytes, formatDate, formatRelative } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

export default function EvidenceViewer() {
  const { caseId, evidenceId } = useParams<{ caseId: string; evidenceId: string }>()
  const navigate = useNavigate()

  const { data: item, isLoading } = useEvidenceItem(evidenceId)
  const { data: chunks } = useEvidenceChunks(evidenceId)
  const { data: custody } = useCustodyLog(evidenceId)
  const verify = useVerifyEvidence()

  const handleVerify = () => {
    if (evidenceId) verify.mutate(evidenceId)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-bold">Evidence Viewer</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Select a file from the repository to preview its contents and cryptographic provenance.
        </p>
        <Button onClick={() => navigate(`/cases/${caseId}/evidence`)}>
          Back to Evidence Library
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/cases/${caseId}/evidence`)}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              {item.original_filename}
              {item.is_duplicate && (
                <Badge variant="outline" className="text-xs text-amber-600 bg-amber-50">
                  Duplicate
                </Badge>
              )}
            </h1>
            <p className="text-xs font-mono text-muted-foreground">ID: {item.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleVerify}
            disabled={verify.isPending}
            className="gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${verify.isPending ? 'animate-spin' : ''}`} />
            {verify.isPending ? 'Verifying...' : 'Verify Cryptographic Hash'}
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Preview & Chunks */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Document Preview</TabsTrigger>
              <TabsTrigger value="chunks">
                Extracted Chunks ({chunks?.items.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-4">
              <Card className="min-h-[450px] flex flex-col items-center justify-center p-8 text-center bg-card">
                <FileText className="h-16 w-16 text-primary/40 mb-3" />
                <h3 className="font-semibold text-base">{item.filename}</h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  Preview rendered for exhibit demonstration. Full text has been indexed and chunked for semantic vector queries.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {formatBytes(item.size)}
                  </Badge>
                  <Badge variant="secondary" className="uppercase font-mono text-xs">
                    {item.type}
                  </Badge>
                  {item.page_count && (
                    <Badge variant="secondary" className="text-xs">
                      {item.page_count} Pages
                    </Badge>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="chunks" className="mt-4 space-y-3">
              {!chunks || chunks.items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No textual chunks extracted yet.
                </p>
              ) : (
                chunks.items.map((chunk) => (
                  <Card key={chunk.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono font-medium text-foreground">
                        Chunk #{chunk.chunk_index}
                      </span>
                      {chunk.page && <span>Page {chunk.page}</span>}
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground bg-muted/30 p-3 rounded font-mono">
                      {chunk.content}
                    </p>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Metadata & Chain of Custody */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Integrity & Provenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <p className="text-muted-foreground font-medium">Integrity Status</p>
                <div className="mt-1">
                  {item.integrity_status === 'verified' && (
                    <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold">
                      <CheckCircle2 className="h-4 w-4" /> SHA-256 Hash Verified
                    </span>
                  )}
                  {item.integrity_status === 'mismatch' && (
                    <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold">
                      <AlertTriangle className="h-4 w-4" /> Hash Mismatch Detected!
                    </span>
                  )}
                  {item.integrity_status === 'unchecked' && (
                    <span className="text-muted-foreground">Unchecked</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-muted-foreground font-medium">SHA-256 Checksum</p>
                <p className="font-mono text-[11px] break-all bg-muted p-2 rounded mt-1 select-all">
                  {item.sha256 || 'Pending calculation...'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t text-muted-foreground">
                <div>
                  <span className="font-medium">Uploaded:</span>
                  <p className="text-foreground">{formatDate(item.upload_date)}</p>
                </div>
                <div>
                  <span className="font-medium">Processed:</span>
                  <p className="text-foreground">
                    {item.processed_at ? formatRelative(item.processed_at) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chain of Custody */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Chain of Custody
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!custody || custody.items.length === 0 ? (
                <p className="text-xs text-muted-foreground">No custody records logged.</p>
              ) : (
                <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {custody.items.map((event) => (
                    <div key={event.id} className="relative text-xs space-y-0.5">
                      <div className="absolute -left-[19px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold capitalize text-foreground">
                          {event.action}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        By: <span className="font-medium">{event.performed_by}</span>
                      </p>
                      {event.notes && (
                        <p className="text-[11px] text-muted-foreground italic">
                          "{event.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
