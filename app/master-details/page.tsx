"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { ViewContainer } from "@/components/view-container"
import { viewsConfig } from "@/config/views"
import type { ViewConfig } from "@/config/types"

// Find all master-details views with a safety check for viewsConfig
const masterDetailsViews = Array.isArray(viewsConfig)
  ? viewsConfig.filter((view) => view.type === "master-details")
  : []

// Set a default view with a safety check
const defaultMasterDetailsView =
  masterDetailsViews.length > 0
    ? masterDetailsViews[0]
    : {
        id: "default-master-details",
        label: "Master Details",
        icon: "layout",
        type: "master-details",
        entity: "deals",
        columns: [],
      }

export default function MasterDetailsPage() {
  const [currentView, setCurrentView] = useState<ViewConfig>(defaultMasterDetailsView)
  const [customView, setCustomView] = useState<ViewConfig | null>(null)

  // Handle applying a custom configuration
  const handleApplyCustomConfig = (config: ViewConfig) => {
    setCustomView(config)
    setCurrentView(config)
  }

  // Handle view change
  const handleViewChange = (view: ViewConfig) => {
    setCurrentView(view)
  }

  return (
    <AppLayout currentView={currentView} onApplyCustomConfig={handleApplyCustomConfig}>
      <ViewContainer
        defaultViewId={defaultMasterDetailsView.id}
        viewType="master-details"
        customView={customView}
        onViewChange={handleViewChange}
      />
    </AppLayout>
  )
}
