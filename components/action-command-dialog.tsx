"use client"

import { useEffect, useState, useRef } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { iconMap } from "@/config/icons"
import type { ViewConfig } from "@/config/types"

interface ActionCommandDialogProps {
  view: ViewConfig
  onActionSelect: (actionId: string) => void
}

export function ActionCommandDialog({ view, onActionSelect }: ActionCommandDialogProps) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle keyboard shortcut to open the dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open dialog when "." is pressed
      if (e.key === "." && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't open if user is typing in an input, textarea, or contentEditable element
        if (
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement ||
          (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable)
        ) {
          return
        }

        e.preventDefault()
        setOpen(true)
      }

      // Close dialog when Escape is pressed
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open])

  // Focus the input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  // Handle action selection
  const handleSelect = (actionId: string) => {
    onActionSelect(actionId)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-[450px]">
        <Command>
          <CommandInput ref={inputRef} placeholder="Search actions..." className="h-10" />
          <CommandList>
            <CommandEmpty>No actions found.</CommandEmpty>
            <CommandGroup heading="Available Actions">
              {view.actions.map((action) => {
                const ActionIcon = iconMap[action.icon as keyof typeof iconMap]
                return (
                  <CommandItem
                    key={action.id}
                    onSelect={() => handleSelect(action.id)}
                    className="flex items-center gap-2 py-2"
                  >
                    {ActionIcon && <ActionIcon className="h-4 w-4" />}
                    <span>{action.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
