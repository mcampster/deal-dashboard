"use client"

import type { FilterConfig } from "@/config/types"
import { FilterBadge } from "@/components/filter-badge"
import { InfoIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ActiveFiltersProps {
  filters: FilterConfig[]
  onRemoveFilter?: (field: string) => void
  removable?: boolean
  limit?: number // Add limit parameter
}

export function ActiveFilters({ filters, onRemoveFilter, removable = true, limit }: ActiveFiltersProps) {
  // Check if we have any filters or a limit to display
  if ((!filters || filters.length === 0) && !limit) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="text-sm text-muted-foreground mr-2 flex items-center">Active filters:</div>
      {filters.map((filter) => (
        <FilterBadge
          key={`${filter.field}-${filter.operator}-${filter.value}`}
          filter={filter}
          onRemove={onRemoveFilter}
          removable={removable}
        />
      ))}
      {limit && (
        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
          <InfoIcon className="h-3 w-3 mr-1" />
          <span>Limit: {limit} results</span>
        </Badge>
      )}
    </div>
  )
}
