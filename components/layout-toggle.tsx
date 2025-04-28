"use client"

import { LayoutGrid, LayoutList, Columns } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type ViewLayout = "table" | "card" | "master-details"

interface LayoutToggleProps {
  layout: ViewLayout
  onLayoutChange: (layout: ViewLayout) => void
  availableLayouts?: ViewLayout[]
}

export function LayoutToggle({
  layout,
  onLayoutChange,
  availableLayouts = ["table", "card", "master-details"],
}: LayoutToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <ToggleGroup type="single" value={layout} onValueChange={(value) => value && onLayoutChange(value as ViewLayout)}>
        {availableLayouts.includes("table") && (
          <ToggleGroupItem value="table" aria-label="Table view">
            <LayoutList className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Table</span>
          </ToggleGroupItem>
        )}
        {availableLayouts.includes("card") && (
          <ToggleGroupItem value="card" aria-label="Card view">
            <LayoutGrid className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Cards</span>
          </ToggleGroupItem>
        )}
        {availableLayouts.includes("master-details") && (
          <ToggleGroupItem value="master-details" aria-label="Master-details view">
            <Columns className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Master-Details</span>
          </ToggleGroupItem>
        )}
      </ToggleGroup>
    </div>
  )
}
