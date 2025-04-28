"use client"

import { useState } from "react"
import { Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false)

  const shortcuts = [
    { keys: ["↑", "↓"], description: "Navigate between rows" },
    { keys: ["Alt", "A"], description: "Open actions menu for selected row" },
    { keys: ["Alt", "P"], description: "Preview selected row" },
    { keys: ["Alt", "V"], description: "View details of selected row" },
    { keys: ["Alt", "F"], description: "Focus on filter input" },
    { keys: ["Alt", "R"], description: "Refresh data" },
    { keys: ["Alt", "?"], description: "Show keyboard shortcuts help" },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Keyboard Shortcuts">
          <Keyboard className="h-4 w-4" />
          <span className="sr-only">Keyboard Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and interact with the data view.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <span
                      key={keyIndex}
                      className="inline-flex items-center justify-center h-8 min-w-8 px-2 rounded border bg-muted font-mono text-sm"
                    >
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogClose asChild>
          <Button variant="outline" className="w-full">
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
