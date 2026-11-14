import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FileSearch,
  Upload,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  FileText,
} from 'lucide-react'
import { useEvidence } from '@/hooks/queries'
import { formatBytes, formatDate, getEvidenceTypeIcon, getStatusColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function EvidenceLibrary() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useEvidence(caseId)
  const [filterType, setFilterType] = useState<string>('all')

  const items = data?.items || []
  const filtered = filterType === 'all' ? items : items.filter((i) => i.type === filterType)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Evidence Repository</h1>
          <p className="text-sm text-muted-foreground">
            Manage, verify cryptographic integrity, and inspect case exhibits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Evidence
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {['all', 'pdf', 'email', 'chat', 'audio', 'video', 'document'].map((t) => (
          <Button
            key={t}
            variant={filterType === t ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterType(t)}
            className="capitalize text-xs h-8"
          >
            {t}
          </Button>
        ))}
      </div>

      {/* Evidence Table */}
      <div className="rounded-md border bg-card shadow-xs overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="py-3 px-4">Evidence</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4">Integrity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Uploaded</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-48" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-12" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="py-3.5 px-4 text-right"><Skeleton className="h-8 w-16 ml-auto" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <FileSearch className="mx-auto h-8 w-8 mb-2 opacity-40" />
                  No evidence files match the selected filter.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/cases/${caseId}/evidence/${item.id}`)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{getEvidenceTypeIcon(item.type)}</span>
                      <div>
                        <div className="font-medium group-hover:text-primary transition-colors flex items-center gap-1.5">
                          {item.original_filename}
                          {item.is_duplicate && (
                            <Badge variant="outline" className="text-[10px] text-amber-600 bg-amber-50">
                              Duplicate
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {item.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 uppercase text-xs font-mono font-medium text-muted-foreground">
                    {item.type}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono">
                    {formatBytes(item.size)}
                  </td>
                  <td className="py-3 px-4">
                    {item.integrity_status === 'verified' && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                      </span>
                    )}
                    {item.integrity_status === 'mismatch' && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" /> Mismatch
                      </span>
                    )}
                    {item.integrity_status === 'unchecked' && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> Unchecked
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize font-medium border ${getStatusColor(
                        item.processing_status
                      )}`}
                    >
                      {item.processing_status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {formatDate(item.upload_date)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/cases/${caseId}/evidence/${item.id}`)
                      }}
                      className="gap-1 h-8 text-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
