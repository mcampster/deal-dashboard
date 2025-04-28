"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import type { ViewConfig } from "@/config/types"

interface ConfigSidePanelProps {
  onApplyConfig: (config: ViewConfig) => void
  currentConfig?: ViewConfig
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ConfigSidePanel({
  onApplyConfig,
  currentConfig,
  open: controlledOpen,
  onOpenChange,
}: ConfigSidePanelProps) {
  const [open, setOpen] = useState(false)
  const [configText, setConfigText] = useState(() => {
    return currentConfig ? JSON.stringify(currentConfig, null, 2) : ""
  })
  const [error, setError] = useState<string | null>(null)

  // Sync with controlled state if provided
  useEffect(() => {
    if (controlledOpen !== undefined) {
      setOpen(controlledOpen)
    }
  }, [controlledOpen])

  // Update config text when current config changes
  useEffect(() => {
    if (currentConfig) {
      setConfigText(JSON.stringify(currentConfig, null, 2))
    }
  }, [currentConfig])

  const handleOpenChange = (newOpen: boolean) => {
    console.log("ConfigSidePanel open state changing to:", newOpen)
    setOpen(newOpen)
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
  }

  const handleApply = () => {
    try {
      // Parse the JSON
      const parsedConfig = JSON.parse(configText)

      // Basic validation
      if (!parsedConfig.id || !parsedConfig.label || !parsedConfig.type) {
        throw new Error("Invalid configuration: Missing required fields (id, label, type)")
      }

      // Different validation based on view type
      if (parsedConfig.type === "list") {
        // List view validation
        if (!parsedConfig.entity || !Array.isArray(parsedConfig.columns)) {
          throw new Error("Invalid list view configuration: Missing required fields (entity, columns)")
        }

        // Validate columns
        if (parsedConfig.columns.length === 0) {
          throw new Error("List view configuration must include at least one column")
        }

        for (const column of parsedConfig.columns) {
          if (!column.key || !column.label || !column.type || !column.field) {
            throw new Error(
              "Invalid column configuration: Each column must have key, label, type, and field properties",
            )
          }
        }
      } else if (parsedConfig.type === "dashboard") {
        // Dashboard view validation
        if (!Array.isArray(parsedConfig.widgets) || parsedConfig.widgets.length === 0) {
          throw new Error("Invalid dashboard configuration: Missing or empty widgets array")
        }

        // Validate widgets
        for (const widget of parsedConfig.widgets) {
          if (!widget.id || !widget.type || !widget.title || !widget.width || !widget.entity) {
            throw new Error(
              "Invalid widget configuration: Each widget must have id, type, title, width, and entity properties",
            )
          }

          // Validate table widgets
          if (widget.type === "table" && (!Array.isArray(widget.columns) || widget.columns.length === 0)) {
            throw new Error("Table widgets must include at least one column")
          }
        }
      } else if (parsedConfig.type === "details") {
        // Details view validation
        if (!parsedConfig.entity || !parsedConfig.detailsConfig) {
          throw new Error("Invalid details view configuration: Missing required fields (entity, detailsConfig)")
        }

        // Validate detailsConfig
        if (
          !Array.isArray(parsedConfig.detailsConfig.primaryFields) ||
          parsedConfig.detailsConfig.primaryFields.length === 0
        ) {
          throw new Error("Details view configuration must include at least one primary field")
        }
      } else if (parsedConfig.type === "master-details") {
        // Master-details view validation
        if (!parsedConfig.entity || !Array.isArray(parsedConfig.columns)) {
          throw new Error("Invalid master-details view configuration: Missing required fields (entity, columns)")
        }

        // Validate columns
        if (parsedConfig.columns.length === 0) {
          throw new Error("Master-details view configuration must include at least one column")
        }
      } else {
        throw new Error(
          `Invalid view type: ${parsedConfig.type}. Must be one of "list", "dashboard", "details", or "master-details"`,
        )
      }

      // Clear any previous errors
      setError(null)

      // Apply the configuration
      onApplyConfig(parsedConfig)

      // Show success toast
      toast({
        title: "Configuration Applied",
        description: `Applied custom configuration for "${parsedConfig.label}"`,
      })
    } catch (err) {
      // Set error message
      setError(err instanceof Error ? err.message : "Invalid JSON configuration")
    }
  }

  const handleReset = () => {
    if (currentConfig) {
      setConfigText(JSON.stringify(currentConfig, null, 2))
      setError(null)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-[500px] sm:w-[600px] md:w-[700px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>View Configuration</SheetTitle>
          <SheetDescription>
            Edit the JSON configuration to customize your view. The configuration must include id, label, entity, and
            columns.
          </SheetDescription>
        </SheetHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Textarea
          value={configText}
          onChange={(e) => setConfigText(e.target.value)}
          className="font-mono h-[calc(100vh-250px)] resize-none mb-4"
          placeholder={`{
  "id": "custom-view",
  "label": "Custom View",
  "icon": "dollar",
  "description": "My custom view",
  "entity": "deals",
  "columns": [
    { "key": "name", "label": "Name", "type": "text", "field": "name" },
    { "key": "value", "label": "Value", "type": "currency", "field": "value" }
  ],
  "actions": [
    { "id": "refresh", "label": "Refresh", "icon": "refresh", "type": "secondary" }
  ],
  "filters": [
    { "field": "value", "operator": ">", "value": "$100,000", "label": "High value" }
  ]
}`}
        />

        <div className="flex justify-between gap-2 mt-4">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply} className="gap-2">
            <Upload className="h-4 w-4" />
            Apply Configuration
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
