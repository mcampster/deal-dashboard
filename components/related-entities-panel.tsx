"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/pagination"
import { Button } from "@/components/ui/button"
import { useViewData } from "@/hooks/use-view-data"
import { iconMap } from "@/config/icons"
import Link from "next/link"
import type { RelatedEntityConfig, FilterState } from "@/config/types"

// Add the imports for the dropdown menu and preview panel
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EntityPreviewPanel } from "@/components/entity-preview-panel"

interface RelatedEntitiesPanelProps {
  config: RelatedEntityConfig
  parentEntity: any
  parentEntityType: string
}

export function RelatedEntitiesPanel({ config, parentEntity, parentEntityType }: RelatedEntitiesPanelProps) {
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Add state for the preview panel inside the RelatedEntitiesPanel component
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewEntityId, setPreviewEntityId] = useState<string | null>(null)

  // Determine the correct relation value based on the relation field and parent entity
  const getRelationValue = () => {
    // If the relation field is directly on the parent entity, use that value
    if (config.relationField in parentEntity) {
      return parentEntity[config.relationField]
    }

    // Special case: if we're relating by company name instead of ID
    if (config.relationField === "company" && parentEntityType === "clients") {
      return parentEntity.name
    }

    // Special case for deal teams: relationField is dealId but parent is deal
    if (config.entity === "dealTeams" && config.relationField === "dealId" && parentEntityType === "deals") {
      // Ensure we're returning a number, as dealId is stored as a number in the mock data
      return Number(parentEntity.id)
    }

    // Default to using the parent entity's ID (ensure it's consistently typed)
    return parentEntity.id
  }

  // Memoize the filter to prevent it from changing on every render
  const relatedFilter = useMemo(() => {
    const relationValue = getRelationValue()

    const filter: FilterState = {
      [config.relationField]: {
        operator: "=",
        value: relationValue,
      },
    }

    // Add any additional filters from the config
    if (config.filters) {
      config.filters.forEach((configFilter) => {
        filter[configFilter.field] = {
          operator: configFilter.operator,
          value: configFilter.value,
        }
      })
    }

    // Debug info
    setDebugInfo({
      relationField: config.relationField,
      relationValue,
      parentEntityId: parentEntity.id,
      parentEntityType,
      filter,
    })

    return filter
  }, [config.relationField, config.filters, parentEntity, parentEntityType])

  // Create a minimal view config for the related entity
  const relatedViewConfig = {
    id: `related-${config.id}`,
    label: config.title,
    icon: "dashboard",
    description: "",
    type: "list" as const,
    entity: config.entity,
    columns: config.columns,
    actions: config.actions || [],
    filters: config.filters,
    sort: config.sort,
    limit: config.limit,
  }

  // Fetch the related entities
  const { data, isLoading, error, pagination } = useViewData({
    view: relatedViewConfig,
    filter: relatedFilter,
    pagination: { page, pageSize },
  })

  // Log debug info when data changes
  useEffect(() => {
    if (debugInfo) {
      console.log(`[RelatedEntitiesPanel] ${config.title} filter:`, debugInfo)
      console.log(`[RelatedEntitiesPanel] ${config.title} data:`, data)

      // Add more detailed logging to help diagnose the issue
      if (config.entity === "dealTeams") {
        console.log(`[RelatedEntitiesPanel] Parent Deal ID:`, parentEntity.id, `(${typeof parentEntity.id})`)
        console.log(
          `[RelatedEntitiesPanel] Filter value for dealId:`,
          debugInfo.relationValue,
          `(${typeof debugInfo.relationValue})`,
        )

        // Log the first few items from mockDatabase.dealTeams to see what we're filtering against
        const dealTeams = (window as any).mockDatabase?.dealTeams || []
        console.log(
          `[RelatedEntitiesPanel] First 3 deal team items from database:`,
          dealTeams.slice(0, 3).map((team: any) => ({
            id: team.id,
            dealId: team.dealId,
            name: team.name,
          })),
        )
      }
    }
  }, [data, debugInfo, config.title, config.entity, parentEntity.id])

  // Handle loading state
  if (isLoading) {
    return <RelatedEntitiesSkeleton />
  }

  // Handle error state
  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading related entities: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  // Format cell content based on column type
  const formatCellContent = (value: any, columnKey: string) => {
    if (value === undefined || value === null) return "N/A"

    const column = config.columns.find((col) => col.field === columnKey)
    if (!column) return value

    // Handle different column types
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

  // Get the route for the entity detail page
  const getEntityDetailRoute = (entityId: string) => {
    switch (config.entity) {
      case "deals":
        return `/deals/details?id=${entityId}`
      case "contacts":
        return `/contacts/details?id=${entityId}`
      case "clients":
        return `/clients/details?id=${entityId}`
      default:
        return `/${config.entity}/details?id=${entityId}`
    }
  }

  // Add a function to handle preview click
  const handlePreviewClick = (entityId: string) => {
    setPreviewEntityId(entityId)
    setPreviewOpen(true)
  }

  // Add a function to handle closing the preview panel
  const handlePreviewClose = (open: boolean) => {
    setPreviewOpen(open)
    if (!open) {
      // Clear the entity ID when closing to ensure clean state
      setTimeout(() => {
        setPreviewEntityId(null)
      }, 300) // Small delay to ensure animations complete
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No related {config.title.toLowerCase()} found.</p>
        ) : (
          <>
            <div className="rounded-md border overflow-hidden compact-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    {config.columns.map((column) => (
                      <TableHead key={column.key}>{column.label}</TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item: any) => (
                    <TableRow key={item.id}>
                      {config.columns.map((column) => (
                        <TableCell key={`${item.id}-${column.key}`}>
                          {column.key === "name" || column.key === config.columns[0].key ? (
                            <Link href={getEntityDetailRoute(item.id)} className="text-primary hover:underline">
                              {formatCellContent(item[column.field], column.field)}
                            </Link>
                          ) : (
                            formatCellContent(item[column.field], column.field)
                          )}
                        </TableCell>
                      ))}
                      {/* Update the Actions column in the table to include the dropdown menu */}
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handlePreviewClick(item.id.toString())}>
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={getEntityDetailRoute(item.id)}>View</Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Link href={getEntityDetailRoute(item.id)}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                  totalItems={pagination.total}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
      {/* Add the EntityPreviewPanel at the end of the component's return statement */}
      <EntityPreviewPanel
        open={previewOpen}
        onOpenChange={handlePreviewClose}
        entityId={previewEntityId}
        entityType={config.entity}
      />
    </Card>
  )
}

function RelatedEntitiesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: 4 }).map((_, colIndex) => (
                    <TableCell key={`${rowIndex}-${colIndex}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
