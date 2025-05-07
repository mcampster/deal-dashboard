"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getViewById } from "@/config/views"
import { EntityDetailsContent } from "@/components/entity-details-content"
import { viewsConfig } from "@/config/views"
import Link from "next/link"
import { getMockData } from "@/lib/mock-data"

interface EntityPreviewPanelProps {
  open: boolean
  onClose: () => void
  onOpenChange?: (open: boolean) => void
  entityId: string | null
  entityType: string
}

export function EntityPreviewPanel({ open, onClose, onOpenChange, entityId, entityType }: EntityPreviewPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [entityData, setEntityData] = useState<any>(null)

  // Get the appropriate details view config based on entity type
  const detailsViewConfig = useMemo(() => {
    if (!Array.isArray(viewsConfig)) return null

    // Try to get the specific details view for this entity type
    const viewId = `${entityType}-details`
    const view = getViewById(viewId)

    if (view) return view

    // If not found, look for any details view for this entity
    const fallbackViews = viewsConfig.filter((v) => v.type === "details" && v.entity === entityType)

    return fallbackViews.length > 0 ? fallbackViews[0] : null
  }, [entityType])

  // Load entity data when panel opens
  useEffect(() => {
    if (open && entityId) {
      setIsLoading(true)

      try {
        // Use getMockData instead of dynamic import
        const data = getMockData(entityType, entityId)
        if (data && data.length > 0) {
          setEntityData(data[0])
        } else {
          console.warn(`No data found for ${entityType} with ID ${entityId}`)
          setEntityData(null)
        }
      } catch (error) {
        console.error("Error loading entity data:", error)
        setEntityData(null)
      } finally {
        setIsLoading(false)
      }
    }
  }, [open, entityId, entityType])

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        if (onOpenChange) {
          onOpenChange(false)
        } else {
          onClose()
        }
      }
    }

    if (open) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement

      // Add event listener for escape key
      document.addEventListener("keydown", handleEscapeKey)

      // Focus the panel
      setTimeout(() => {
        if (panelRef.current) {
          panelRef.current.focus()
        }
      }, 100)

      // Prevent scrolling on the body
      document.body.style.overflow = "hidden"
    } else {
      // Restore focus when closing
      if (previousActiveElement.current && previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus()
      }

      // Restore scrolling
      document.body.style.overflow = ""
    }

    // Clean up
    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose, onOpenChange])

  // Handle clicks outside the panel
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        if (onOpenChange) {
          onOpenChange(false)
        } else {
          onClose()
        }
      }
    }

    if (open) {
      // Use a timeout to avoid immediate triggering
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleOutsideClick)
      }, 100)

      return () => {
        clearTimeout(timer)
        document.removeEventListener("mousedown", handleOutsideClick)
      }
    }

    return undefined
  }, [open, onClose, onOpenChange])

  // If not open or no valid config/entity, don't render
  if (!open || !detailsViewConfig || !entityId) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm transition-all duration-300 ease-in-out">
      <div
        ref={panelRef}
        tabIndex={-1}
        className="w-full max-w-[390px] h-full bg-background shadow-lg overflow-y-auto focus:outline-none transition-transform duration-300 ease-in-out"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
      >
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 id="preview-title" className="text-base font-semibold">
                {detailsViewConfig.label}
              </h2>
              <p className="text-xs text-muted-foreground">Preview of {entityType} details</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${entityType}/details?id=${entityId}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Full Details
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (onOpenChange) {
                    onOpenChange(false)
                  } else {
                    onClose()
                  }
                }}
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="h-20 bg-muted rounded animate-pulse" />
                <div className="h-20 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ) : entityData ? (
            <EntityDetailsContent
              viewConfig={detailsViewConfig}
              entityId={entityId}
              entityType={entityType}
              showFullDetailsButton={true}
              className="pb-16" // Add padding at the bottom for better scrolling
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No data found for this {entityType}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
