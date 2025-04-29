"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { ViewContainer } from "@/components/view-container"
import { getViewsByEntity } from "@/config/views"
import type { ViewConfig } from "@/config/types"
import { notFound } from "next/navigation"
import { useRouter } from "next/navigation"

interface Props {
  params: {
    entity: string
  }
}

export default function EntityPage({ params }: Props) {
  // Safely destructure after ensuring params exists
  const entity = params?.entity

  // Add a check to handle undefined entity
  if (!entity) {
    return <div>Loading entity data...</div>
  }

  const router = useRouter()

  // Find views for this entity - do this outside of any hooks or state
  const entityViews = getViewsByEntity(entity).filter((view) => view.type === "list")

  // If no views found for this entity, show 404
  if (entityViews.length === 0) {
    notFound()
  }

  // Use the first view as the default
  const defaultView = entityViews[0]

  // Initialize state with the default view
  const [currentView, setCurrentView] = useState<ViewConfig>(defaultView)
  const [customView, setCustomView] = useState<ViewConfig | null>(null)

  // Reset view when entity changes
  useEffect(() => {
    console.log(`Entity changed to: ${entity}, resetting view`)
    const newEntityViews = getViewsByEntity(entity).filter((view) => view.type === "list")

    if (newEntityViews.length === 0) {
      console.error(`No views found for entity: ${entity}`)
      return
    }

    const newDefaultView = newEntityViews[0]
    setCurrentView(newDefaultView)
    setCustomView(null)
  }, [entity])

  // Handle applying a custom configuration
  const handleApplyCustomConfig = (config: ViewConfig) => {
    setCustomView(config)
    setCurrentView(config)
  }

  // Handle view change
  const handleViewChange = (view: ViewConfig) => {
    console.log(`Entity page: View changed to ${view.label} (${view.id})`)
    // Make sure we're updating the state with the full view object
    setCurrentView(view)
    // Clear any custom view when switching to a predefined view
    setCustomView(null)
  }

  return (
    <AppLayout currentView={currentView} onApplyCustomConfig={handleApplyCustomConfig}>
      <ViewContainer
        key={`entity-page-${entity}`} // Add a key to force re-render when entity changes
        defaultViewId={defaultView.id}
        viewType="list"
        customView={customView}
        onViewChange={handleViewChange}
        entity={entity}
        resetToDefault={false}
      />
    </AppLayout>
  )
}
