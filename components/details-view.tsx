"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { EntityDetailsContent } from "@/components/entity-details-content"
import type { ViewConfig } from "@/config/types"

// Update the interface to include entityId
interface DetailsViewProps {
  view: ViewConfig
  entityId?: string | null // Add this prop
}

// Then update the component to use the entityId from props
export function DetailsView({ view, entityId: propEntityId }: DetailsViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const entityId = propEntityId || searchParams.get("id") // Use prop if provided, otherwise use URL

  // Handle back button click
  const handleBack = () => {
    router.back()
  }

  // If no entity ID, show a message
  if (!entityId) {
    return <div className="p-4">No entity ID provided</div>
  }

  return (
    <EntityDetailsContent
      viewConfig={view}
      entityId={entityId}
      entityType={view.entity || ""}
      showBackButton={true}
      onBack={handleBack}
    />
  )
}
