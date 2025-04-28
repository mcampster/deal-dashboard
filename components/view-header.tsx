"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ViewActions } from "@/components/view-actions"
import { ActionCommandDialog } from "@/components/action-command-dialog"
import { iconMap } from "@/config/icons"
import { toast } from "@/components/ui/use-toast"
import type { ViewConfig } from "@/config/types"

interface ViewHeaderProps {
  views: ViewConfig[]
  selectedView: ViewConfig
  onViewChange: (viewId: string) => void
  customView?: boolean
  entityFilter?: string
  onRefresh?: () => void
}

export function ViewHeader({
  views,
  selectedView,
  onViewChange,
  customView = false,
  entityFilter,
  onRefresh,
}: ViewHeaderProps) {
  // Filter views by entity if entityFilter is provided
  const filteredViews = entityFilter ? views.filter((view) => view.entity === entityFilter) : views

  // Handle action selection from the command dialog
  const handleActionSelect = (actionId: string) => {
    // Handle refresh action specially
    if (actionId.includes("refresh") && onRefresh) {
      onRefresh()
      toast({
        title: "Refreshed",
        description: `${selectedView.label} data has been refreshed`,
      })
      return
    }

    // Simulate API call for other actions
    toast({
      title: "Action Triggered",
      description: `Action "${actionId}" was triggered for ${selectedView.label}`,
    })
  }

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 h-auto flex items-center gap-2 hover:bg-transparent">
              <h1 className="text-2xl font-bold tracking-tight">{selectedView.label}</h1>
              {customView && <span className="text-xs text-muted-foreground">(Custom)</span>}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {filteredViews.map((view) => {
              const ViewIcon = iconMap[view.icon as keyof typeof iconMap] || iconMap.dashboard
              return (
                <DropdownMenuItem
                  key={view.id}
                  onClick={() => {
                    console.log(`ViewHeader: Changing view to: ${view.id} (${view.label})`)
                    // Ensure we're passing the view ID string, not the view object
                    onViewChange(view.id)
                  }}
                  className="flex items-center gap-2"
                >
                  <ViewIcon className="h-4 w-4" />
                  {view.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <p className="text-muted-foreground">{selectedView.description}</p>
      </div>
      <div className="flex items-center gap-4">
        <ViewActions view={selectedView} onRefresh={onRefresh} />
      </div>

      {/* Add the Action Command Dialog */}
      <ActionCommandDialog view={selectedView} onActionSelect={handleActionSelect} />
    </div>
  )
}
