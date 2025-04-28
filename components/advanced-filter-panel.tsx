"use client"

import { useState, useEffect } from "react"
import { Plus, X, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import type { FilterOperator, FilterState, ViewConfig } from "@/config/types"

interface AdvancedFilterPanelProps {
  view: ViewConfig
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplyFilters: (filters: FilterState) => void
  currentFilters: FilterState
}

interface FilterCondition {
  id: string
  field: string
  operator: FilterOperator
  value: string
}

export function AdvancedFilterPanel({
  view,
  open,
  onOpenChange,
  onApplyFilters,
  currentFilters,
}: AdvancedFilterPanelProps) {
  const [conditions, setConditions] = useState<FilterCondition[]>([])
  const [useOrLogic, setUseOrLogic] = useState(false)
  const [savedFilters, setSavedFilters] = useState<
    { name: string; conditions: FilterCondition[]; useOrLogic: boolean }[]
  >([])
  const [filterName, setFilterName] = useState("")

  // Initialize conditions from current filters when panel opens
  useEffect(() => {
    if (open) {
      const initialConditions = Object.entries(currentFilters).map(([field, filter]) => {
        const { operator, value } = filter as { operator: FilterOperator; value: string | number }
        return {
          id: `condition-${Math.random().toString(36).substring(2, 9)}`,
          field,
          operator,
          value: value.toString(),
        }
      })

      setConditions(initialConditions.length ? initialConditions : [createEmptyCondition()])
    }
  }, [open, currentFilters])

  // Load saved filters from localStorage
  useEffect(() => {
    const savedFiltersJson = localStorage.getItem(`savedFilters-${view.id}`)
    if (savedFiltersJson) {
      try {
        setSavedFilters(JSON.parse(savedFiltersJson))
      } catch (e) {
        console.error("Failed to parse saved filters", e)
      }
    }
  }, [view.id])

  // Create a new empty condition
  const createEmptyCondition = (): FilterCondition => ({
    id: `condition-${Math.random().toString(36).substring(2, 9)}`,
    field: view.columns?.[0]?.field || "",
    operator: "contains",
    value: "",
  })

  // Add a new condition
  const addCondition = () => {
    setConditions([...conditions, createEmptyCondition()])
  }

  // Remove a condition
  const removeCondition = (id: string) => {
    setConditions(conditions.filter((condition) => condition.id !== id))
  }

  // Update a condition
  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setConditions(conditions.map((condition) => (condition.id === id ? { ...condition, ...updates } : condition)))
  }

  // Apply filters
  const applyFilters = () => {
    // Filter out incomplete conditions
    const validConditions = conditions.filter(
      (condition) => condition.field && condition.operator && condition.value.trim(),
    )

    if (validConditions.length === 0) {
      // If no valid conditions, clear all filters
      onApplyFilters({})
      onOpenChange(false)
      return
    }

    // Convert conditions to FilterState
    const newFilters: FilterState = {}

    if (useOrLogic) {
      // For OR logic, we need to use a special format that our backend would understand
      // This is a simplified version - in a real app, you'd need to adjust your backend to handle this
      newFilters["$or"] = validConditions.map((condition) => ({
        field: condition.field,
        operator: condition.operator,
        value: condition.value,
      }))
    } else {
      // For AND logic, we can use the standard format
      validConditions.forEach((condition) => {
        newFilters[condition.field] = {
          operator: condition.operator,
          value: condition.value,
        }
      })
    }

    onApplyFilters(newFilters)
    onOpenChange(false)

    toast({
      title: "Filters applied",
      description: `Applied ${validConditions.length} filter condition${validConditions.length !== 1 ? "s" : ""}`,
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setConditions([createEmptyCondition()])
    setUseOrLogic(false)
  }

  // Save current filter
  const saveCurrentFilter = () => {
    if (!filterName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for this filter",
        variant: "destructive",
      })
      return
    }

    const validConditions = conditions.filter(
      (condition) => condition.field && condition.operator && condition.value.trim(),
    )

    if (validConditions.length === 0) {
      toast({
        title: "Error",
        description: "Cannot save an empty filter",
        variant: "destructive",
      })
      return
    }

    const newSavedFilter = {
      name: filterName,
      conditions: validConditions,
      useOrLogic,
    }

    const updatedSavedFilters = [...savedFilters, newSavedFilter]
    setSavedFilters(updatedSavedFilters)

    // Save to localStorage
    localStorage.setItem(`savedFilters-${view.id}`, JSON.stringify(updatedSavedFilters))

    setFilterName("")

    toast({
      title: "Filter saved",
      description: `Saved filter "${filterName}" with ${validConditions.length} condition${validConditions.length !== 1 ? "s" : ""}`,
    })
  }

  // Load a saved filter
  const loadSavedFilter = (index: number) => {
    const filter = savedFilters[index]
    setConditions(filter.conditions)
    setUseOrLogic(filter.useOrLogic)
  }

  // Delete a saved filter
  const deleteSavedFilter = (index: number) => {
    const updatedSavedFilters = savedFilters.filter((_, i) => i !== index)
    setSavedFilters(updatedSavedFilters)

    // Save to localStorage
    localStorage.setItem(`savedFilters-${view.id}`, JSON.stringify(updatedSavedFilters))

    toast({
      title: "Filter deleted",
      description: `Deleted filter "${savedFilters[index].name}"`,
    })
  }

  // Get appropriate operators based on column type
  const getOperatorsForColumn = (columnKey: string): { value: FilterOperator; label: string }[] => {
    const column = view.columns?.find((col) => col.field === columnKey)

    if (!column)
      return [
        { value: "contains", label: "Contains" },
        { value: "=", label: "Equals" },
      ]

    switch (column.type) {
      case "currency":
      case "date":
        return [
          { value: "=", label: "Equals" },
          { value: ">", label: "Greater than" },
          { value: "<", label: "Less than" },
          { value: ">=", label: "Greater than or equal" },
          { value: "<=", label: "Less than or equal" },
          { value: "!=", label: "Not equals" },
        ]
      case "text":
      case "email":
      case "phone":
      case "company":
      case "industry":
      case "location":
      default:
        return [
          { value: "contains", label: "Contains" },
          { value: "=", label: "Equals" },
          { value: "!=", label: "Not equals" },
        ]
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Create complex filter conditions to narrow down your {view.label.toLowerCase()}.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Filter conditions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Filter Conditions</h3>
              <div className="flex items-center space-x-2">
                <Label htmlFor="use-or-logic" className="text-xs">
                  Use OR logic
                </Label>
                <Switch id="use-or-logic" checked={useOrLogic} onCheckedChange={setUseOrLogic} />
              </div>
            </div>

            <div className="space-y-4">
              {conditions.map((condition, index) => (
                <div key={condition.id} className="space-y-2 p-3 border rounded-md relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6"
                    onClick={() => removeCondition(condition.id)}
                    disabled={conditions.length === 1}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove condition</span>
                  </Button>

                  <div className="grid gap-2">
                    <Label htmlFor={`field-${condition.id}`}>Field</Label>
                    <Select
                      value={condition.field}
                      onValueChange={(value) => updateCondition(condition.id, { field: value })}
                    >
                      <SelectTrigger id={`field-${condition.id}`}>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {view.columns?.map((column) => (
                          <SelectItem key={column.key} value={column.field}>
                            {column.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`operator-${condition.id}`}>Operator</Label>
                    <Select
                      value={condition.operator}
                      onValueChange={(value) => updateCondition(condition.id, { operator: value as FilterOperator })}
                    >
                      <SelectTrigger id={`operator-${condition.id}`}>
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {getOperatorsForColumn(condition.field).map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`value-${condition.id}`}>Value</Label>
                    <Input
                      id={`value-${condition.id}`}
                      value={condition.value}
                      onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                      placeholder="Enter value"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={addCondition} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Condition
            </Button>
          </div>

          <Separator />

          {/* Saved filters */}
          <div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="saved-filters">
                <AccordionTrigger className="text-sm font-medium">Saved Filters</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {savedFilters.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No saved filters yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {savedFilters.map((filter, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <Button
                              variant="ghost"
                              className="text-left justify-start h-auto py-2"
                              onClick={() => loadSavedFilter(index)}
                            >
                              <span className="truncate">{filter.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                ({filter.conditions.length} condition{filter.conditions.length !== 1 ? "s" : ""})
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteSavedFilter(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Filter name"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                      />
                      <Button variant="outline" size="sm" onClick={saveCurrentFilter} disabled={!filterName.trim()}>
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <SheetFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={clearFilters} className="sm:flex-1">
            Clear All
          </Button>
          <Button onClick={applyFilters} className="sm:flex-1">
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
