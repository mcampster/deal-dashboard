"use client"

import { ActiveFilters } from "@/components/active-filters"
import { ActiveSorts } from "@/components/active-sorts"
import type { ViewConfig } from "@/config/types"

interface ViewMetadataProps {
  view: ViewConfig
}

export function ViewMetadata({ view }: ViewMetadataProps) {
  const hasFilters = view.filters && view.filters.length > 0
  const hasSorts = view.sort && view.sort.length > 0
  const hasLimit = view.limit && view.limit > 0

  if (!hasFilters && !hasSorts && !hasLimit) {
    return null
  }

  return (
    <div className="mb-4 space-y-2">
      {(hasFilters || hasLimit) && (
        <ActiveFilters filters={view.filters || []} removable={false} limit={hasLimit ? view.limit : undefined} />
      )}
      {hasSorts && <ActiveSorts sorts={view.sort!} />}
    </div>
  )
}
