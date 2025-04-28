"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/pagination"
import { iconMap } from "@/config/icons"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ColumnConfig, ViewConfig } from "@/config/types"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { EntityAvatar } from "@/components/entity-avatar"
import { CustomPreviewPanel } from "@/components/custom-preview-panel"
import { useHotkeys } from "@/hooks/use-hotkeys-hook"
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help"
import { ActiveFilters } from "@/components/active-filters"
import { ActiveSorts } from "@/components/active-sorts"

export interface DynamicTableProps {
  view: ViewConfig | null
  data?: any[]
  isLoading?: boolean
  error?: Error | null
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  onPageChange?: (page: number) => void
  onRowClick?: (row: any) => void
  className?: string
  hideFilters?: boolean
  hideSorts?: boolean
}

// Update the DynamicTable component to include keyboard shortcuts
export function DynamicTable({
  view,
  data = [], // Provide default empty array
  isLoading = false, // Default to not loading
  error = null, // Default to no error
  pagination = { page: 1, pageSize: 10, total: 0, totalPages: 1 }, // Provide default pagination
  onPageChange = () => {}, // Default no-op function
  onRowClick,
  className = "",
  hideFilters = false,
  hideSorts = false,
}: DynamicTableProps) {
  const router = useRouter() // Add router
  // Add state for the preview panel
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewEntityId, setPreviewEntityId] = useState<string | null>(null)
  // Add state for tracking the focused row
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1)
  // Create a ref to store dropdown trigger buttons
  const actionButtonRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Check if we have columns to display
  const hasColumns = useMemo(() => {
    return view?.columns && view.columns.length > 0
  }, [view?.columns])

  const hasFilters = useMemo(() => {
    return view?.filters && view.filters.length > 0
  }, [view?.filters])

  const hasSorts = useMemo(() => {
    return view?.sort && view.sort.length > 0
  }, [view?.sort])

  const hasLimit = useMemo(() => {
    return view?.limit !== undefined
  }, [view?.limit])

  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : []

  // Initialize the refs array when data changes
  useEffect(() => {
    actionButtonRefs.current = actionButtonRefs.current.slice(0, safeData.length)
  }, [data, safeData.length])

  // Handle keyboard navigation
  useHotkeys(
    "up",
    (e) => {
      e.preventDefault()
      setFocusedRowIndex((prev) => Math.max(0, prev - 1))
    },
    { enableOnFormTags: true },
  )

  useHotkeys(
    "down",
    (e) => {
      e.preventDefault()
      setFocusedRowIndex((prev) => Math.min(safeData.length - 1, prev + 1))
    },
    { enableOnFormTags: true },
  )

  // Hotkey to open actions menu (Alt+A)
  useHotkeys(
    "alt+a",
    (e) => {
      e.preventDefault()
      if (focusedRowIndex >= 0 && focusedRowIndex < safeData.length) {
        const button = actionButtonRefs.current[focusedRowIndex]
        if (button) {
          button.click()
        }
      }
    },
    { enableOnFormTags: true },
  )

  // Hotkey to preview (Alt+P)
  useHotkeys(
    "alt+p",
    (e) => {
      e.preventDefault()
      if (focusedRowIndex >= 0 && focusedRowIndex < safeData.length) {
        handlePreviewClick(safeData[focusedRowIndex].id.toString())
      }
    },
    { enableOnFormTags: true },
  )

  // Update the Alt+V hotkey to use router.push instead of window.location.href
  useHotkeys(
    "alt+v",
    (e) => {
      e.preventDefault()
      if (focusedRowIndex >= 0 && focusedRowIndex < safeData.length) {
        const detailsUrl = getEntityDetailRoute(safeData[focusedRowIndex].id)
        router.push(detailsUrl)
      }
    },
    { enableOnFormTags: true },
  )

  // Get the route for the entity detail page
  const getEntityDetailRoute = (entityId: string) => {
    if (!view?.entity) return "#"

    switch (view.entity) {
      case "deals":
        return `/deals/details?id=${entityId}`
      case "contacts":
        return `/contacts/details?id=${entityId}`
      case "clients":
        return `/clients/details?id=${entityId}`
      case "activities":
        return `/activities/details?id=${entityId}`
      default:
        return `/${view.entity}/details?id=${entityId}`
    }
  }

  // Ensure we have columns to display
  if (!hasColumns) {
    return (
      <div className="rounded-md border border-muted p-6 text-center">
        <p className="text-muted-foreground">No columns configured for this view.</p>
      </div>
    )
  }

  // Handle loading state
  if (isLoading && (!data || data.length === 0)) {
    return <TableSkeleton columns={(view.columns || []).length} />
  }

  // Handle error state
  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-destructive">Error loading data: {error.message}</p>
      </div>
    )
  }

  // Add a function to handle preview click
  const handlePreviewClick = (entityId: string) => {
    setPreviewEntityId(entityId)
    setPreviewOpen(true)
  }

  // Add a function to handle closing the preview panel
  const handlePreviewClose = () => {
    setPreviewOpen(false)
    // Clear the entity ID when closing
    setTimeout(() => {
      setPreviewEntityId(null)
    }, 300)
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Display view metadata (filters, sorts, limits) if not hidden */}
      {!hideFilters && hasFilters && (
        <div className="mb-2">
          <ActiveFilters filters={view.filters || []} onRemove={() => {}} />
        </div>
      )}

      {!hideSorts && hasSorts && (
        <div className="mb-2">
          <ActiveSorts sorts={view.sort || []} onRemove={() => {}} />
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div className="mb-2 flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          Use ↑/↓ to navigate, Alt+A for actions, Alt+P to preview, Alt+V to view details
        </div>
        <KeyboardShortcutsHelp />
      </div>

      <div className="rounded-md border flex-1 overflow-auto compact-table">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Add avatar column */}
              <TableHead className="w-[60px]"></TableHead>
              {view.columns && view.columns.map((column) => <TableHead key={column.key}>{column.label}</TableHead>)}
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={(view.columns?.length || 0) + 2} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              safeData.map((row: any, rowIndex) => (
                <TableRow
                  key={row.id}
                  className={rowIndex === focusedRowIndex ? "bg-muted" : ""}
                  onClick={() => setFocusedRowIndex(rowIndex)}
                  tabIndex={0}
                >
                  {/* Avatar cell */}
                  <TableCell>
                    <EntityAvatar
                      entity={(view.entity || "deal") as "client" | "contact" | "deal" | "activity"}
                      name={
                        view.columns && typeof row[view.columns[0]?.field] === "string"
                          ? row[view.columns[0]?.field]
                          : String(row[view.columns?.[0]?.field || ""] || "")
                      }
                      phase={row.phase}
                      value={row.value}
                      size="sm"
                    />
                  </TableCell>
                  {view.columns &&
                    view.columns.map((column, index) => (
                      <TableCell key={`${row.id}-${column.key}`}>
                        {index === 0 ? (
                          <Link href={getEntityDetailRoute(row.id)} className="text-primary hover:underline">
                            {renderCellContent(row[column.field], column)}
                          </Link>
                        ) : (
                          renderCellContent(row[column.field], column)
                        )}
                      </TableCell>
                    ))}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          ref={(el) => (actionButtonRefs.current[rowIndex] = el)}
                          aria-label={`Actions for ${row.name || row.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreviewClick(row.id.toString())}>
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={getEntityDetailRoute(row.id)}>View</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-2">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
            totalItems={pagination.total}
          />
        </div>
      )}

      {/* Use our new custom preview panel */}
      <CustomPreviewPanel
        open={previewOpen}
        onClose={handlePreviewClose}
        entityId={previewEntityId}
        entityType={view.entity || ""}
      />
    </div>
  )
}

// Update the renderCellContent function to handle array fields properly
function renderCellContent(value: any, column: ColumnConfig) {
  // Handle null or undefined values
  if (value === null || value === undefined) {
    return "—"
  }

  // Handle array values (like tags or competitors)
  if (Array.isArray(value)) {
    return value.join(", ")
  }

  // Format the cell content based on the column type
  switch (column.type) {
    case "date":
      return new Date(value).toLocaleDateString()
    case "email":
    case "phone":
    case "company":
    case "industry":
    case "location":
      if (column.icon && column.icon in iconMap) {
        const Icon = iconMap[column.icon as keyof typeof iconMap]
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {value}
          </div>
        )
      }
      return value
    case "currency":
      return value
    default:
      return value
  }
}

// Update the TableSkeleton function to include the Actions column
function TableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Avatar column skeleton */}
            <TableHead className="w-[60px]">
              <Skeleton className="h-6 w-6 rounded-full" />
            </TableHead>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-6 w-24" />
              </TableHead>
            ))}
            <TableHead className="w-[80px]">
              <Skeleton className="h-6 w-16" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {/* Avatar cell skeleton */}
              <TableCell>
                <Skeleton className="h-8 w-8 rounded-full" />
              </TableCell>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={`${rowIndex}-${colIndex}`}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
              <TableCell>
                <Skeleton className="h-8 w-8 rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
