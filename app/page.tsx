"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { ViewContainer } from "@/components/view-container"
import { viewsConfig } from "@/config/views"
import type { ViewConfig } from "@/config/types"

// Find all dashboard views
const dashboardViews = viewsConfig.filter((view) => view.type === "dashboard")
// Use the first dashboard view as default, but don't force it if user selects another
const defaultDashboardView = dashboardViews[0] || viewsConfig[0]

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<ViewConfig>(defaultDashboardView)
  const [customView, setCustomView] = useState<ViewConfig | null>(null)

  // Handle applying a custom configuration
  const handleApplyCustomConfig = (config: ViewConfig) => {
    setCustomView(config)
    setCurrentView(config)
  }

  // Handle view change
  const handleViewChange = (view: ViewConfig) => {
    console.log(`Dashboard page: View changed to ${view.label} (${view.id})`)
    // Make sure we're updating the state with the full view object
    setCurrentView(view)
    // Clear any custom view when switching to a predefined view
    setCustomView(null)
  }

  return (
    <AppLayout currentView={currentView} onApplyCustomConfig={handleApplyCustomConfig}>
      <ViewContainer
        defaultViewId={defaultDashboardView.id}
        viewType="dashboard"
        customView={customView}
        onViewChange={handleViewChange}
        resetToDefault={false} // Add this prop to prevent resetting to default
      />
    </AppLayout>
  )
}
