"use client"

import { useState, useRef, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { EntityDetails } from "@/components/entity-details"
import { RelatedEntitiesPanel } from "@/components/related-entities-panel"
import { PhaseDetailsPanel } from "@/components/phase-details-panel"
import { useViewData } from "@/hooks/use-view-data"
import Link from "next/link"
import type { ViewConfig, RelatedEntityConfig } from "@/config/types"
import { EntityPreviewPanel } from "@/components/entity-preview-panel"
import { ArrowLeft } from "lucide-react"

interface EntityDetailsContentProps {
  viewConfig: ViewConfig
  entityId: string | number
  entityType: string
  showBackButton?: boolean
  onBack?: () => void
  showFullDetailsButton?: boolean
  className?: string
}

export function EntityDetailsContent({
  viewConfig,
  entityId,
  entityType,
  showBackButton = false,
  onBack,
  showFullDetailsButton = false,
  className = "",
}: EntityDetailsContentProps) {
  const [activeSection, setActiveSection] = useState<string>("details")

  // Add state for the preview panel
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewEntityId, setPreviewEntityId] = useState<string | null>(null)
  const [previewEntityType, setPreviewEntityType] = useState<string>("")

  // Create refs for each section
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({
    details: null,
  })

  // Enhanced memoized filter for the entity ID
  const entityFilter = useMemo(() => {
    // Don't try to create a filter if entityId is undefined/null/empty
    if (!entityId) {
      return {}
    }

    // Normalize the ID value - try to parse as number if it's a string and looks like a number
    let idValue: string | number = entityId
    if (typeof entityId === "string" && /^\d+$/.test(entityId)) {
      idValue = Number.parseInt(entityId, 10)
    }

    console.log(`Creating entity filter for ID: ${idValue} (${typeof idValue})`)

    return {
      id: {
        operator: "=",
        value: idValue,
      },
    }
  }, [entityId])

  // Determine which related entities need nested object data
  const relatedEntitiesConfig = viewConfig.detailsConfig?.relatedEntities || []

  // Determine if a related entity panel should be rendered as a nested object panel
  const isNestedObjectPanel = (config: RelatedEntityConfig): boolean => {
    // First check if renderType is explicitly specified
    if (config.renderType === "nested-object") {
      return true
    }

    // For backward compatibility, check if it's one of the phase details panels
    if (config.id === "origination-details" || config.id === "execution-details" || config.id === "closeout-details") {
      return true
    }

    return false
  }

  // Collect all nested object paths that need to be fetched
  const nestedObjectPaths = useMemo(() => {
    const paths: string[] = []

    relatedEntitiesConfig.forEach((config) => {
      if (isNestedObjectPanel(config)) {
        // Use the explicit path if provided, otherwise infer from the ID
        const path = config.nestedObjectPath || config.id.replace("-details", "")
        if (!paths.includes(path)) {
          paths.push(path)
        }
      }
    })

    return paths
  }, [relatedEntitiesConfig])

  // Memoize the fields to prevent them from changing on every render
  const fieldsToFetch = useMemo(() => {
    // Start with the primary fields
    const fields = viewConfig.detailsConfig?.primaryFields ? ["id", ...viewConfig.detailsConfig.primaryFields] : ["id"]

    // Add nested object paths for phase details panels
    nestedObjectPaths.forEach((path) => {
      if (!fields.includes(path)) {
        fields.push(path)
      }
    })

    return fields
    // Stringify the fields array to create a stable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(viewConfig.detailsConfig?.primaryFields), JSON.stringify(nestedObjectPaths)])

  // Fetch the entity data with explicit fields - use a stable reference for the view
  const stableViewRef = useRef(viewConfig)
  // Only update the ref if the view ID changes
  useEffect(() => {
    if (stableViewRef.current.id !== viewConfig.id) {
      stableViewRef.current = viewConfig
    }
  }, [viewConfig])

  const { data, isLoading, error } = useViewData({
    view: stableViewRef.current,
    filter: entityFilter,
    pagination: { page: 1, pageSize: 1 }, // We only need one entity
    fields: fieldsToFetch,
  })

  // After data is fetched, add a debug log to see what we got - but only once
  useEffect(() => {
    if (data && data.length > 0) {
      console.log(`[EntityDetailsContent] Entity data loaded for ID ${entityId}:`, JSON.stringify(data[0]))
    } else if (data && data.length === 0) {
      console.log(`[EntityDetailsContent] No entity data loaded for ID ${entityId}. Filter:`, entityFilter)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length > 0 ? data[0]?.id : "empty"]) // Only depend on whether we have data or not

  // Handle scrolling to section
  const scrollToSection = (sectionId: string) => {
    if (sectionRefs.current[sectionId]) {
      sectionRefs.current[sectionId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveSection(value)
    scrollToSection(value)
  }

  // Add a function to handle preview click
  const handlePreviewClick = (entityId: string, entityType: string) => {
    setPreviewEntityId(entityId)
    setPreviewEntityType(entityType)
    setPreviewOpen(true)
  }

  // Add a function to handle closing the preview panel
  const handlePreviewClose = (open: boolean) => {
    setPreviewOpen(open)
    if (!open) {
      // Clear the entity ID when closing to ensure clean state
      setTimeout(() => {
        setPreviewEntityId(null)
        setPreviewEntityType("")
      }, 300) // Small delay to ensure animations complete
    }
  }

  // Get the full details page URL
  const getFullDetailsUrl = () => {
    return `/${entityType}/details?id=${entityId}`
  }

  // Handle loading state
  if (isLoading) {
    return <EntityDetailsContentSkeleton />
  }

  // Handle error state
  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading entity: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  // Handle no data state
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">The requested entity was not found.</p>
          <p className="text-muted-foreground mt-2">Entity ID: {entityId}</p>
          <p className="text-muted-foreground mt-2">Entity Type: {entityType}</p>
        </CardContent>
      </Card>
    )
  }

  // Get the entity data
  const entity = data[0]

  // Get the related entities configuration
  const relatedEntities = viewConfig.detailsConfig?.relatedEntities || []

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Back button - only shown if requested */}
      {showBackButton && onBack && (
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      )}

      {/* Full details button - only shown if requested */}
      {showFullDetailsButton && (
        <div className="flex justify-end">
          <Link href={getFullDetailsUrl()}>
            <Button variant="outline" size="sm" className="text-xs h-8">
              View Full Details
            </Button>
          </Link>
        </div>
      )}

      {/* Entity details section */}
      <div id="details" ref={(el) => (sectionRefs.current.details = el)} className="scroll-mt-20">
        <EntityDetails
          entity={entity}
          primaryFields={viewConfig.detailsConfig?.primaryFields || []}
          entityType={entityType}
        />
      </div>

      {/* Navigation tabs as anchor links */}
      {relatedEntitiesConfig.length > 0 && (
        <div className="sticky top-16 z-50 bg-background pt-2 pb-2 border-b shadow-md">
          <Tabs value={activeSection} onValueChange={handleTabChange}>
            <TabsList className="mb-0">
              {relatedEntitiesConfig.map((relatedEntity) => (
                <TabsTrigger key={relatedEntity.id} value={relatedEntity.id}>
                  {relatedEntity.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Related entities sections */}
      <div className="grid grid-cols-1 gap-6">
        {relatedEntitiesConfig.map((relatedEntity) => (
          <div
            key={relatedEntity.id}
            id={relatedEntity.id}
            ref={(el) => (sectionRefs.current[relatedEntity.id] = el)}
            className="scroll-mt-20"
          >
            {isNestedObjectPanel(relatedEntity) ? (
              <PhaseDetailsPanel config={relatedEntity} data={entity} />
            ) : (
              <RelatedEntitiesPanel config={relatedEntity} parentEntity={entity} parentEntityType={entityType} />
            )}
          </div>
        ))}
      </div>

      {/* Preview panel for nested entities */}
      <EntityPreviewPanel
        open={previewOpen}
        onOpenChange={handlePreviewClose}
        entityId={previewEntityId}
        entityType={previewEntityType}
      />
    </div>
  )
}

function EntityDetailsContentSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-32" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
