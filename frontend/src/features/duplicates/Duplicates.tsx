import React from 'react'
import { useParams } from 'react-router-dom'
import { Copy, FileText, CheckCircle2 } from 'lucide-react'
import { useDuplicates } from '@/hooks/queries'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function Duplicates() {
  const { caseId } = useParams<{ caseId: string }>()
  const { data, isLoading } = useDuplicates(caseId || 'case-001')

  const groups = data?.items || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Copy className="h-6 w-6 text-primary" />
          Duplicate Exhibit Detection
        </h1>
        <p className="text-sm text-muted-foreground">
          Identifies byte-for-byte SHA256 duplicates and semantic document overlaps to eliminate redundancy.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle2 className="mx-auto h-8 w-8 mb-2 text-green-500 opacity-60" />
          No duplicate documents discovered in this case.
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((grp) => (
            <Card key={grp.id} className="border shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {grp.id}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Detection method:{' '}
                    <span className="font-mono font-medium text-foreground">
                      {grp.detection_method}
                    </span>
                  </span>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  Match: {(grp.similarity_score * 100).toFixed(0)}%
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-md border p-3 bg-card">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                      Primary Master Exhibit
                    </p>
                    <div className="flex items-center gap-2 font-mono text-sm text-primary">
                      <FileText className="h-4 w-4" />
                      <span>{grp.primary_evidence_id}</span>
                    </div>
                  </div>

                  <div className="rounded-md border p-3 bg-muted/30">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                      Redundant Copy
                    </p>
                    <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{grp.duplicate_evidence_ids.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
