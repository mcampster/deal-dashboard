"use client"

import type { SortConfig } from "@/config/types"
import { SortBadge } from "@/components/sort-badge"

interface ActiveSortsProps {
  sorts: SortConfig[]
}

export function ActiveSorts({ sorts }: ActiveSortsProps) {
  if (!sorts || sorts.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="text-sm text-muted-foreground mr-2 flex items-center">Sorted by:</div>
      {sorts.map((sort) => (
        <SortBadge key={`${sort.field}-${sort.direction}`} sort={sort} />
      ))}
    </div>
  )
}
