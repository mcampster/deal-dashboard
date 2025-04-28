"use client"

import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ViewConfig } from "@/config/types"
import { iconMap } from "@/config/icons"

interface ViewPickerProps {
  views: ViewConfig[]
  selectedView: ViewConfig
  onViewChange: (viewId: string) => void
  customView?: boolean
  entityFilter?: string
}

export function ViewPicker({ views, selectedView, onViewChange, customView = false, entityFilter }: ViewPickerProps) {
  const IconComponent = iconMap[selectedView.icon as keyof typeof iconMap] || iconMap.dashboard

  // Filter views by entity if entityFilter is provided
  const filteredViews = entityFilter ? views.filter((view) => view.entity === entityFilter) : views

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <IconComponent className="h-4 w-4" />
          {selectedView.label}
          {customView && <span className="text-xs text-muted-foreground">(Custom)</span>}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {filteredViews.map((view) => {
          const ViewIcon = iconMap[view.icon as keyof typeof iconMap] || iconMap.dashboard
          return (
            <DropdownMenuItem key={view.id} onClick={() => onViewChange(view.id)} className="flex items-center gap-2">
              <ViewIcon className="h-4 w-4" />
              {view.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
