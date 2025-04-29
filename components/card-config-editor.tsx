"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { LayoutGrid } from "lucide-react"
import type { CardConfig, ViewConfig } from "@/config/types"

interface CardConfigEditorProps {
  view: ViewConfig
  onCardConfigChange: (cardConfig: CardConfig) => void
}

export function CardConfigEditor({ view, onCardConfigChange }: CardConfigEditorProps) {
  const [open, setOpen] = useState(false)

  // Get the current card config or generate a default one
  const initialCardConfig = view.cardConfig || generateDefaultCardConfig(view)
  const [cardConfig, setCardConfig] = useState<CardConfig>(initialCardConfig)

  // Update cardConfig when view changes
  useEffect(() => {
    const newConfig = view.cardConfig || generateDefaultCardConfig(view)
    setCardConfig(newConfig)
    console.log("CardConfigEditor: Updated config from view:", newConfig)
  }, [view])

  // Get all available fields from columns
  const availableFields =
    view.columns?.map((col) => ({
      field: col.field,
      label: col.label,
    })) || []

  // Handle field selection changes
  const handleFieldChange = (fieldType: keyof CardConfig, value: string | number) => {
    setCardConfig((prev) => {
      const newConfig = {
        ...prev,
        [fieldType]: value,
      }
      console.log(`CardConfigEditor: Updated ${fieldType} to:`, value)
      return newConfig
    })
  }

  // Handle detail field checkbox changes
  const handleDetailFieldChange = (field: string, checked: boolean) => {
    setCardConfig((prev) => {
      const detailFields = prev.detailFields || []
      let newDetailFields: string[]

      if (checked) {
        newDetailFields = [...detailFields, field]
      } else {
        newDetailFields = detailFields.filter((f) => f !== field)
      }

      console.log(`CardConfigEditor: Updated detailFields:`, newDetailFields)

      return {
        ...prev,
        detailFields: newDetailFields,
      }
    })
  }

  // Apply the card configuration
  const applyCardConfig = () => {
    console.log("CardConfigEditor: Applying card config:", cardConfig)
    onCardConfigChange(cardConfig)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 px-2" aria-label="Configure card view">
          <LayoutGrid className="h-4 w-4 mr-1" />
          <span>Card Config</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
        <div className="p-3 border-b">
          <div className="font-medium mb-2">Card View Configuration</div>
          <p className="text-xs text-muted-foreground">Configure how cards are displayed in card view mode.</p>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-4">
            {/* Primary Field */}
            <div className="space-y-2">
              <Label htmlFor="primaryField">Primary Field (Title)</Label>
              <Select
                value={cardConfig.primaryField}
                onValueChange={(value) => handleFieldChange("primaryField", value)}
              >
                <SelectTrigger id="primaryField">
                  <SelectValue placeholder="Select primary field" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map((field) => (
                    <SelectItem key={field.field} value={field.field}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Secondary Field */}
            <div className="space-y-2">
              <Label htmlFor="secondaryField">Secondary Field (Subtitle)</Label>
              <Select
                value={cardConfig.secondaryField || "none"}
                onValueChange={(value) => handleFieldChange("secondaryField", value === "none" ? undefined : value)}
              >
                <SelectTrigger id="secondaryField">
                  <SelectValue placeholder="Select secondary field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {availableFields.map((field) => (
                    <SelectItem key={field.field} value={field.field}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grid Columns */}
            <div className="space-y-2">
              <Label htmlFor="gridColumns">Grid Columns</Label>
              <Select
                value={String(cardConfig.gridColumns || 3)}
                onValueChange={(value) => handleFieldChange("gridColumns", Number.parseInt(value))}
              >
                <SelectTrigger id="gridColumns">
                  <SelectValue placeholder="Select number of columns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Column</SelectItem>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Layout */}
            <div className="space-y-2">
              <Label htmlFor="layout">Layout Style</Label>
              <Select value={cardConfig.layout || "grid"} onValueChange={(value) => handleFieldChange("layout", value)}>
                <SelectTrigger id="layout">
                  <SelectValue placeholder="Select layout style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Card Size */}
            <div className="space-y-2">
              <Label htmlFor="cardSize">Card Size</Label>
              <Select
                value={cardConfig.cardSize || "medium"}
                onValueChange={(value) => handleFieldChange("cardSize", value)}
              >
                <SelectTrigger id="cardSize">
                  <SelectValue placeholder="Select card size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Detail Fields */}
            <div className="space-y-2">
              <Label>Detail Fields</Label>
              <p className="text-xs text-muted-foreground mb-2">Select fields to display in the card body.</p>

              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {availableFields.map((field) => (
                  <div key={field.field} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`detail-${field.field}`}
                      checked={cardConfig.detailFields?.includes(field.field) || false}
                      onChange={(e) => handleDetailFieldChange(field.field, e.target.checked)}
                    />
                    <label htmlFor={`detail-${field.field}`} className="text-sm">
                      {field.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <Separator />
        <div className="p-3 flex justify-between">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={applyCardConfig}>Apply</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Helper function to generate a default card config from view columns
function generateDefaultCardConfig(view: ViewConfig): CardConfig {
  if (!view.columns || view.columns.length === 0) {
    return {
      primaryField: "name",
      gridColumns: 3,
      layout: "grid",
      cardSize: "medium",
      detailFields: [],
    }
  }

  return {
    primaryField: view.columns[0].field,
    secondaryField: view.columns.length > 1 ? view.columns[1].field : undefined,
    detailFields: view.columns.length > 2 ? view.columns.slice(2).map((col) => col.field) : [],
    gridColumns: 3,
    layout: "grid",
    cardSize: "medium",
  }
}
