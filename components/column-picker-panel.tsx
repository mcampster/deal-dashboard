"use client"

import { useState, useEffect } from "react"
import { Columns, Check, Search, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import type { ColumnConfig, ViewConfig } from "@/config/types"

interface ColumnPickerPanelProps {
  view: ViewConfig
  onViewChange: (updatedView: ViewConfig) => void
  availableColumns?: ColumnConfig[]
}

export function ColumnPickerPanel({ view, onViewChange, availableColumns = [] }: ColumnPickerPanelProps) {
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
    // Get the currently selected columns from all available columns
    const selectedColumnConfigs = allColumns.filter((col) => selectedColumns.includes(col.key))

    // Create a map of current columns for easy lookup
    const currentColumnsMap = new Map((view.columns || []).map((col) => [col.key, col]))

    // Create updated columns array, preserving order of existing columns
    // and adding new columns at the end
    const existingSelectedColumns = (view.columns || []).filter((col) => selectedColumns.includes(col.key))

    // Find columns that are newly selected (not in current view)
    const newlySelectedColumns = selectedColumnConfigs.filter(
      (col) => !currentColumnsMap.has(col.key) && selectedColumns.includes(col.key),
    )

    // Combine existing and newly selected columns
    const updatedColumns = [...existingSelectedColumns, ...newlySelectedColumns]

    // Create an updated view with the new columns
    const updatedView = {
      ...view,
      columns: updatedColumns,
    }

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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 px-2" aria-label="Select columns">
          <Columns className="h-4 w-4 mr-1" />
          <span>Columns</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[350px] sm:w-[450px] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="flex items-center">
            <Columns className="h-5 w-5 mr-2" />
            Column Management
          </SheetTitle>
          <SheetDescription>Select which columns to display in the table. Drag to reorder columns.</SheetDescription>
        </SheetHeader>

        <div className="p-6 pt-2 pb-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="p-3 border-b flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {selectedColumns.length} of {allColumns.length} columns selected
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={selectAllColumns}>
              Select All
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={deselectAllColumns}>
              Clear
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {filteredColumns.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No columns found</div>
            ) : (
              filteredColumns.map((column) => (
                <div
                  key={column.key}
                  className="flex items-center space-x-2 py-2 px-2 rounded-md hover:bg-muted/50 cursor-pointer group"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                  <Checkbox
                    id={`column-${column.key}`}
                    checked={selectedColumns.includes(column.key)}
                    onCheckedChange={() => toggleColumn(column.key)}
                  />
                  <Label htmlFor={`column-${column.key}`} className="flex-1 cursor-pointer">
                    {column.label}
                  </Label>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{column.type}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t flex justify-between">
          <Button variant="outline" onClick={resetColumns}>
            Reset
          </Button>
          <Button onClick={applyColumnSelection} className="gap-1">
            <Check className="h-4 w-4" />
            Apply Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
