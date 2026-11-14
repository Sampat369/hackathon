import React from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Scale,
  LayoutDashboard,
  FileSearch,
  MessageSquare,
  Clock,
  Network,
  AlertTriangle,
  Copy,
  FileText,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/app/store'
import { useCase } from '@/hooks/queries'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { caseId: paramCaseId } = useParams<{ caseId?: string }>()
  const activeCaseId = useAppStore((s) => s.activeCaseId)
  const currentCaseId = paramCaseId || activeCaseId || 'case-001'
  const { data: currentCase } = useCase(currentCaseId)

  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      to: '/cases',
      matchPrefix: false,
    },
    {
      label: 'Evidence',
      icon: FileSearch,
      to: `/cases/${currentCaseId}/evidence`,
      matchPrefix: true,
    },
    {
      label: 'Chat',
      icon: MessageSquare,
      to: `/cases/${currentCaseId}/chat`,
      matchPrefix: true,
    },
    {
      label: 'Timeline',
      icon: Clock,
      to: `/cases/${currentCaseId}/timeline`,
      matchPrefix: true,
    },
    {
      label: 'Entities',
      icon: Network,
      to: `/cases/${currentCaseId}/entities`,
      matchPrefix: true,
    },
    {
      label: 'Inconsistencies',
      icon: AlertTriangle,
      to: `/cases/${currentCaseId}/inconsistencies`,
      matchPrefix: true,
    },
    {
      label: 'Duplicates',
      icon: Copy,
      to: `/cases/${currentCaseId}/duplicates`,
      matchPrefix: true,
    },
    {
      label: 'Summary',
      icon: FileText,
      to: `/cases/${currentCaseId}/summary`,
      matchPrefix: true,
    },
  ]

  const isActive = (item: typeof navItems[0]) => {
    if (item.to === '/cases') {
      return location.pathname === '/cases' || location.pathname === '/'
    }
    return location.pathname.startsWith(item.to)
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-card transition-all duration-300 ease-in-out select-none',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-4 border-b">
        <Link to="/cases" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <Scale className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight tracking-tight text-primary">
                EvidenceIQ
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Legal Intelligence
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Case Switcher Card */}
      {!sidebarCollapsed ? (
        <div className="p-3 border-b bg-muted/30">
          <button
            onClick={() => navigate('/cases')}
            className="w-full text-left p-2.5 rounded-lg border bg-background hover:bg-accent/50 transition-colors flex items-center justify-between group shadow-xs"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="truncate">
                <p className="text-xs font-medium text-muted-foreground leading-none mb-1">
                  Active Case
                </p>
                <p className="text-sm font-semibold truncate leading-none">
                  {currentCase?.name || 'Harrison v. Meridian Corp'}
                </p>
              </div>
            </div>
          </button>
        </div>
      ) : (
        <div className="p-2 border-b flex justify-center">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate('/cases')}
                  className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                >
                  <Briefcase className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">{currentCase?.name || 'Active Case'}</p>
                <p className="text-xs text-muted-foreground">Click to switch</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        <TooltipProvider delayDuration={150}>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.to}
                      className={cn(
                        'flex h-10 w-10 mx-auto items-center justify-center rounded-lg text-sm font-medium transition-colors',
                        active
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <span>{item.label}</span>
                  </TooltipContent>
                </Tooltip>
              )
            }

            return (
              <Link
                key={item.label}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-white' : 'text-muted-foreground')} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </TooltipProvider>
      </nav>

      {/* Bottom Actions / Toggle */}
      <div className="p-2 border-t flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn('w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground', sidebarCollapsed && 'px-0')}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">Collapse sidebar</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
