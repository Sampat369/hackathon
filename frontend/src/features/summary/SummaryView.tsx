import React from 'react'
import { useParams } from 'react-router-dom'
import {
  FileText,
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
} from 'lucide-react'
import { useSummary, useGenerateSummary } from '@/hooks/queries'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function SummaryView() {
  const { caseId } = useParams<{ caseId: string }>()
  const currentCaseId = caseId || 'case-001'
  const { data: summary, isLoading } = useSummary(currentCaseId)
  const generateSummary = useGenerateSummary()

  const handleGenerate = () => {
    generateSummary.mutate(currentCaseId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            AI Case Summary Brief
          </h1>
          <p className="text-sm text-muted-foreground">
            Automated legal synthesis, key findings, and strategic case recommendations.
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generateSummary.isPending}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${generateSummary.isPending ? 'animate-spin' : ''}`} />
          {generateSummary.isPending ? 'Synthesizing...' : 'Regenerate Brief'}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      ) : !summary ? (
        <div className="text-center py-12 text-muted-foreground">
          <Sparkles className="mx-auto h-8 w-8 mb-2 text-primary opacity-60" />
          No summary brief generated for this case yet. Click "Regenerate Brief" to create one.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive Summary */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Executive Summary
                </CardTitle>
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <Badge variant="outline">{summary.model}</Badge>
                  <span>{formatDate(summary.generated_at)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/90">
                {summary.executive_summary}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Facts */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Core Factual Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs">
                  {summary.key_facts.map((fact, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono text-primary font-bold">•</span>
                      <span className="text-muted-foreground">{fact}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Strategic Recommendations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Strategic Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs">
                  {summary.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono text-amber-500 font-bold">→</span>
                      <span className="text-muted-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Key Persons Involved */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Principal Parties & Witnesses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {summary.key_persons.map((p, i) => (
                  <div key={i} className="rounded-md border p-3 bg-muted/20 text-xs space-y-1">
                    <p className="font-semibold text-foreground">{p.name}</p>
                    <p className="text-[11px] text-primary font-medium">{p.role}</p>
                    <p className="text-[11px] text-muted-foreground">{p.significance}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
