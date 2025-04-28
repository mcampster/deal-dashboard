"use client"

import { useEffect, useMemo, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getViewById } from "@/config/views"
import { EntityDetailsContent } from "@/components/entity-details-content"
import { useRouter } from "next/navigation" // Add this import

interface CustomPreviewPanelProps {
  open: boolean
  onClose: () => void
  entityId: string | null
  entityType: string
}

export function CustomPreviewPanel({ open, onClose, entityId, entityType }: CustomPreviewPanelProps) {
  const router = useRouter() // Add router
  const panelRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  // Add a function to navigate to full details
  const navigateToFullDetails = () => {
    if (entityId && entityType) {
      router.push(`/${entityType}/details?id=${entityId}`)
      onClose()
    }
  }

  // Get the appropriate details view config based on entity type
  const detailsViewConfig = useMemo(() => {
    let viewId = ""

    switch (entityType) {
      case "deals":
        viewId = "deal-details"
        break
      case "contacts":
        viewId = "contact-details"
        break
      case "clients":
        viewId = "client-details"
        break
      default:
        return null
    }

    return getViewById(viewId)
  }, [entityType])

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose()
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
  }, [open, onClose])

  // Handle clicks outside the panel
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
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
  }, [open, onClose])

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
              <Button variant="outline" size="sm" onClick={navigateToFullDetails} className="text-xs h-8">
                Full Details
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close preview">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <EntityDetailsContent
            viewConfig={detailsViewConfig}
            entityId={entityId}
            entityType={entityType}
            showFullDetailsButton={false}
            className="pb-16" // Add padding at the bottom for better scrolling
          />
        </div>
      </div>
    </div>
  )
}
