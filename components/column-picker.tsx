"use client"

import { useState, useEffect } from "react"
import { Columns } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import type { ColumnConfig, ViewConfig } from "@/config/types"

interface ColumnPickerProps {
  view: ViewConfig
  onViewChange: (updatedView: ViewConfig) => void
  availableColumns?: ColumnConfig[]
}

export function ColumnPicker({ view, onViewChange, availableColumns = [] }: ColumnPickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Initialize selected columns from the current view
  useEffect(() => {
    if (view.columns) {
      setSelectedColumns(view.columns.map((col) => col.key))
    }
  }, [view.columns])

  // Get all available columns - use provided availableColumns or fall back to view.columns
  const allColumns = availableColumns.length > 0 ? availableColumns : view.columns || []

  // Filter columns based on search query
  const filteredColumns = allColumns.filter((col) => col.label.toLowerCase().includes(searchQuery.toLowerCase()))

  // Handle column selection/deselection
  const toggleColumn = (columnKey: string) => {
    setSelectedColumns((prev) => {
      if (prev.includes(columnKey)) {
        return prev.filter((key) => key !== columnKey)
      } else {
        return [...prev, columnKey]
      }
    })
  }

  // Apply the selected columns to the view
  const applyColumnSelection = () => {
    console.log("ColumnPicker: Applying column selection", selectedColumns)

    // Get the full column configs for selected columns
    const selectedColumnConfigs = allColumns.filter((col) => selectedColumns.includes(col.key))

    console.log("ColumnPicker: Selected column configs", selectedColumnConfigs)

    // Create an updated view with the new columns
    const updatedView = {
      ...view,
      columns: selectedColumnConfigs,
    }

    console.log("ColumnPicker: Updated view", updatedView)

    // Call the onViewChange callback with the updated view
    onViewChange(updatedView)
    setOpen(false)
  }

  // Reset to the original columns
  const resetColumns = () => {
    if (view.columns) {
      setSelectedColumns(view.columns.map((col) => col.key))
    }
  }

  // Select all columns
  const selectAllColumns = () => {
    setSelectedColumns(allColumns.map((col) => col.key))
  }

  // Deselect all columns
  const deselectAllColumns = () => {
    setSelectedColumns([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 px-2" aria-label="Select columns">
          <Columns className="h-4 w-4 mr-1" />
          <span>Columns</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <div className="p-3 border-b">
          <div className="font-medium mb-2">Column Visibility</div>
          <Input
            placeholder="Search columns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="p-2 flex gap-2 border-b">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={selectAllColumns}>
            Select All
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={deselectAllColumns}>
            Deselect All
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={resetColumns}>
            Reset
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-2">
            {filteredColumns.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No columns found</div>
            ) : (
              filteredColumns.map((column) => (
                <div key={column.key} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`column-${column.key}`}
                    checked={selectedColumns.includes(column.key)}
                    onCheckedChange={() => toggleColumn(column.key)}
                  />
                  <Label htmlFor={`column-${column.key}`} className="flex-1 cursor-pointer text-sm">
                    {column.label}
                  </Label>
                  <span className="text-xs text-muted-foreground">{column.type}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <Separator />
        <div className="p-2 flex justify-between">
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={applyColumnSelection}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
