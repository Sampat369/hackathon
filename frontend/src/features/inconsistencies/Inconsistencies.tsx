import React from 'react'
import { useParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle, FileText, ArrowRight } from 'lucide-react'
import { useInconsistencies, useUpdateInconsistency } from '@/hooks/queries'
import { getSeverityColor } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function Inconsistencies() {
  const { caseId } = useParams<{ caseId: string }>()
  const { data, isLoading } = useInconsistencies(caseId || 'case-001')
  const updateInconsistency = useUpdateInconsistency()

  const items = data?.items || []

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'open' ? 'reviewed' : 'open'
    updateInconsistency.mutate({ id, data: { status: nextStatus } })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          Detected Evidentiary Inconsistencies
        </h1>
        <p className="text-sm text-muted-foreground">
          Cross-document contradictions, chronology mismatches, and integrity anomalies flagged by AI analysis.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle className="mx-auto h-8 w-8 mb-2 text-green-500 opacity-60" />
          No evidentiary contradictions detected in this case.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((inc) => (
            <Card key={inc.id} className="flex flex-col justify-between border shadow-xs">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] capitalize font-bold border ${getSeverityColor(
                      inc.severity
                    )}`}
                  >
                    {inc.severity} Severity
                  </Badge>
                  <Badge
                    variant={inc.status === 'open' ? 'default' : 'secondary'}
                    className="text-[10px] uppercase font-mono"
                  >
                    {inc.status}
                  </Badge>
                </div>
                <CardTitle className="text-base text-foreground leading-snug">
                  {inc.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {inc.description}
                </p>
              </CardHeader>

              {inc.snippets && inc.snippets.length > 0 && (
                <CardContent className="space-y-3 pt-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Contradicting Statements:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {inc.snippets.map((snip, idx) => (
                      <div
                        key={idx}
                        className="rounded-md border bg-muted/40 p-2.5 text-xs space-y-1"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-primary text-[11px]">
                          <FileText className="h-3 w-3" />
                          <span>{snip.evidence_filename}</span>
                          {snip.page && (
                            <span className="text-muted-foreground font-mono">
                              (p. {snip.page})
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground italic text-[11px]">
                          "{snip.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}

              <CardFooter className="flex items-center justify-between border-t bg-muted/10 p-3">
                <span className="text-[11px] text-muted-foreground">
                  ID: <span className="font-mono">{inc.id}</span>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleStatus(inc.id, inc.status)}
                  className="text-xs h-8"
                >
                  Mark as {inc.status === 'open' ? 'Reviewed' : 'Open'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
