"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { EntityDetailsContent } from "@/components/entity-details-content"
import { EntityAvatar } from "@/components/entity-avatar"
import { ViewMetadata } from "@/components/view-metadata"
import { QuickFilterBar } from "@/components/quick-filter-bar"
import { LayoutToggle } from "@/components/layout-toggle"
import { DynamicTable } from "@/components/dynamic-table"
import type { ViewConfig, FilterState } from "@/config/types"

interface MasterDetailsViewProps {
  view: ViewConfig
  data?: any[] // Make data optional with default
  isLoading?: boolean // Make isLoading optional with default
  error?: Error | null // Make error optional with default
  pagination?: {
    // Make pagination optional with default
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  onPageChange?: (page: number) => void // Make onPageChange optional with default
}

interface CardLayoutProps {
  view: ViewConfig
  data: any[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  isLoading: boolean
  onPageChange: (page: number) => void
  onPreviewClick: (id: string) => void
}

function CardLayout({ view, data, pagination, isLoading, onPageChange, onPreviewClick }: CardLayoutProps) {
  return (
    <div>
      {/* Implement your card layout here */}
      {data.map((item) => (
        <Card key={item.id} className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <EntityAvatar
                entity={(view.entity || "deal") as "client" | "contact" | "deal" | "activity"}
                name={
                  typeof item[view.columns?.[0]?.field || "name"] === "string"
                    ? item[view.columns?.[0]?.field || "name"]
                    : String(item[view.columns?.[0]?.field || "name"] || "")
                }
                stage={item.stage}
                value={item.value}
                size="sm"
              />
              <div>
                <h3 className="text-lg font-semibold">{item[view.columns?.[0]?.field || "name"]}</h3>
                {view.columns && view.columns.length > 1 && (
                  <p className="text-sm text-muted-foreground">{item[view.columns[1]?.field || ""]}</p>
                )}
              </div>
            </div>
            <button onClick={() => onPreviewClick(item.id.toString())} className="mt-4">
              View Details
            </button>
          </CardContent>
        </Card>
      ))}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.page || 1}
            totalPages={pagination.totalPages || 1}
            onPageChange={onPageChange || (() => {})}
            totalItems={pagination.total || 0}
          />
        </div>
      )}
    </div>
  )
}

export function MasterDetailsView({
  view,
  data = [],
  isLoading = false,
  error = null,
  pagination = { page: 1, pageSize: 10, total: 0, totalPages: 1 },
  onPageChange = () => {},
}: MasterDetailsViewProps) {
  // Store selectedEntityId as a string to ensure consistent type handling
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  const [quickFilters, setQuickFilters] = useState<FilterState>({})
  const [layout, setLayout] = useState<"table" | "card" | "master-details">("master-details")

  // Debug effect to track selectedEntityId changes
  useEffect(() => {
    console.log(`[MasterDetailsView] Selected entity ID changed to: ${selectedEntityId}`)
  }, [selectedEntityId])

  // Combine view filters with quick filters
  const combinedFilters = (() => {
    const viewFilters: FilterState = {}

    // Convert view.filters array to FilterState object
    if (view.filters) {
      view.filters.forEach((filter) => {
        viewFilters[filter.field] = {
          operator: filter.operator,
          value: filter.value,
        }
      })
    }

    // Merge with quick filters (quick filters take precedence)
    return { ...viewFilters, ...quickFilters }
  })()

  // Select the first entity when data loads or changes, but only if no selection exists
  useEffect(() => {
    if (data && data.length > 0 && !selectedEntityId) {
      const firstItemId = String(data[0].id)
      console.log(`[MasterDetailsView] Setting selected entity ID to first item: ${firstItemId}`)
      setSelectedEntityId(firstItemId)
    } else if (data.length === 0 && selectedEntityId !== null) {
      // Clear selection if data is empty
      console.log(`[MasterDetailsView] Clearing selected entity ID as data is empty`)
      setSelectedEntityId(null)
    }
    // Only run this effect when data changes or when selectedEntityId is null
  }, [data, selectedEntityId])

  // Handle filter changes from the quick filter bar
  const handleFilterChange = (newFilters: FilterState) => {
    setQuickFilters(newFilters)
    // Reset selected entity when filters change - will be set to first item in useEffect
    setSelectedEntityId(null)
  }

  // Handle layout change
  const handleLayoutChange = (newLayout: "table" | "card" | "master-details") => {
    setLayout(newLayout)
  }

  // If layout is not master-details, render the appropriate view
  if (layout !== "master-details") {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1">
            <QuickFilterBar
              columns={view.columns || []}
              onFilterChange={handleFilterChange}
              currentFilters={quickFilters}
              view={view}
            />
          </div>
          <div className="flex-shrink-0">
            <LayoutToggle
              layout={layout}
              onLayoutChange={handleLayoutChange}
              availableLayouts={["table", "card", "master-details"]}
            />
          </div>
        </div>

        {layout === "table" ? (
          <Card>
            <CardContent className="p-6">
              <DynamicTable view={view} />
            </CardContent>
          </Card>
        ) : (
          <CardLayout
            view={view}
            data={data}
            pagination={pagination}
            isLoading={isLoading}
            onPageChange={onPageChange}
            onPreviewClick={(id) => {
              setSelectedEntityId(id)
              setLayout("master-details")
            }}
          />
        )}
      </div>
    )
  }

  // Render the master-details view
  return (
    <div className="flex flex-col h-full">
      {/* Display view metadata (filters, sorts, limits) */}
      {view.filters && view.filters.length > 0 && (
        <div className="mb-2">
          <ViewMetadata view={view} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Master list (left side) */}
        <div className="md:col-span-1 h-full">
          <Card className="h-full flex flex-col">
            <CardContent className="p-4 flex-1 overflow-auto">
              {isLoading ? (
                <MasterListSkeleton />
              ) : error ? (
                <div className="p-4 text-destructive">Error loading data: {error.message}</div>
              ) : data.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No results found.</div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-auto">
                    <Table className="compact-table">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]"></TableHead>
                          <TableHead>{view.columns?.[0]?.label || "Name"}</TableHead>
                          {view.columns && view.columns.length > 1 && <TableHead>{view.columns[1]?.label}</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((item) => {
                          // Convert IDs to strings for consistent comparison
                          const itemId = String(item.id)
                          const isSelected = selectedEntityId === itemId

                          return (
                            <TableRow
                              key={itemId}
                              className={`cursor-pointer ${isSelected ? "bg-muted" : ""}`}
                              onClick={() => {
                                console.log(`[MasterDetailsView] Setting selected entity ID to: ${itemId}`)
                                setSelectedEntityId(itemId)
                              }}
                            >
                              <TableCell>
                                <EntityAvatar
                                  entity={(view.entity || "deal") as "client" | "contact" | "deal" | "activity"}
                                  name={
                                    typeof item[view.columns?.[0]?.field || "name"] === "string"
                                      ? item[view.columns?.[0]?.field || "name"]
                                      : String(item[view.columns?.[0]?.field || "name"] || "")
                                  }
                                  stage={item.stage}
                                  value={item.value}
                                  size="sm"
                                />
                              </TableCell>
                              <TableCell className="font-medium">{item[view.columns?.[0]?.field || "name"]}</TableCell>
                              {view.columns && view.columns.length > 1 && (
                                <TableCell className="text-muted-foreground text-sm">
                                  {item[view.columns[1]?.field || ""]}
                                </TableCell>
                              )}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  {pagination && pagination.totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={onPageChange}
                        totalItems={pagination.total}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details view (right side) */}
        <div className="md:col-span-2 h-full">
          <Card className="h-full overflow-auto">
            <CardContent className="p-6">
              {selectedEntityId ? (
                <EntityDetailsContent
                  key={`details-${selectedEntityId}`} // Add key to force re-render when ID changes
                  viewConfig={
                    view.detailsConfig?.viewConfig || {
                      id: `${view.id}-details`,
                      label: `${view.label} Details`,
                      icon: view.icon,
                      description: `Details for ${view.label}`,
                      type: "details",
                      entity: view.entity || "",
                      actions: [],
                      detailsConfig: {
                        primaryFields: view.columns?.map((col) => col.field) || [],
                      },
                    }
                  }
                  entityId={selectedEntityId}
                  entityType={view.entity || ""}
                  showBackButton={false}
                  showFullDetailsButton={true}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {isLoading ? (
                    <Skeleton className="h-[400px] w-full" />
                  ) : (
                    <p>Select an item from the list to view details</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MasterListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[160px]" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[160px]" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[160px]" />
        </div>
      </div>
    </div>
  )
}
