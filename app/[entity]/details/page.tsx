"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { ViewContainer } from "@/components/view-container"
import { getViewById, getViewsByEntity } from "@/config/views"
import type { ViewConfig } from "@/config/types"
import { notFound, useSearchParams } from "next/navigation"

interface Props {
  params: {
    entity: string
  }
}

export default function EntityDetailsPage({ params }: Props) {
  const { entity } = params
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  // Find the details view for this entity
  const detailsViewId = `${entity}-details`
  let detailsView = getViewById(detailsViewId)

  // If no specific details view found, try to find any details view for this entity
  if (!detailsView) {
    const entityDetailsViews = getViewsByEntity(entity).filter((view) => view.type === "details")
    if (entityDetailsViews.length > 0) {
      detailsView = entityDetailsViews[0]
    }
  }

  // If no details view found for this entity, show 404
  if (!detailsView) {
    notFound()
  }

  const [currentView, setCurrentView] = useState<ViewConfig>(detailsView)

  // Handle view change
  const handleViewChange = (view: ViewConfig) => {
    setCurrentView(view)
  }

  return (
    <AppLayout currentView={currentView} onApplyCustomConfig={() => {}}>
      <ViewContainer
        defaultViewId={detailsView.id}
        viewType="details"
        onViewChange={handleViewChange}
        resetToDefault={false}
        entityId={id} // Pass the ID from the URL
      />
    </AppLayout>
  )
}
