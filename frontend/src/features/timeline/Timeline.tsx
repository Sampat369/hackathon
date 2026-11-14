import React from 'react'
import { useParams } from 'react-router-dom'
import { Clock, Calendar, Tag, AlertCircle, FileText } from 'lucide-react'
import { useTimeline } from '@/hooks/queries'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function Timeline() {
  const { caseId } = useParams<{ caseId: string }>()
  const { data, isLoading } = useTimeline(caseId || 'case-001')

  const events = data?.items || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Case Chronology & Timeline</h1>
        <p className="text-sm text-muted-foreground">
          Chronological reconstruction of events synthesized from emails, documents, and transcripts.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6 pl-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative pl-6 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-16 w-full max-w-xl" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="mx-auto h-8 w-8 mb-2 opacity-40" />
          No chronological events generated yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-primary/30">
          {events.map((evt) => (
            <div key={evt.id} className="relative pl-6 group">
              {/* Timeline marker */}
              <div className="absolute -left-[19px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-background border-2 border-primary shadow-xs group-hover:scale-125 transition-transform" />

              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-xs font-mono text-primary">
                        {formatDate(evt.timestamp, 'MMMM d, yyyy')}
                      </span>
                      {evt.is_inferred && (
                        <Badge variant="outline" className="text-[10px] text-amber-600 bg-amber-50">
                          Inferred
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Precision: {evt.precision}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-foreground mt-1">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between pt-2 gap-2 text-xs">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {evt.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-medium"
                        >
                          <Tag className="h-2.5 w-2.5 opacity-60" />
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Evidence refs */}
                    {evt.evidence_ids.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        <span>{evt.evidence_ids.length} linked exhibit(s)</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
