"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { EntityDetails } from "@/components/entity-details"
import { RelatedEntitiesPanel } from "@/components/related-entities-panel"
import { PhaseDetailsPanel } from "@/components/phase-details-panel"
import { ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import type { ViewConfig, RelatedEntityConfig } from "@/config/types"
import { EntityPreviewPanel } from "@/components/entity-preview-panel"
import { getMockData } from "@/lib/mock-data"

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
  const [isLoading, setIsLoading] = useState(true)
  const [entity, setEntity] = useState<any>(null)
  const [error, setError] = useState<Error | null>(null)

  // Add state for the preview panel
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewEntityId, setPreviewEntityId] = useState<string | null>(null)
  const [previewEntityType, setPreviewEntityType] = useState<string>("")

  // Load entity data
  useEffect(() => {
    if (!entityId || !entityType) {
      setError(new Error("Missing entity ID or type"))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Use getMockData to fetch the entity data
      const data = getMockData(entityType, entityId)

      if (data && data.length > 0) {
        setEntity(data[0])
      } else {
        setError(new Error(`No ${entityType} found with ID ${entityId}`))
      }
    } catch (err) {
      console.error("Error loading entity data:", err)
      setError(err instanceof Error ? err : new Error("Failed to load entity data"))
    } finally {
      setIsLoading(false)
    }
  }, [entityId, entityType])

  // Handle scrolling to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
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
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          {showBackButton && <Skeleton className="h-10 w-24" />}
          <Skeleton className="h-8 w-64" />
          {showFullDetailsButton && <Skeleton className="h-10 w-32" />}
        </div>

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

  // Handle error state
  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading entity: {error.message}</p>
          {showBackButton && onBack && (
            <Button variant="outline" onClick={onBack} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // Handle no data state
  if (!entity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">The requested entity was not found.</p>
          <p className="text-muted-foreground mt-2">Entity ID: {entityId}</p>
          <p className="text-muted-foreground mt-2">Entity Type: {entityType}</p>
          {showBackButton && onBack && (
            <Button variant="outline" onClick={onBack} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // Get the related entities configuration
  const relatedEntities = viewConfig.detailsConfig?.relatedEntities || []

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
              <ExternalLink className="mr-1 h-3 w-3" /> View Full Details
            </Button>
          </Link>
        </div>
      )}

      {/* Entity details section */}
      <div id="details" className="scroll-mt-20">
        <EntityDetails
          entity={entity}
          primaryFields={viewConfig.detailsConfig?.primaryFields || []}
          entityType={entityType}
        />
      </div>

      {/* Navigation tabs as anchor links */}
      {relatedEntities.length > 0 && (
        <div className="sticky top-16 z-50 bg-background pt-2 pb-2 border-b shadow-md">
          <Tabs value={activeSection} onValueChange={handleTabChange}>
            <TabsList className="mb-0">
              {relatedEntities.map((relatedEntity) => (
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
        {relatedEntities.map((relatedEntity) => (
          <div key={relatedEntity.id} id={relatedEntity.id} className="scroll-mt-20">
            {isNestedObjectPanel(relatedEntity) ? (
              <PhaseDetailsPanel config={relatedEntity} data={entity} />
            ) : (
              <RelatedEntitiesPanel
                config={relatedEntity}
                parentEntity={entity}
                parentEntityType={entityType}
                onPreviewClick={handlePreviewClick}
              />
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
