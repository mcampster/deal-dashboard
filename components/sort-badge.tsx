"use client"

import { ArrowDown, ArrowUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { SortConfig } from "@/config/types"

interface SortBadgeProps {
  sort: SortConfig
}

export function SortBadge({ sort }: SortBadgeProps) {
  // Create a human-readable description of the sort
  const sortLabel = sort.label || `${sort.field} ${sort.direction === "asc" ? "ascending" : "descending"}`

  return (
    <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
      <span>{sortLabel}</span>
      {sort.direction === "asc" ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />}
    </Badge>
  )
}
