import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FileText,
  Search as SearchIcon,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { useAppStore } from '@/app/store'
import { useSearch } from '@/hooks/queries'
import { Badge } from '@/components/ui/badge'

export function SearchPalette() {
  const navigate = useNavigate()
  const { caseId: paramCaseId } = useParams<{ caseId?: string }>()
  const activeCaseId = useAppStore((s) => s.activeCaseId)
  const currentCaseId = paramCaseId || activeCaseId || 'case-001'

  const searchOpen = useAppStore((s) => s.searchOpen)
  const setSearchOpen = useAppStore((s) => s.setSearchOpen)
  const [query, setQuery] = useState('')

  const { data: searchData, isLoading } = useSearch(currentCaseId, query)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen(!searchOpen)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [searchOpen, setSearchOpen])

  const handleSelect = (evidenceId: string) => {
    setSearchOpen(false)
    navigate(`/cases/${currentCaseId}/evidence/${evidenceId}`)
  }

  return (
    <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
      <CommandInput
        placeholder="Type to search evidence, snippets, transcripts..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading && (
          <div className="flex items-center justify-center p-6 text-sm text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Searching evidence...
          </div>
        )}

        {!isLoading && query.length < 2 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Type at least 2 characters to search across case files and transcripts.
          </div>
        )}

        {!isLoading && query.length >= 2 && (!searchData || searchData.items.length === 0) && (
          <CommandEmpty>No evidence matches your search.</CommandEmpty>
        )}

        {searchData && searchData.items.length > 0 && (
          <CommandGroup heading="Evidence Matches">
            {searchData.items.map((result) => (
              <CommandItem
                key={result.chunk_id}
                onSelect={() => handleSelect(result.evidence_id)}
                className="flex flex-col items-start gap-1 p-2.5 cursor-pointer"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-xs">
                      {result.evidence_filename}
                    </span>
                    {result.page && (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                        p. {result.page}
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Score: {(result.score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {result.content}
                </p>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Quick Navigation">
          <CommandItem
            onSelect={() => {
              setSearchOpen(false)
              navigate(`/cases/${currentCaseId}/evidence`)
            }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span>Browse All Evidence</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
