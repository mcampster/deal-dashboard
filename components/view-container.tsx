"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { DashboardView } from "@/components/dashboard-view"
import { DetailsView } from "@/components/details-view"
import { EntityDataView } from "@/components/entity-data-view"
import { ViewHeader } from "@/components/view-header"
import { useViewData } from "@/hooks/use-view-data"
import { viewsConfig, getViewById } from "@/config/views"
import { Keyboard } from "lucide-react"
import type { ViewConfig } from "@/config/types"

interface ViewContainerProps {
  defaultViewId: string
  viewType?: "list" | "dashboard" | "details" | "master-details" | "all"
  customView?: ViewConfig | null
  onViewChange?: (view: ViewConfig) => void
  entity?: string
  resetToDefault?: boolean
  entityId?: string | null
}

export function ViewContainer({
  defaultViewId,
  viewType = "all",
  customView = null,
  onViewChange,
  entity,
  resetToDefault = true,
  entityId,
}: ViewContainerProps) {
  // Use useMemo to prevent recalculation on every render
  const defaultView = useMemo(() => {
    try {
      const view = getViewById(defaultViewId)
      return view || (Array.isArray(viewsConfig) && viewsConfig.length > 0 ? viewsConfig[0] : null)
    } catch (error) {
      console.error("Error getting default view:", error)
      return null
    }
  }, [defaultViewId])

  const [selectedViewId, setSelectedViewId] = useState<string>(defaultViewId)
  const [currentCustomView, setCurrentCustomView] = useState<ViewConfig | null>(customView)

  // Add a ref to track view changes
  const prevViewIdRef = useRef<string>(selectedViewId)

  // Use useMemo for filtering views to prevent recalculation on every render
  const availableViews = useMemo(() => {
    try {
      if (!Array.isArray(viewsConfig)) return []

      return viewsConfig.filter((view) => {
        if (viewType !== "all" && view.type !== viewType) return false
        if (entity && view.entity !== entity) return false
        return true
      })
    } catch (error) {
      console.error("Error filtering views:", error)
      return []
    }
  }, [viewType, entity])

  // Use useMemo to determine the selected view to prevent recalculation
  const selectedView = useMemo(() => {
    try {
      return (
        currentCustomView ||
        getViewById(selectedViewId) ||
        defaultView || {
          id: "fallback-view",
          label: "Fallback View",
          type: viewType === "all" ? "list" : viewType,
          entity: entity || "deals",
          columns: [],
        }
      )
    } catch (error) {
      console.error("Error getting selected view:", error)
      return {
        id: "error-view",
        label: "Error View",
        type: viewType === "all" ? "list" : viewType,
        entity: entity || "deals",
        columns: [],
      }
    }
  }, [currentCustomView, selectedViewId, defaultView, viewType, entity])

  // Get the refresh function from the hook
  const { refresh } = useViewData({
    view: selectedView,
    // Add a key to force refresh when the view changes
    key: `${selectedView.id}-${entity || "no-entity"}`,
  })

  // Handle view change from view picker
  const handleViewChange = (viewId: string) => {
    console.log(`ViewContainer: Changing view from ${selectedViewId} to ${viewId}`)
    setSelectedViewId(viewId)
    setCurrentCustomView(null) // Clear any custom view when switching to a predefined view

    try {
      const newView = getViewById(viewId)
      console.log(`ViewContainer: New view found:`, newView?.label)

      if (newView && onViewChange) {
        console.log(`ViewContainer: Calling parent onViewChange with view:`, newView)
        onViewChange(newView)
      } else {
        console.error(`ViewContainer: Failed to find view with ID: ${viewId}`)
      }
    } catch (error) {
      console.error(`ViewContainer: Error changing view:`, error)
    }
  }

  // Handle view updates (e.g., column changes or card config changes)
  const handleViewUpdate = useCallback(
    (updatedView: ViewConfig) => {
      try {
        console.log(`ViewContainer: Updating view:`, updatedView.label)
        console.log(`ViewContainer: Updated view cardConfig:`, updatedView.cardConfig)

        // If this is a predefined view, create a custom view based on it
        if (getViewById(updatedView.id)) {
          const customizedView = {
            ...updatedView,
            id: `custom-${updatedView.id}`,
            label: `${updatedView.label} (Custom)`,
          }
          setCurrentCustomView(customizedView)

          // Call the parent onViewChange if provided
          if (onViewChange) {
            onViewChange(customizedView)
          }
        } else {
          // If it's already a custom view, just update it
          setCurrentCustomView(updatedView)

          // Call the parent onViewChange if provided
          if (onViewChange) {
            onViewChange(updatedView)
          }
        }
      } catch (error) {
        console.error(`ViewContainer: Error updating view:`, error)
      }
    },
    [onViewChange],
  )

  // Update selected view when defaultViewId changes
  useEffect(() => {
    if (defaultViewId && defaultViewId !== selectedViewId && resetToDefault) {
      console.log(`ViewContainer: defaultViewId changed from ${selectedViewId} to ${defaultViewId}`)
      setSelectedViewId(defaultViewId)
      setCurrentCustomView(null)
    }
  }, [defaultViewId, selectedViewId, resetToDefault])

  // Update custom view when it changes from props
  useEffect(() => {
    if (customView !== currentCustomView) {
      console.log(`ViewContainer: customView changed`, customView?.id)
      setCurrentCustomView(customView)
    }
  }, [customView, currentCustomView])

  // Log when the selected view changes
  useEffect(() => {
    if (prevViewIdRef.current !== selectedView.id) {
      console.log(`ViewContainer: Selected view changed from ${prevViewIdRef.current} to ${selectedView.id}`)
      console.log(`ViewContainer: Selected view cardConfig:`, selectedView.cardConfig)
      prevViewIdRef.current = selectedView.id
    }
  }, [selectedView])

  // Render the appropriate view based on type
  const renderView = () => {
    try {
      // Add a key prop with the view ID to force a re-render when the view changes
      if (selectedView.type === "dashboard") {
        return <DashboardView key={`dashboard-${selectedView.id}`} view={selectedView} />
      }

      if (selectedView.type === "details") {
        return <DetailsView key={`details-${selectedView.id}`} view={selectedView} entityId={entityId} />
      }

      // For both list and master-details views, use the EntityDataView
      return <EntityDataView key={`entity-${selectedView.id}`} view={selectedView} onViewChange={handleViewUpdate} />
    } catch (error) {
      console.error("Error rendering view:", error)
      return <div className="p-4">Error rendering view. Please check the console for details.</div>
    }
  }

  // Don't show view controls for details view
  const showViewControls = selectedView.type !== "details"

  // Filter views by entity if the selected view has an entity
  const entityFilter = selectedView.entity || undefined

  return (
    <>
      {/* View Header */}
      {showViewControls && (
        <>
          <ViewHeader
            views={availableViews}
            selectedView={selectedView}
            onViewChange={handleViewChange}
            customView={currentCustomView !== null}
            entityFilter={entityFilter}
            onRefresh={refresh}
          />

          {/* Keyboard shortcut hint */}
          <div className="mb-4 text-xs text-muted-foreground flex items-center">
            <Keyboard className="h-3 w-3 mr-1" />
            <span>Press "." to access actions</span>
          </div>
        </>
      )}

      {/* View Content */}
      {renderView()}
    </>
  )
}
