"use client"
import { useMemo, useState } from "react"
import { CommandItem } from "@/components/ui/command"

import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { ColumnConfig, FilterState, ViewConfig } from "@/config/types"

interface SchemaBasedQuickFilterProps {
  view: ViewConfig
  onFilterChange: (filters: FilterState) => void
  currentFilters: FilterState
  data: any[]
}

export function SchemaBasedQuickFilter({ view, onFilterChange, currentFilters, data }: SchemaBasedQuickFilterProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [selectedValues, setSelectedValues] = useState<Record<string, Set<any>>>({})

  // Get filterable columns based on configuration
  const filterableColumns = useMemo(() => {
    if (!view.columns) return []
    return view.columns.filter((column) => column.filterable === true)
  }, [view.columns])

  // Extract unique values for each filterable field
  const filterValuesByField = useMemo(() => {
    const result: Record<string, any[]> = {}

    if (!data || data.length === 0) return result

    filterableColumns.forEach((column) => {
      const field = column.field

      // Get all values for the field
      const allValues = data.map((item) => item[field])

      // Filter out undefined/null values and get unique values
      const uniqueValues = [...new Set(allValues.filter(Boolean))]

      // Sort values
      const sortedValues = uniqueValues.sort((a, b) => {
        // Special case for deal stages
        if (field === "stage") {
          const stageOrder = ["Discovery", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]
          const indexA = stageOrder.indexOf(a)
          const indexB = stageOrder.indexOf(b)
          if (indexA !== -1 && indexB !== -1) return indexA - indexB
        }

        // Handle different types of values
        if (typeof a === "string" && typeof b === "string") {
          return a.localeCompare(b)
        }
        if (typeof a === "number" && typeof b === "number") {
          return a - b
        }
        return String(a).localeCompare(String(b))
      })

      result[field] = sortedValues
    })

    return result
  }, [data, filterableColumns])

  // Count items for each filter value
  const getFilterValueCount = (field: string, value: any) => {
    if (!data) return 0

    // Create a filter state that includes all current filters except the one for this field
    const otherFilters = { ...currentFilters }
    delete otherFilters[field]

    // Count items that match all other filters and have this field value
    return data.filter((item) => {
      // First check if the item matches all other active filters
      const matchesOtherFilters = Object.entries(otherFilters).every(([filterField, filterConfig]) => {
        if (typeof filterConfig !== "object" || !("operator" in filterConfig) || !("value" in filterConfig)) {
          return true
        }

        const { operator, value: filterValue } = filterConfig

        // Handle array values for multi-select
        if (operator === "in" && Array.isArray(filterValue)) {
          return filterValue.includes(item[filterField])
        }

        // Simple equality check for other operators
        if (operator === "=" || operator === "equals") {
          return item[filterField] === filterValue
        }

        return true // Skip other operators for simplicity
      })

      // Then check if this item has the field value we're counting
      return matchesOtherFilters && item[field] === value
    }).length
  }

  // Check if a filter is active
  const isFilterActive = (field: string, value: any) => {
    const filter = currentFilters[field]
    if (!filter || typeof filter !== "object" || !("value" in filter)) return false
    return filter.value === value
  }

  // Get active filter for a field
  const getActiveFilter = (field: string) => {
    const filter = currentFilters[field]
    if (!filter || typeof filter !== "object" || !("value" in filter)) return null
    return filter.value
  }

  // Handle selecting a filter value
  const handleSelectValue = (field: string, value: any) => {
    // If the filter is already active, remove it
    if (isFilterActive(field, value)) {
      const newFilters = { ...currentFilters }
      delete newFilters[field]
      onFilterChange(newFilters)
    } else {
      // Otherwise, apply the filter
      const newFilters: FilterState = {
        ...currentFilters,
        [field]: {
          operator: "=",
          value: value,
        },
      }
      onFilterChange(newFilters)
    }

    // Close the popover
    setOpen({ ...open, [field]: false })
  }

  // Handle toggling a value for multi-select fields
  const handleToggleValue = (field: string, value: any) => {
    // Update the selected values
    const newSelectedValues = new Set(selectedValues[field] || [])

    if (newSelectedValues.has(value)) {
      newSelectedValues.delete(value)
    } else {
      newSelectedValues.add(value)
    }

    setSelectedValues({
      ...selectedValues,
      [field]: newSelectedValues,
    })

    // Apply the filter if there are selected values, otherwise remove it
    if (newSelectedValues.size > 0) {
      const newFilters: FilterState = {
        ...currentFilters,
        [field]: {
          operator: "in",
          value: Array.from(newSelectedValues),
        },
      }
      onFilterChange(newFilters)
    } else {
      const newFilters = { ...currentFilters }
      delete newFilters[field]
      onFilterChange(newFilters)
    }
  }

  // Apply multi-select filters
  const applyMultiSelectFilter = (field: string) => {
    // Close the popover
    setOpen({ ...open, [field]: false })
  }

  // Clear filter for a field
  const clearFilter = (field: string) => {
    const newFilters = { ...currentFilters }
    delete newFilters[field]
    onFilterChange(newFilters)

    // Clear selected values for multi-select
    setSelectedValues({
      ...selectedValues,
      [field]: new Set(),
    })
  }

  // Get display label for a column
  const getColumnLabel = (column: ColumnConfig) => {
    return column.label || column.field
  }

  // Get active filter display text
  const getActiveFilterDisplay = (column: ColumnConfig) => {
    const field = column.field
    const filter = currentFilters[field]

    if (!filter || typeof filter !== "object" || !("value" in filter)) {
      return null
    }

    // Handle multi-select values
    if (Array.isArray(filter.value)) {
      if (filter.value.length === 1) {
        return String(filter.value[0])
      }
      return `${filter.value.length} selected`
    }

    return String(filter.value)
  }

  // If no filterable columns, show nothing
  if (filterableColumns.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filterableColumns.map((column) => {
        const field = column.field
        const values = filterValuesByField[field] || []
        const activeFilterDisplay = getActiveFilterDisplay(column)

        return (
          <Popover key={field} open={open[field]} onOpenChange={(isOpen) => setOpen({ ...open, [field]: isOpen })}>
            <PopoverTrigger asChild>
              <Button variant={activeFilterDisplay ? "default" : "outline"} size="sm" className="h-8 gap-1">
                <Filter className="h-3.5 w-3.5" />
                {getColumnLabel(column)}
                {activeFilterDisplay && (
                  <Badge variant="secondary" className="ml-1 rounded-sm px-1">
                    {activeFilterDisplay}
                  </Badge>
                )}
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
              {column.type === "text" && column.field === "stage" ? (
                // Multi-select for stage field
                <div className="p-3 space-y-3">
                  {values.map((value) => (
                    <div key={String(value)} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${field}-${value}`}
                        checked={selectedValues[field]?.has(value) || false}
                        onCheckedChange={() => handleToggleValue(field, value)}
                      />
                      <Label htmlFor={`${field}-${value}`} className="flex-1 text-sm">
                        {String(value)}
                      </Label>
                      <span className="text-xs text-muted-foreground">{getFilterValueCount(field, value)}</span>
                    </div>
                  ))}
                  <Button size="sm" className="w-full mt-2" onClick={() => applyMultiSelectFilter(field)}>
                    Apply
                  </Button>
                  {selectedValues[field]?.size > 0 && (
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => clearFilter(field)}>
                      <X className="h-3.5 w-3.5 mr-2" />
                      Clear selection
                    </Button>
                  )}
                </div>
              ) : (
                // Default command pattern for other fields
                <Command>
                  <CommandInput placeholder={`Filter ${getColumnLabel(column)}...`} />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {values.map((value) => {
                        const count = getFilterValueCount(field, value)
                        const isActive = isFilterActive(field, value)

                        return (
                          <CommandItem
                            key={String(value)}
                            onSelect={() => handleSelectValue(field, value)}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <span className={isActive ? "font-medium" : ""}>{String(value)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{count}</span>
                              {isActive && <Check className="h-4 w-4" />}
                            </div>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                    {getActiveFilter(field) && (
                      <>
                        <CommandSeparator />
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => clearFilter(field)}
                            className="justify-center text-sm text-muted-foreground"
                          >
                            <X className="h-3.5 w-3.5 mr-2" />
                            Clear filter
                          </CommandItem>
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              )}
            </PopoverContent>
          </Popover>
        )
      })}

      {/* Clear all filters button - only show if there are active filters */}
      {Object.keys(currentFilters).length > 0 && (
        <Button variant="ghost" size="sm" className="h-8" onClick={() => onFilterChange({})}>
          <X className="h-3.5 w-3.5 mr-1" />
          Clear all
        </Button>
      )}
    </div>
  )
}
