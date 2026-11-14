import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Network, Users, Building, Mail, Phone, MapPin, Sparkles } from 'lucide-react'
import { useGraph, useEntities } from '@/hooks/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function EntitiesGraph() {
  const { caseId } = useParams<{ caseId: string }>()
  const { data: graphData, isLoading: isGraphLoading } = useGraph(caseId || 'case-001')
  const { data: entitiesData, isLoading: isEntitiesLoading } = useEntities(caseId || 'case-001')
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)

  const nodes = graphData?.nodes || []
  const edges = graphData?.edges || []
  const entities = entitiesData?.items || []

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'person': return <Users className="h-4 w-4" />
      case 'organization': return <Building className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'phone': return <Phone className="h-4 w-4" />
      case 'location': return <MapPin className="h-4 w-4" />
      default: return <Network className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Entity Relationship Graph</h1>
        <p className="text-sm text-muted-foreground">
          Visual knowledge graph mapping actors, organizations, communications, and institutional relationships.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Visual Graph Area */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden border bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b p-4 bg-muted/20">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Network className="h-4 w-4 text-primary" />
                Network Visualization Canvas
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {nodes.length} Nodes • {edges.length} Connections
              </Badge>
            </CardHeader>
            <CardContent className="p-6">
              {isGraphLoading ? (
                <Skeleton className="h-[420px] w-full" />
              ) : (
                <div className="relative h-[420px] w-full rounded-md border bg-slate-950/5 dark:bg-slate-950/40 flex items-center justify-center p-8 overflow-hidden">
                  {/* Visual Node Cluster Representation */}
                  <div className="flex flex-wrap items-center justify-center gap-6 max-w-lg">
                    {nodes.map((node) => (
                      <button
                        key={node.id}
                        onClick={() => setSelectedEntityId(node.id)}
                        className={`group relative flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-xs transition-all hover:scale-105 ${
                          selectedEntityId === node.id
                            ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/40'
                            : 'bg-background hover:bg-accent text-foreground'
                        }`}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: node.color }}
                        />
                        <span>{node.label}</span>
                        <span className="text-[10px] opacity-60 font-mono capitalize">
                          ({node.type})
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="absolute bottom-3 left-3 text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Interactive canvas ready for WebGL / ReactFlow expansion
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Entities List & Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Recognized Entities ({entities.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[460px] overflow-y-auto">
              {isEntitiesLoading ? (
                [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)
              ) : (
                entities.map((ent) => (
                  <div
                    key={ent.id}
                    onClick={() => setSelectedEntityId(ent.id)}
                    className={`flex items-start justify-between p-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                      selectedEntityId === ent.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded bg-muted text-muted-foreground mt-0.5">
                        {getEntityIcon(ent.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{ent.name}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {ent.description || ent.type}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      {ent.mention_count} mentions
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
