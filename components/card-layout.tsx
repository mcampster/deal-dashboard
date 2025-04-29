"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { EntityAvatar } from "@/components/entity-avatar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EntityPreviewPanel } from "@/components/entity-preview-panel"
import type { ViewConfig, CardConfig } from "@/config/types"

interface CardLayoutProps {
  view: ViewConfig
  data?: any[] // Make data optional
  pagination?: {
    // Make pagination optional
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  isLoading?: boolean // Make isLoading optional
  onPageChange?: (page: number) => void // Make onPageChange optional
  onPreviewClick?: (entityId: string) => void // Make onPreviewClick optional
}

export function CardLayout({
  view,
  data = [], // Default empty array
  pagination = { page: 1, pageSize: 10, total: 0, totalPages: 1 }, // Default pagination
  isLoading = false, // Default to not loading
  onPageChange = () => {}, // Default no-op function
  onPreviewClick = () => {}, // Default no-op function
}: CardLayoutProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewEntityId, setPreviewEntityId] = useState<string | null>(null)

  // Log the view and cardConfig for debugging
  useEffect(() => {
    console.log("CardLayout: View config:", view.id, view.label)
    console.log("CardLayout: Card config:", view.cardConfig)
  }, [view])

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

  // Handle preview click
  const handlePreviewClick = (entityId: string) => {
    setPreviewEntityId(entityId)
    setPreviewOpen(true)
    onPreviewClick(entityId)
  }

  // Handle closing the preview panel
  const handlePreviewClose = () => {
    setPreviewOpen(false)
    // Clear the entity ID when closing
    setTimeout(() => {
      setPreviewEntityId(null)
    }, 300)
  }

  // Handle loading state
  if (isLoading) {
    return <CardLayoutSkeleton />
  }

  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : []

  // Use the cardConfig if available, otherwise fall back to using columns
  const cardConfig = view.cardConfig || generateCardConfigFromColumns(view)

  // Log the effective card config being used
  console.log("CardLayout: Effective card config:", cardConfig)

  // Get the primary field for the title
  const getPrimaryField = (item: any) => {
    if (cardConfig.primaryField) {
      return item[cardConfig.primaryField] || "Unnamed"
    }

    // Fall back to first column if no primaryField is specified
    if (!view.columns || view.columns.length === 0) return "Unnamed"
    const primaryField = view.columns[0].field
    return item[primaryField] || "Unnamed"
  }

  // Get the secondary field for the subtitle
  const getSecondaryField = (item: any) => {
    if (cardConfig.secondaryField) {
      return item[cardConfig.secondaryField] || null
    }

    // Fall back to second column if no secondaryField is specified
    if (!view.columns || view.columns.length < 2) return null
    const secondaryField = view.columns[1].field
    return item[secondaryField] || null
  }

  // Get the detail fields for the card body
  const getDetailFields = (item: any) => {
    if (cardConfig.detailFields && cardConfig.detailFields.length > 0) {
      return cardConfig.detailFields.map((field) => {
        // Find the column config for this field to get the label
        const column = view.columns?.find((col) => col.field === field)
        return {
          key: field,
          label: column?.label || field,
          field: field,
          value: item[field] || "—",
        }
      })
    }

    // Fall back to remaining columns if no detailFields are specified
    if (!view.columns || view.columns.length < 3) return []
    return view.columns.slice(2).map((column) => ({
      key: column.key,
      label: column.label,
      field: column.field,
      value: item[column.field] || "—",
    }))
  }

  // Determine the grid columns based on cardConfig
  const gridColumns = cardConfig.gridColumns || 3
  const gridClass = `grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(gridColumns, 4)}`

  // Determine card size class based on cardConfig
  const getCardSizeClass = () => {
    switch (cardConfig.cardSize) {
      case "small":
        return "max-w-sm"
      case "large":
        return "max-w-xl"
      case "medium":
      default:
        return "max-w-md"
    }
  }

  // Determine layout class based on cardConfig
  const layoutClass = cardConfig.layout === "list" ? "flex flex-col space-y-4" : `grid ${gridClass} gap-4`

  return (
    <div className="space-y-4">
      <div className={layoutClass}>
        {safeData.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No results found.</p>
            </CardContent>
          </Card>
        ) : (
          safeData.map((item) => (
            <Card
              key={item.id}
              className={`overflow-hidden ${getCardSizeClass()} ${cardConfig.layout === "list" ? "w-full" : ""}`}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-3">
                  <EntityAvatar
                    entity={(view.entity || "deal") as "client" | "contact" | "deal" | "activity"}
                    name={getPrimaryField(item)}
                    phase={item.phase}
                    value={item.value}
                    size="md"
                  />
                  <div>
                    <CardTitle className="text-base">
                      <Link href={getEntityDetailRoute(item.id)} className="hover:underline text-primary">
                        {getPrimaryField(item)}
                      </Link>
                    </CardTitle>
                    {getSecondaryField(item) && (
                      <p className="text-sm text-muted-foreground">{getSecondaryField(item)}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {getDetailFields(item).map((detail) => (
                    <div key={detail.key} className="text-sm">
                      <span className="text-muted-foreground">{detail.label}: </span>
                      <span>{detail.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewClick(item.id.toString())}
                    className="mr-2"
                  >
                    Preview
                  </Button>
                  <Button variant="default" size="sm" asChild>
                    <Link href={getEntityDetailRoute(item.id)}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
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

      {/* Preview panel */}
      <EntityPreviewPanel
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        entityId={previewEntityId}
        entityType={view.entity || ""}
      />
    </div>
  )
}

// Helper function to generate a CardConfig from columns for backward compatibility
function generateCardConfigFromColumns(view: ViewConfig): CardConfig {
  if (!view.columns || view.columns.length === 0) {
    return {
      primaryField: "name",
      gridColumns: 3,
      layout: "grid",
      cardSize: "medium",
      detailFields: [],
    }
  }

  return {
    primaryField: view.columns[0].field,
    secondaryField: view.columns.length > 1 ? view.columns[1].field : undefined,
    detailFields: view.columns.length > 2 ? view.columns.slice(2).map((col) => col.field) : [],
    gridColumns: 3,
    layout: "grid",
    cardSize: "medium",
  }
}

function CardLayoutSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
