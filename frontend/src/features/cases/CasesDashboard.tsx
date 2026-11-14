import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Briefcase,
  FileSearch,
  ArrowRight,
  Tag,
  Clock,
  LayoutGrid,
  List,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { useCases, useCreateCase, useUpdateCase, useDeleteCase } from '@/hooks/queries'
import { useAppStore } from '@/app/store'
import { formatRelative, formatDate, getStatusColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { Case } from '@/types'

export default function CasesDashboard() {
  const navigate = useNavigate()
  const setActiveCaseId = useAppStore((s) => s.setActiveCaseId)
  const { data, isLoading } = useCases()
  const createCase = useCreateCase()
  const updateCase = useUpdateCase()
  const deleteCase = useDeleteCase()

  // View mode: grid vs list
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Create Dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tagInput, setTagInput] = useState('')

  // Edit / Rename Dialog
  const [editingCase, setEditingCase] = useState<Case | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTagInput, setEditTagInput] = useState('')

  // Delete Alert Dialog
  const [deletingCase, setDeletingCase] = useState<Case | null>(null)

  const handleOpenCase = (caseId: string) => {
    setActiveCaseId(caseId)
    navigate(`/cases/${caseId}/evidence`)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      await createCase.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        tags,
      })
      toast.success('Case created successfully', {
        description: `Case "${name}" is now ready for evidence intake.`,
      })
      setName('')
      setDescription('')
      setTagInput('')
      setCreateOpen(false)
    } catch {
      toast.error('Failed to create case')
    }
  }

  const openEditModal = (c: Case) => {
    setEditingCase(c)
    setEditName(c.name)
    setEditDescription(c.description || '')
    setEditTagInput(c.tags?.join(', ') || '')
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCase || !editName.trim()) return

    const tags = editTagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      await updateCase.mutateAsync({
        id: editingCase.id,
        data: {
          name: editName.trim(),
          description: editDescription.trim(),
          tags,
        },
      })
      toast.success('Case updated', {
        description: `Changes to "${editName}" have been saved.`,
      })
      setEditingCase(null)
    } catch {
      toast.error('Failed to update case')
    }
  }

  const handleDelete = async () => {
    if (!deletingCase) return
    try {
      await deleteCase.mutateAsync(deletingCase.id)
      toast.success('Case deleted', {
        description: `Case "${deletingCase.name}" and associated records removed.`,
      })
      setDeletingCase(null)
    } catch {
      toast.error('Failed to delete case')
    }
  }

  const rawItems = data?.items || []
  const filteredCases = useMemo(() => {
    return rawItems.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus =
        statusFilter === 'all' ? true : c.processing_status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [rawItems, searchQuery, statusFilter])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Case Intelligence Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Cryptographically verified digital evidence management and forensic investigation registry.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-xs">
              <Plus className="h-4 w-4" />
              New Case
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Register New Investigation</DialogTitle>
                <DialogDescription>
                  Create an encrypted workspace for legal matter intake and evidence processing.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="case-name">Case Name / Caption</Label>
                  <Input
                    id="case-name"
                    placeholder="e.g., Anderson v. Acme Logistics"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="case-desc">Description / Scope of Matter</Label>
                  <Textarea
                    id="case-desc"
                    placeholder="Specify subject matter, relevant dates, and key legal questions..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="case-tags">Tags & Taxonomy (comma-separated)</Label>
                  <Input
                    id="case-tags"
                    placeholder="employment, trade-secrets, fraud, internal"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createCase.isPending}>
                  {createCase.isPending ? 'Registering...' : 'Register Case'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card p-3 rounded-lg border shadow-xs">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cases by title, description or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-md text-xs">
            {['all', 'ready', 'processing', 'queued'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center border rounded-md overflow-hidden bg-background">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Cases Content */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col justify-between">
              <CardHeader className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-16 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-1/2" />
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredCases.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="p-3 bg-muted rounded-full mb-3 text-muted-foreground">
            <Briefcase className="h-8 w-8" />
          </div>
          <h3 className="font-semibold text-lg">No cases found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            {searchQuery || statusFilter !== 'all'
              ? 'No cases match your filter criteria. Try clearing filters.'
              : 'You have not registered any cases yet. Create your first legal investigation to get started.'}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
              }}
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCases.map((c) => (
            <Card
              key={c.id}
              className="flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-primary/40 group"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-1">
                        {c.name}
                      </CardTitle>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {c.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize font-medium border ${getStatusColor(
                        c.processing_status
                      )}`}
                    >
                      {c.processing_status}
                    </Badge>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleOpenCase(c.id)} className="gap-2 text-xs">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open Case
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditModal(c)} className="gap-2 text-xs">
                          <Pencil className="h-3.5 w-3.5" />
                          Rename / Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingCase(c)}
                          className="gap-2 text-xs text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Case
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <CardDescription className="line-clamp-3 text-xs leading-relaxed min-h-[3rem]">
                  {c.description || 'No detailed scope recorded.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pb-3">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <FileSearch className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">
                      {c.evidence_count}
                    </span>{' '}
                    evidence items
                  </div>
                </div>

                {c.tags && c.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        <Tag className="h-2.5 w-2.5 opacity-60" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t bg-muted/10 p-4">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatRelative(c.updated_at)}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleOpenCase(c.id)}
                  className="gap-1.5 text-xs h-8"
                >
                  Open Case
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="rounded-md border bg-card shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Case Title & ID</th>
                <th className="py-3 px-4">Scope / Description</th>
                <th className="py-3 px-4">Evidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCases.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => handleOpenCase(c.id)}
                >
                  <td className="py-3.5 px-4 font-medium">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded bg-primary/10 text-primary">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-sm hover:underline">
                          {c.name}
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          {c.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-xs truncate">
                    {c.description || '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                      <FileSearch className="h-3.5 w-3.5 text-primary" />
                      {c.evidence_count} files
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize font-medium border ${getStatusColor(
                        c.processing_status
                      )}`}
                    >
                      {c.processing_status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-muted-foreground">
                    {formatRelative(c.updated_at)}
                  </td>
                  <td
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenCase(c.id)}
                        className="h-8 px-2.5 text-xs gap-1"
                      >
                        Open
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(c)} className="gap-2 text-xs">
                            <Pencil className="h-3.5 w-3.5" />
                            Rename / Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeletingCase(c)}
                            className="gap-2 text-xs text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Case
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Rename Case Dialog */}
      <Dialog
        open={!!editingCase}
        onOpenChange={(isOpen) => !isOpen && setEditingCase(null)}
      >
        <DialogContent>
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Case Details</DialogTitle>
              <DialogDescription>
                Update the case title, background information, or categorization tags.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-case-name">Case Name / Caption</Label>
                <Input
                  id="edit-case-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-case-desc">Description</Label>
                <Textarea
                  id="edit-case-desc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-case-tags">Tags (comma-separated)</Label>
                <Input
                  id="edit-case-tags"
                  value={editTagInput}
                  onChange={(e) => setEditTagInput(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCase(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateCase.isPending}>
                {updateCase.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!deletingCase}
        onOpenChange={(isOpen) => !isOpen && setDeletingCase(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertDialogTitle>Delete Case Investigation?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong className="text-foreground font-semibold">
                "{deletingCase?.name}"
              </strong>
              ? This will remove all associated evidence files, custody logs, timelines,
              and AI session history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingCase(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCase.isPending}
            >
              {deleteCase.isPending ? 'Deleting...' : 'Delete Case'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
