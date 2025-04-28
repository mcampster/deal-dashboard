"use client"

import { useState } from "react"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { iconMap } from "@/config/icons"
import type { ActionConfig, ViewConfig } from "@/config/types"

interface ViewActionsProps {
  view: ViewConfig
  onRefresh?: () => void
}

export function ViewActions({ view, onRefresh }: ViewActionsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  // Get primary and secondary actions
  const primaryActions = view.actions.filter((action) => action.type === "primary")
  const secondaryActions = view.actions.filter((action) => action.type === "secondary")

  // Handle action click
  const handleActionClick = (action: ActionConfig) => {
    setIsLoading(action.id)

    // Handle refresh action specially
    if (action.id.includes("refresh") && onRefresh) {
      setTimeout(() => {
        onRefresh()
        setIsLoading(null)
        toast({
          title: "Refreshed",
          description: `${view.label} data has been refreshed`,
        })
      }, 500)
      return
    }

    // Simulate API call for other actions
    setTimeout(() => {
      setIsLoading(null)
      toast({
        title: action.label,
        description: `Action "${action.label}" was triggered for ${view.label}`,
      })
    }, 500)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Render primary actions as buttons */}
      {primaryActions.map((action) => {
        const ActionIcon = iconMap[action.icon as keyof typeof iconMap]
        return (
          <Button
            key={action.id}
            onClick={() => handleActionClick(action)}
            disabled={isLoading === action.id}
            className="flex items-center gap-1"
          >
            {ActionIcon && <ActionIcon className="h-4 w-4" />}
            {action.label}
          </Button>
        )
      })}

      {/* Render secondary actions in dropdown */}
      {secondaryActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {secondaryActions.map((action) => {
              const ActionIcon = iconMap[action.icon as keyof typeof iconMap]
              return (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  disabled={isLoading === action.id}
                  className="flex items-center gap-2"
                >
                  {ActionIcon && <ActionIcon className="h-4 w-4" />}
                  {action.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
