"use client"

import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { FilterConfig } from "@/config/types"

interface FilterBadgeProps {
  filter: FilterConfig
  onRemove?: (field: string) => void
  removable?: boolean
}

// Helper function to format filter values for display
function formatFilterValue(value: string | number): string {
  if (typeof value === "string" && value.startsWith("$")) {
    return value // Already formatted as currency
  }

  if (typeof value === "number" && value > 1000) {
    return `$${value.toLocaleString()}` // Format large numbers as currency
  }

  return String(value)
}

// Helper function to get human-readable operator
function getOperatorLabel(operator: string): string {
  switch (operator) {
    case ">":
      return "greater than"
    case ">=":
      return "at least"
    case "<":
      return "less than"
    case "<=":
      return "at most"
    case "=":
      return "equals"
    case "!=":
      return "not equals"
    case "contains":
      return "contains"
    default:
      return operator
  }
}

export function FilterBadge({ filter, onRemove, removable = true }: FilterBadgeProps) {
  // Create a human-readable description of the filter
  const filterLabel =
    filter.label || `${filter.field} ${getOperatorLabel(filter.operator)} ${formatFilterValue(filter.value)}`

  return (
    <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
      <span>{filterLabel}</span>
      {removable && onRemove && (
        <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => onRemove(filter.field)}>
          <X className="h-3 w-3" />
          <span className="sr-only">Remove filter</span>
        </Button>
      )}
    </Badge>
  )
}
