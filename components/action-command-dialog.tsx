"use client"

import { useEffect, useState } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useHotkeys } from "@/hooks/use-hotkeys-hook"
import { iconMap } from "@/config/icons"
import type { ViewConfig } from "@/config/types"

interface ActionCommandDialogProps {
  view: ViewConfig
  onActionSelect: (actionId: string) => void
}

export function ActionCommandDialog({ view, onActionSelect }: ActionCommandDialogProps) {
  const [open, setOpen] = useState(false)

  // Ensure view.actions is an array
  const actions = Array.isArray(view.actions) ? view.actions : []

  // Set up hotkey to open the dialog
  useHotkeys(".", () => {
    setOpen(true)
  })

  // Close the dialog when Escape is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={`Search ${view.label} actions...`} />
      <CommandList>
        <CommandEmpty>No actions found.</CommandEmpty>
        <CommandGroup heading="Actions">
          {actions.map((action) => {
            const ActionIcon = iconMap[action.icon as keyof typeof iconMap]
            return (
              <CommandItem
                key={action.id}
                onSelect={() => {
                  onActionSelect(action.id)
                  setOpen(false)
                }}
              >
                {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
                <span>{action.label}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
