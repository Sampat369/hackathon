import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Sun, Moon, Search, ChevronRight, User } from 'lucide-react'
import { useAppStore } from '@/app/store'
import { useCase } from '@/hooks/queries'
import { Button } from '@/components/ui/button'

export function TopBar() {
  const { caseId: paramCaseId } = useParams<{ caseId?: string }>()
  const activeCaseId = useAppStore((s) => s.activeCaseId)
  const currentCaseId = paramCaseId || activeCaseId || 'case-001'
  const { data: currentCase } = useCase(currentCaseId)

  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const toggleSearch = useAppStore((s) => s.toggleSearch)

  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-card px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          to="/cases"
          className="text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          Cases
        </Link>
        {currentCase && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground truncate max-w-xs md:max-w-md">
              {currentCase.name}
            </span>
          </>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Search button / trigger */}
        <button
          onClick={toggleSearch}
          className="flex h-9 w-64 items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm text-muted-foreground shadow-xs hover:border-primary/50 hover:text-foreground transition-all focus:outline-hidden"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Search evidence...</span>
          </div>
          <kbd className="pointer-events-none hidden select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="h-9 w-9"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-yellow-500 transition-all" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700 transition-all" />
          )}
        </Button>

        {/* User Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm">
          <User className="h-4 w-4" />
        </div>
      </div>
    </header>
  )
}
