"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DynamicTable } from "@/components/dynamic-table"
import { CardLayout } from "@/components/card-layout"
import { MasterDetailsView } from "@/components/master-details-view"
import { LayoutToggle, type ViewLayout } from "@/components/layout-toggle"
import { JiraStyleFilterBar } from "@/components/jira-style-filter-bar"
import { ColumnPicker } from "@/components/column-picker"
import { VisualizationFilters } from "@/components/visualization-filters"
import { useViewData } from "@/hooks/use-view-data"
import { getAvailableColumnsFromSchema } from "@/lib/schema-utils" // Import the schema utility
import type { ViewConfig, FilterState } from "@/config/types"

interface EntityDataViewProps {
  view: ViewConfig
  onViewChange?: (updatedView: ViewConfig) => void
}

export function EntityDataView({ view, onViewChange }: EntityDataViewProps) {
  // Add state for the current view (to handle column changes)
  const [currentView, setCurrentView] = useState<ViewConfig>(view)

  // Get all available columns from the schema
  const availableColumns = currentView.entity ? getAvailableColumnsFromSchema(currentView.entity) : []

  // Update currentView when view prop changes
  useEffect(() => {
    setCurrentView(view)
  }, [view])

  // Add a useEffect to log when the entity data view changes
  useEffect(() => {
    console.log(`EntityDataView: Rendering with view ID ${currentView.id} (${currentView.label})`)
  }, [currentView.id, currentView.label])

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
  const handleViewChange = (updatedView: ViewConfig) => {
    setCurrentView(updatedView)

    // Call the parent onViewChange if provided
    if (onViewChange) {
      onViewChange(updatedView)
    }

    // Refresh the data with the updated view
    refresh()
  }

  // Handle preview click for card layout
  const handlePreviewClick = (entityId: string) => {
    // If in card or table layout, switch to master-details and select the entity
    if (layout !== "master-details") {
      setLayout("master-details")
      // In a real implementation, you would also set the selected entity ID
    }
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
          {/* Pass availableColumns to the ColumnPicker */}
          <ColumnPicker view={currentView} onViewChange={handleViewChange} availableColumns={availableColumns} />
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
      ) : layout === "card" ? (
        <CardLayout
          view={currentView}
          data={data}
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={setPage}
          onPreviewClick={handlePreviewClick}
        />
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
    </div>
  )
}
