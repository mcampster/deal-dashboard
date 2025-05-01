"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { ViewContainer } from "@/components/view-container"
import { viewsConfig } from "@/config/views"
import type { ViewConfig } from "@/config/types"

// Create a default view in case no master-details views are found
const DEFAULT_VIEW: ViewConfig = {
  id: "default-master-details",
  label: "Master Details",
  icon: "layout",
  type: "master-details",
  entity: "deals",
  columns: [],
}

export function MasterDetailsClient() {
  // State for views
  const [masterDetailsViews, setMasterDetailsViews] = useState<ViewConfig[]>([])
  const [defaultView, setDefaultView] = useState<ViewConfig>(DEFAULT_VIEW)
  const [currentView, setCurrentView] = useState<ViewConfig>(DEFAULT_VIEW)
  const [customView, setCustomView] = useState<ViewConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize views on client-side only
  useEffect(() => {
    // This code only runs on the client
    if (Array.isArray(viewsConfig)) {
      const mdViews = viewsConfig.filter((view) => view.type === "master-details")
      setMasterDetailsViews(mdViews)

      if (mdViews.length > 0) {
        setDefaultView(mdViews[0])
        setCurrentView(mdViews[0])
      }
    }
    setIsLoading(false)
  }, [])

  // Handle applying a custom configuration
  const handleApplyCustomConfig = (config: ViewConfig) => {
    setCustomView(config)
    setCurrentView(config)
  }

  // Handle view change
  const handleViewChange = (view: ViewConfig) => {
    setCurrentView(view)
  }

  // Show loading state while initializing
  if (isLoading) {
    return <div className="p-8">Loading master-details views...</div>
  }

  return (
    <AppLayout currentView={currentView} onApplyCustomConfig={handleApplyCustomConfig}>
      <ViewContainer
        defaultViewId={defaultView.id}
        viewType="master-details"
        customView={customView}
        onViewChange={handleViewChange}
      />
    </AppLayout>
  )
}
