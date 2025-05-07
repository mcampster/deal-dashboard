"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DynamicTable } from "@/components/dynamic-table"
import { CardLayout } from "@/components/card-layout"
import { MasterDetailsView } from "@/components/master-details-view"
import { LayoutToggle, type ViewLayout } from "@/components/layout-toggle"
import { JiraStyleFilterBar } from "@/components/jira-style-filter-bar"
import { ColumnPickerPanel } from "@/components/column-picker-panel"
import { CardConfigEditor } from "@/components/card-config-editor"
import { VisualizationFilters } from "@/components/visualization-filters"
import { useViewData } from "@/hooks/use-view-data"
import { getAvailableColumnsFromSchema } from "@/lib/schema-utils"
import { EntityPreviewPanel } from "@/components/entity-preview-panel"
import type { ViewConfig, FilterState, CardConfig } from "@/config/types"

interface EntityDataViewProps {
  view: ViewConfig
  onViewChange?: (updatedView: ViewConfig) => void
}

export function EntityDataView({ view, onViewChange }: EntityDataViewProps) {
  // Add state for the current view (to handle column changes)
  const [currentView, setCurrentView] = useState<ViewConfig>(view)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewEntityId, setPreviewEntityId] = useState<string | null>(null)

  // Get all available columns from the schema
  const availableColumns = currentView.entity ? getAvailableColumnsFromSchema(currentView.entity) : []

  // Update currentView when view prop changes
  useEffect(() => {
    console.log("EntityDataView: View prop changed:", view.id, view.label)
    console.log(
      "EntityDataView: View columns:",
      view.columns?.map((c) => c.key),
    )
    setCurrentView(view)
  }, [view])

  // Add a useEffect to log when the entity data view changes
  useEffect(() => {
    console.log(`EntityDataView: Rendering with view ID ${currentView.id} (${currentView.label})`)
    console.log(
      "EntityDataView: Current view columns:",
      currentView.columns?.map((c) => c.key),
    )
    console.log("EntityDataView: Current view cardConfig:", currentView.cardConfig)
  }, [currentView])

  // State for quick filters
  const [quickFilters, setQuickFilters] = useState<FilterState>({})
  // Add layout state
  const [layout, setLayout] = useState<ViewLayout>("table")

  // Combine view filters with quick filters
  const combinedFilters = (() => {
    const viewFilters: FilterState = {}

    // Convert view.filters array to FilterState object
    if (currentView.filters) {
      currentView.filters.forEach((filter) => {
        viewFilters[filter.field] = {
          operator: filter.operator,
          value: filter.value,
        }
      })
    }

    // Merge with quick filters (quick filters take precedence)
    return { ...viewFilters, ...quickFilters }
  })()

  // Fetch the data using the useViewData hook with default values for all properties
  const {
    data = [],
    isLoading = false,
    error = null,
    pagination = { page: 1, pageSize: 10, total: 0, totalPages: 1 },
    setPage = () => {},
    setFilter = () => {},
    refresh = () => {},
  } = useViewData({
    view: currentView,
    pagination: { page: 1, pageSize: 10 },
    filter: combinedFilters,
  }) || {}

  // Handle filter changes from the filter bar
  const handleFilterChange = (newFilters: FilterState) => {
    setQuickFilters(newFilters)
    setFilter(newFilters)
  }

  // Handle layout change
  const handleLayoutChange = (newLayout: ViewLayout) => {
    setLayout(newLayout)
  }

  // Handle view changes (e.g., column selection)
  const handleViewChange = useCallback(
    (updatedView: ViewConfig) => {
      console.log("EntityDataView: View updated:", updatedView.id, updatedView.label)
      console.log(
        "EntityDataView: Updated view columns:",
        updatedView.columns?.map((c) => c.key),
      )
      console.log("EntityDataView: Updated view cardConfig:", updatedView.cardConfig)

      // Create a deep copy to ensure we're not modifying the original object
      const viewCopy = JSON.parse(JSON.stringify(updatedView))

      setCurrentView(viewCopy)

      // Call the parent onViewChange if provided
      if (onViewChange) {
        onViewChange(viewCopy)
      }

      // Refresh the data with the updated view
      refresh()
    },
    [onViewChange, refresh],
  )

  // Handle card config changes
  const handleCardConfigChange = useCallback(
    (cardConfig: CardConfig) => {
      console.log("EntityDataView: Card config changed:", cardConfig)

      const updatedView = {
        ...currentView,
        cardConfig,
      }

      handleViewChange(updatedView)
    },
    [currentView, handleViewChange],
  )

  // Handle preview click for card layout
  const handlePreviewClick = (entityId: string) => {
    console.log("EntityDataView: Preview clicked for entity:", entityId)
    setPreviewEntityId(entityId)
    setPreviewOpen(true)
  }

  // Handle closing the preview panel
  const handlePreviewClose = () => {
    setPreviewOpen(false)
    // Clear the entity ID when closing
    setTimeout(() => {
      setPreviewEntityId(null)
    }, 300)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter Bar and Layout Toggle - always visible */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          <JiraStyleFilterBar
            columns={currentView.columns || []}
            onFilterChange={handleFilterChange}
            currentFilters={quickFilters}
            view={currentView}
          />
        </div>
        <div className="flex-shrink-0 flex items-center">
          <LayoutToggle
            layout={layout}
            onLayoutChange={handleLayoutChange}
            availableLayouts={["table", "card", "master-details"]}
          />
        </div>
      </div>

      {/* Add Visualization Filters */}
      {currentView.visualizations && currentView.visualizations.length > 0 && (
        <VisualizationFilters
          view={currentView}
          data={data}
          onFilterChange={handleFilterChange}
          currentFilters={quickFilters}
        />
      )}

      {/* Render the appropriate view based on layout */}
      {layout === "table" ? (
        <div className="flex flex-col">
          {/* Add the column picker panel above the table, only when in table view */}
          <div className="flex justify-end mb-2">
            <ColumnPickerPanel view={currentView} onViewChange={handleViewChange} availableColumns={availableColumns} />
          </div>
          <Card>
            <CardContent className="p-6">
              <DynamicTable
                view={currentView}
                data={data}
                isLoading={isLoading}
                error={error}
                pagination={pagination}
                onPageChange={setPage}
                onRowClick={handlePreviewClick}
              />
            </CardContent>
          </Card>
        </div>
      ) : layout === "card" ? (
        <div className="flex flex-col">
          {/* Add the card config editor above the cards, only when in card view */}
          <div className="flex justify-end mb-2">
            <CardConfigEditor view={currentView} onCardConfigChange={handleCardConfigChange} />
          </div>
          <CardLayout
            view={currentView}
            data={data}
            pagination={pagination}
            isLoading={isLoading}
            onPageChange={setPage}
            onPreviewClick={handlePreviewClick}
          />
        </div>
      ) : (
        <MasterDetailsView
          view={currentView}
          data={data || []}
          isLoading={isLoading || false}
          error={error || null}
          pagination={pagination || { page: 1, pageSize: 10, total: 0, totalPages: 1 }}
          onPageChange={setPage || (() => {})}
        />
      )}

      {/* Preview panel */}
      {currentView.entity && (
        <EntityPreviewPanel
          open={previewOpen}
          onClose={handlePreviewClose}
          entityId={previewEntityId}
          entityType={currentView.entity}
        />
      )}
    </div>
  )
}
