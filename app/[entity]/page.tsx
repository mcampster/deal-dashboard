"use client"

import { useState, useEffect, useMemo } from "react"
import { use } from "react"
import { AppLayout } from "@/components/app-layout"
import { ViewContainer } from "@/components/view-container"
import { getViewsByEntity } from "@/config/views"
import type { ViewConfig } from "@/config/types"
import { useRouter } from "next/navigation"

interface Props {
  params: {
    entity: string
  }
}

export default function EntityPage({ params }: Props) {
  const router = useRouter()

  // Unwrap params if it's a promise
  const unwrappedParams = params instanceof Promise ? use(params) : params
  const entity = unwrappedParams?.entity

  // Use useMemo to prevent recalculation on every render
  const { entityViews, defaultView } = useMemo(() => {
    if (!entity) {
      return { entityViews: [], defaultView: null }
    }

    // Find views for this entity
    const views = getViewsByEntity(entity).filter((view) => view.type === "list")

    // Use the first view as the default
    const defaultView = views.length > 0 ? views[0] : null

    return { entityViews: views, defaultView }
  }, [entity])

  // Initialize state with nulls to avoid conditional hook calls
  const [currentView, setCurrentView] = useState<ViewConfig | null>(null)
  const [customView, setCustomView] = useState<ViewConfig | null>(null)

  // Handle case when entity is undefined
  if (!entity) {
    return <div className="p-8 text-center">Loading entity data...</div>
  }

  // If no views found for this entity, show 404
  if (entityViews.length === 0 || !defaultView) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">No views found for entity: {entity}</h2>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md" onClick={() => router.push("/")}>
          Return to Dashboard
        </button>
      </div>
    )
  }

  useEffect(() => {
    if (defaultView) {
      setCurrentView(defaultView)
    }
  }, [defaultView])

  // Reset view when entity changes
  useEffect(() => {
    console.log(`Entity changed to: ${entity}, resetting view`)

    if (!defaultView) {
      console.error(`No default view found for entity: ${entity}`)
      return
    }

    setCustomView(null)
  }, [entity, defaultView])

  // Handle applying a custom configuration
  const handleApplyCustomConfig = (config: ViewConfig) => {
    setCustomView(config)
    setCurrentView(config)
  }

  // Handle view change
  const handleViewChange = (view: ViewConfig) => {
    console.log(`Entity page: View changed to ${view.label} (${view.id})`)
    setCurrentView(view)
    setCustomView(null)
  }

  return (
    <AppLayout currentView={currentView} onApplyCustomConfig={handleApplyCustomConfig}>
      <ViewContainer
        key={`entity-page-${entity}`}
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
