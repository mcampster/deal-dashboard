"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Search, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { getSchemaForEntity } from "@/lib/schema-utils"
import type { ColumnConfig, FilterOperator, FilterState, ViewConfig } from "@/config/types"

interface JiraStyleFilterBarProps {
  columns: ColumnConfig[]
  onFilterChange: (filters: FilterState) => void
  currentFilters?: FilterState
  view: ViewConfig
  onSearch?: (searchTerm: string) => void
}

export function JiraStyleFilterBar({
  columns,
  onFilterChange,
  currentFilters = {},
  view,
  onSearch,
}: JiraStyleFilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<FilterState>(currentFilters)
  const [searchTerm, setSearchTerm] = useState("")
  const [openPopover, setOpenPopover] = useState<string | null>(null)

  // Get schema for the current entity
  const entitySchema = view.entity ? getSchemaForEntity(view.entity) : null

  // Update active filters when currentFilters changes
  useEffect(() => {
    setActiveFilters(currentFilters)
  }, [currentFilters])

  // Handle search input
  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm)
    } else if (searchTerm.trim()) {
      // If no onSearch handler, apply a generic text search filter
      const newFilters = { ...activeFilters }

      // Use the first text column as the search field, or fallback to a generic search
      const textColumn = columns.find((col) => col.type === "text" || !col.type)
      if (textColumn) {
        newFilters[textColumn.field] = {
          operator: "contains",
          value: searchTerm.trim(),
        }
      }

      setActiveFilters(newFilters)
      onFilterChange(newFilters)
    }
  }

  // Handle key press in search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({})
    onFilterChange({})
  }

  // Remove a specific filter
  const removeFilter = (field: string) => {
    const newFilters = { ...activeFilters }
    delete newFilters[field]
    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  // Apply a filter
  const applyFilter = (field: string, operator: FilterOperator, value: string | number | (string | number)[]) => {
    console.log(`Applying filter: ${field} ${operator} ${JSON.stringify(value)}`)

    const newFilters = {
      ...activeFilters,
      [field]: {
        operator,
        value,
      },
    }

    console.log("New filters:", newFilters)
    setActiveFilters(newFilters)
    onFilterChange(newFilters)
    setOpenPopover(null) // Close the popover after applying filter
  }

  // Get filterable columns
  const getFilterableColumns = (): ColumnConfig[] => {
    return columns.filter((col) => col.filterable !== false)
  }

  // Format filter value for display
  const formatFilterValue = (
    field: string,
    filter: { operator: FilterOperator; value: string | number | (string | number)[] },
  ): string => {
    const column = columns.find((col) => col.field === field)

    if (!column) return `${field}: ${filter.value}`

    if (Array.isArray(filter.value)) {
      if (filter.value.length === 0) return `${column.label}: None`
      if (filter.value.length === 1) return `${column.label}: ${filter.value[0]}`
      return `${column.label}: ${filter.value.length} selected`
    }

    if (column.type === "currency") {
      if (filter.operator === ">=" && typeof filter.value === "number") {
        return `${column.label}: ≥ $${filter.value.toLocaleString()}`
      }
      if (filter.operator === "<=" && typeof filter.value === "number") {
        return `${column.label}: ≤ $${filter.value.toLocaleString()}`
      }
      if (typeof filter.value === "number") {
        return `${column.label}: $${filter.value.toLocaleString()}`
      }
    }

    if (column.type === "date") {
      if (filter.operator === ">=" && filter.value) {
        return `${column.label}: After ${filter.value}`
      }
      if (filter.operator === "<=" && filter.value) {
        return `${column.label}: Before ${filter.value}`
      }
    }

    return `${column.label}: ${filter.value}`
  }

  // Get field schema from entity schema
  const getFieldSchema = (field: string) => {
    if (!entitySchema || !entitySchema.properties) return null
    return entitySchema.properties[field] || null
  }

  // Get enum values for a field from schema
  const getEnumValuesFromSchema = (field: string): string[] | null => {
    const fieldSchema = getFieldSchema(field)
    if (!fieldSchema || !fieldSchema.enum) return null
    return fieldSchema.enum as string[]
  }

  // Determine if a field is an enum type
  const isEnumField = (field: string): boolean => {
    const fieldSchema = getFieldSchema(field)
    return !!(fieldSchema && fieldSchema.enum && fieldSchema.enum.length > 0)
  }

  // Get unique values for a column
  const getUniqueValues = (columnField: string): string[] => {
    // First check if the field has enum values in the schema
    const enumValues = getEnumValuesFromSchema(columnField)
    if (enumValues) return enumValues

    // If not an enum, return sample values based on field name
    // This would normally fetch from the database
    const column = columns.find((col) => col.field === columnField)

    if (!column) return []

    switch (column.field) {
      case "status":
        return ["Active", "Inactive", "Pending", "Completed"]
      case "stage":
        return ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]
      case "industry":
        return ["Technology", "Finance", "Healthcare", "Manufacturing", "Retail"]
      case "size":
        return ["Small", "Medium", "Large", "Enterprise"]
      case "location":
        return ["North America", "Europe", "Asia", "South America", "Africa", "Australia"]
      case "role":
        return ["CEO", "CTO", "CFO", "Manager", "Director", "VP"]
      case "type":
        return ["Meeting", "Call", "Email", "Task"]
      case "client":
        return ["Acme Corp", "Globex", "Initech", "Umbrella Corp", "Stark Industries"]
      default:
        return ["Value 1", "Value 2", "Value 3"]
    }
  }

  // Determine the appropriate filter control type for a column
  const getFilterControlType = (column: ColumnConfig): "text" | "enum" | "number" | "date" => {
    // Check schema first
    const fieldSchema = getFieldSchema(column.field)

    if (fieldSchema) {
      // If it has enum values, it's an enum type
      if (fieldSchema.enum && fieldSchema.enum.length > 0) {
        return "enum"
      }

      // Check type from schema
      if (fieldSchema.type === "number" || fieldSchema.type === "integer") {
        return "number"
      }

      if (fieldSchema.type === "string") {
        if (fieldSchema.format === "date" || fieldSchema.format === "date-time") {
          return "date"
        }
      }
    }

    // Fallback to column type
    switch (column.type) {
      case "currency":
      case "number":
        return "number"
      case "date":
        return "date"
      default:
        // For text fields, check if it's likely an enum based on field name
        if (["status", "stage", "type", "industry", "size", "priority"].includes(column.field)) {
          return "enum"
        }
        return "text"
    }
  }

  // Render filter control based on column type
  const renderFilterControl = useCallback(
    (column: ColumnConfig) => {
      // Get the current filter for this column
      const currentFilter = activeFilters[column.field] as { operator: FilterOperator; value: any } | undefined

      // Determine the appropriate filter control type
      const controlType = getFilterControlType(column)

      // Initialize state for different control types
      const initialMinValue =
        currentFilter?.operator === ">=" && controlType === "number" ? Number(currentFilter.value) : 0
      const initialMaxValue =
        currentFilter?.operator === "<=" && controlType === "number" ? Number(currentFilter.value) : 1000000
      const initialStartDate =
        currentFilter?.operator === ">=" && controlType === "date" ? String(currentFilter.value) : ""
      const initialEndDate =
        currentFilter?.operator === "<=" && controlType === "date" ? String(currentFilter.value) : ""
      const initialTextValue =
        controlType === "text" && currentFilter?.operator === "contains" ? String(currentFilter.value) : ""

      const [minValue, setMinValue] = useState<number>(initialMinValue)
      const [maxValue, setMaxValue] = useState<number>(initialMaxValue)
      const [startDate, setStartDate] = useState<string>(initialStartDate)
      const [endDate, setEndDate] = useState<string>(initialEndDate)
      const [textValue, setTextValue] = useState<string>(initialTextValue)

      // Initialize selected values from current filter
      const initialSelectedValues = (() => {
        if (!currentFilter) return []
        if (currentFilter.operator === "in" && Array.isArray(currentFilter.value)) {
          return currentFilter.value as string[]
        }
        if (currentFilter.operator === "=" || currentFilter.operator === "equals") {
          return [currentFilter.value as string]
        }
        return []
      })()

      const [selectedValues, setSelectedValues] = useState<string[]>(initialSelectedValues)
      const [searchValue, setSearchValue] = useState("")

      switch (controlType) {
        case "number": {
          return (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Minimum Value</Label>
                <div className="flex items-center gap-2">
                  {column.type === "currency" && <span>$</span>}
                  <Input
                    type="number"
                    value={minValue}
                    onChange={(e) => setMinValue(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Maximum Value</Label>
                <div className="flex items-center gap-2">
                  {column.type === "currency" && <span>$</span>}
                  <Input
                    type="number"
                    value={maxValue}
                    onChange={(e) => setMaxValue(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setOpenPopover(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    // Apply min value filter (using standard operator format)
                    if (minValue > 0) {
                      applyFilter(column.field, ">=", minValue)
                    } else if (maxValue < 1000000) {
                      // Apply max value filter
                      applyFilter(column.field, "<=", maxValue)
                    } else {
                      // Remove filter if no constraints
                      removeFilter(column.field)
                    }
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          )
        }

        case "date": {
          return (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setOpenPopover(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    // Apply date range filter
                    if (startDate) {
                      applyFilter(column.field, ">=", startDate)
                    } else if (endDate) {
                      applyFilter(column.field, "<=", endDate)
                    } else {
                      removeFilter(column.field)
                    }
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          )
        }

        case "text": {
          return (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Contains Text</Label>
                <Input
                  type="text"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder={`Search ${column.label.toLowerCase()}...`}
                  className="w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setOpenPopover(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (textValue.trim()) {
                      applyFilter(column.field, "contains", textValue.trim())
                    } else {
                      removeFilter(column.field)
                    }
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          )
        }

        case "enum": {
          // Get options from schema or fallback to predefined values
          const options = getUniqueValues(column.field)

          const [localSearchValue, setLocalSearchValue] = useState("")
          const [localSelectedValues, setLocalSelectedValues] = useState<string[]>(initialSelectedValues)

          const filteredOptions = options.filter((option) =>
            option.toLowerCase().includes(localSearchValue.toLowerCase()),
          )

          const toggleOption = (option: string) => {
            if (localSelectedValues.includes(option)) {
              setLocalSelectedValues(localSelectedValues.filter((v) => v !== option))
            } else {
              setLocalSelectedValues([...localSelectedValues, option])
            }
          }

          return (
            <div className="p-2 space-y-2">
              <Input
                placeholder="Search..."
                value={localSearchValue}
                onChange={(e) => setLocalSearchValue(e.target.value)}
                className="w-full"
              />

              <div className="max-h-[200px] overflow-y-auto space-y-1 py-1">
                {filteredOptions.length === 0 ? (
                  <div className="px-2 py-1 text-sm text-muted-foreground">No options found</div>
                ) : (
                  filteredOptions.map((option) => (
                    <div
                      key={option}
                      className="flex items-center space-x-2 px-2 py-1 hover:bg-muted rounded-sm cursor-pointer"
                      onClick={() => toggleOption(option)}
                    >
                      <Checkbox
                        checked={localSelectedValues.includes(option)}
                        onCheckedChange={() => toggleOption(option)}
                      />
                      <span className="text-sm">{option}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <Button variant="ghost" size="sm" onClick={() => setLocalSelectedValues([])} className="text-xs h-7">
                  Clear
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setOpenPopover(null)} className="h-7">
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (localSelectedValues.length > 0) {
                        if (localSelectedValues.length === 1) {
                          // For single value, use equals operator for better compatibility
                          applyFilter(column.field, "=", localSelectedValues[0])
                        } else {
                          // For multiple values, use the "in" operator
                          applyFilter(column.field, "in", localSelectedValues)
                        }
                      } else {
                        removeFilter(column.field)
                      }
                    }}
                    className="h-7"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          )
        }
      }
    },
    [activeFilters, getUniqueValues, removeFilter, isEnumField, getEnumValuesFromSchema, getFilterControlType],
  )

  const filterableColumns = getFilterableColumns()

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 border rounded-md p-1 bg-background">
        {/* Filterable columns */}
        {filterableColumns.map((column) => (
          <Popover
            key={column.field}
            open={openPopover === column.field}
            onOpenChange={(open) => {
              if (open) {
                setOpenPopover(column.field)
              } else if (openPopover === column.field) {
                setOpenPopover(null)
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-8 px-2 text-sm flex items-center gap-1 border-0 hover:bg-muted",
                  activeFilters[column.field] && "bg-primary/10 text-primary",
                )}
              >
                {column.label}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0" align="start">
              {renderFilterControl(column)}
            </PopoverContent>
          </Popover>
        ))}

        {/* Search input */}
        <div className="flex-1 flex items-center min-w-[150px]">
          <Input
            type="text"
            placeholder="Contains text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyPress}
            className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* Search button */}
        <Button variant="ghost" size="icon" className="h-8 w-8 border-0 hover:bg-muted" onClick={handleSearch}>
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </div>

      {/* Active filters */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(activeFilters).map(([field, filter]) => {
            // Skip special fields like $or that are used for advanced filtering
            if (field === "$or") return null

            return (
              <Badge key={field} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                <span>
                  {formatFilterValue(
                    field,
                    filter as { operator: FilterOperator; value: string | number | (string | number)[] },
                  )}
                </span>
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => removeFilter(field)}>
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove filter</span>
                </Button>
              </Badge>
            )
          })}

          {/* Clear all button */}
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
