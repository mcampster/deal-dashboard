"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { ViewContainer } from "@/components/view-container"
import { viewsConfig } from "@/config/views"
import type { ViewConfig } from "@/config/types"

// Find all master-details views
const masterDetailsViews = viewsConfig.filter((view) => view.type === "master-details")
const defaultMasterDetailsView = masterDetailsViews[0] || viewsConfig[0]

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
