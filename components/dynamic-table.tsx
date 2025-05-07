"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, ArrowUpDown, Eye } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/pagination"
import { formatCellValue } from "@/lib/utils"
import type { ViewConfig, SortConfig, SortDirection } from "@/config/types"

interface DynamicTableProps {
  view: ViewConfig
  data: any[]
  isLoading?: boolean
  error?: Error | null
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  onPageChange?: (page: number) => void
  onSortChange?: (sort: SortConfig[]) => void
  onRowClick?: (id: string) => void
  className?: string
  hideFilters?: boolean
  hideSorts?: boolean
}

export function DynamicTable({
  view,
  data,
  isLoading = false,
  error = null,
  pagination = { page: 1, pageSize: 10, total: 0, totalPages: 1 },
  onPageChange = () => {},
  onSortChange,
  onRowClick,
  className = "",
  hideFilters = false,
  hideSorts = false,
}: DynamicTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig[]>(view.sort || [])
  const [currentColumns, setCurrentColumns] = useState(view.columns || [])

  // Update columns when view changes
  useEffect(() => {
    console.log("DynamicTable: View columns changed", view.columns)
    if (view.columns) {
      setCurrentColumns(view.columns)
    }
  }, [view.columns])

  // Handle sort click
  const handleSortClick = (field: string) => {
    // Find if this field is already in the sort config
    const existingIndex = sortConfig.findIndex((sort) => sort.field === field)

    let newSortConfig: SortConfig[]

    if (existingIndex >= 0) {
      // Field is already in sort config, toggle direction or remove
      const existingDirection = sortConfig[existingIndex].direction
      if (existingDirection === "asc") {
        // Change to desc
        newSortConfig = [...sortConfig]
        newSortConfig[existingIndex] = { ...newSortConfig[existingIndex], direction: "desc" }
      } else {
        // Remove from sort
        newSortConfig = sortConfig.filter((_, index) => index !== existingIndex)
      }
    } else {
      // Field is not in sort config, add it
      newSortConfig = [...sortConfig, { field, direction: "asc" }]
    }

    setSortConfig(newSortConfig)

    // Call onSortChange if provided
    if (onSortChange) {
      onSortChange(newSortConfig)
    }
  }

  // Get sort direction for a field
  const getSortDirection = (field: string): SortDirection | null => {
    const sort = sortConfig.find((s) => s.field === field)
    return sort ? sort.direction : null
  }

  // Render sort indicator
  const renderSortIndicator = (field: string) => {
    const direction = getSortDirection(field)
    if (!direction) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return direction === "asc" ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
  }

  // Handle row click
  const handleRowClick = (id: string) => {
    if (onRowClick) {
      onRowClick(id)
    }
  }

  // If there's an error, display it
  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>Error loading data: {error.message}</p>
      </div>
    )
  }

  // If there are no columns, display a message
  if (!currentColumns || currentColumns.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>No columns configured for this view.</p>
      </div>
    )
  }

  // Render loading skeleton
  if (isLoading) {
    return (
      <div>
        <Table className={className}>
          <TableHeader>
            <TableRow>
              {currentColumns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              {onRowClick && <TableHead className="w-[80px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {currentColumns.map((column) => (
                  <TableCell key={`${rowIndex}-${column.key}`}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
                {onRowClick && (
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  // If there's no data, display a message
  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>No data available.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table className={className}>
          <TableHeader>
            <TableRow>
              {currentColumns.map((column) => (
                <TableHead key={column.key}>
                  {!hideSorts ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSortClick(column.field)}
                      className="flex items-center p-0 h-auto font-medium"
                    >
                      {column.label}
                      {renderSortIndicator(column.field)}
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
              {onRowClick && <TableHead className="w-[80px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={row.id || rowIndex} className="hover:bg-muted/50">
                {currentColumns.map((column) => (
                  <TableCell key={`${row.id || rowIndex}-${column.key}`}>
                    {formatCellValue(row[column.field], column.type)}
                  </TableCell>
                ))}
                {onRowClick && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRowClick(row.id)
                      }}
                      className="h-8 w-8 p-0"
                      aria-label="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          totalItems={pagination.total}
          pageSize={pagination.pageSize}
        />
      </div>
    </div>
  )
}
