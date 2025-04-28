"use client"

import { useState, useEffect, useMemo } from "react"
import { X, SlidersHorizontal, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AdvancedFilterPanel } from "@/components/advanced-filter-panel"
import { mockDatabase } from "@/lib/mock-data"
import type { ColumnConfig, FilterOperator, FilterState, ViewConfig } from "@/config/types"

interface QuickFilterBarProps {
  columns: ColumnConfig[]
  onFilterChange: (filters: FilterState) => void
  currentFilters?: FilterState
  placeholder?: string
  view: ViewConfig
}

export function QuickFilterBar({
  columns,
  onFilterChange,
  currentFilters = {},
  placeholder = "Filter...",
  view,
}: QuickFilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<FilterState>(currentFilters)
  const [selectedColumn, setSelectedColumn] = useState<string>("")
  const [operator, setOperator] = useState<FilterOperator>("contains")
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState<string>("")
  const [openValuePopover, setOpenValuePopover] = useState(false)

  // Update active filters when currentFilters changes
  useEffect(() => {
    setActiveFilters(currentFilters)
  }, [currentFilters])

  // Get unique values for the selected column from the mock database
  const uniqueValues = useMemo(() => {
    if (!selectedColumn) return []

    const entity = view.entity
    if (!entity || !mockDatabase[entity as keyof typeof mockDatabase]) return []

    const data = mockDatabase[entity as keyof typeof mockDatabase] as any[]

    // Get unique values for the selected field
    const values = data.map((item) => item[selectedColumn])
    const uniqueValues = Array.from(new Set(values)).filter(Boolean)

    // Sort values
    return uniqueValues.sort((a, b) => {
      if (typeof a === "string" && typeof b === "string") {
        return a.localeCompare(b)
      }
      return String(a).localeCompare(String(b))
    })
  }, [selectedColumn, view.entity])

  // Get predefined values for certain column types
  const getPredefinedValues = (columnKey: string): string[] => {
    const column = columns.find((col) => col.field === columnKey)
    if (!column) return []

    switch (column.type) {
      case "date":
        return ["Today", "Yesterday", "This week", "Last week", "This month", "Last month"]
      case "currency":
        return ["Under $10,000", "$10,000 - $50,000", "$50,000 - $100,000", "Over $100,000"]
      default:
        return uniqueValues.map(String)
    }
  }

  // Apply the filter
  const applyFilter = () => {
    if (!selectedColumn || !selectedValue) return

    // Handle predefined date ranges
    if (columns.find((col) => col.field === selectedColumn)?.type === "date") {
      const now = new Date()
      let dateValue: string

      switch (selectedValue) {
        case "Today":
          dateValue = now.toISOString().split("T")[0]
          break
        case "Yesterday":
          const yesterday = new Date(now)
          yesterday.setDate(yesterday.getDate() - 1)
          dateValue = yesterday.toISOString().split("T")[0]
          break
        case "This week":
          // This is simplified - would need more complex logic in a real app
          dateValue = "this week"
          break
        case "Last week":
          dateValue = "last week"
          break
        case "This month":
          dateValue = "this month"
          break
        case "Last month":
          dateValue = "last month"
          break
        default:
          dateValue = selectedValue
      }

      const newFilters = {
        ...activeFilters,
        [selectedColumn]: {
          operator,
          value: dateValue,
        },
      }

      setActiveFilters(newFilters)
      onFilterChange(newFilters)
    }
    // Handle predefined currency ranges
    else if (columns.find((col) => col.field === selectedColumn)?.type === "currency") {
      let currencyOperator: FilterOperator
      let currencyValue: string

      switch (selectedValue) {
        case "Under $10,000":
          currencyOperator = "<"
          currencyValue = "$10,000"
          break
        case "Over $100,000":
          currencyOperator = ">"
          currencyValue = "$100,000"
          break
        case "$10,000 - $50,000":
          // In a real app, we'd handle ranges differently
          currencyOperator = ">"
          currencyValue = "$10,000"
          // We'd add another condition for the upper bound
          break
        case "$50,000 - $100,000":
          currencyOperator = ">"
          currencyValue = "$50,000"
          // We'd add another condition for the upper bound
          break
        default:
          currencyOperator = operator
          currencyValue = selectedValue
      }

      const newFilters = {
        ...activeFilters,
        [selectedColumn]: {
          operator: currencyOperator,
          value: currencyValue,
        },
      }

      setActiveFilters(newFilters)
      onFilterChange(newFilters)
    }
    // Handle regular values
    else {
      const newFilters = {
        ...activeFilters,
        [selectedColumn]: {
          operator,
          value: selectedValue,
        },
      }

      setActiveFilters(newFilters)
      onFilterChange(newFilters)
    }

    // Reset the selection
    setSelectedValue("")
    setOpenValuePopover(false)
  }

  // Remove a filter
  const removeFilter = (field: string) => {
    const newFilters = { ...activeFilters }
    delete newFilters[field]

    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({})
    onFilterChange({})
  }

  // Get appropriate operators based on column type
  const getOperatorsForColumn = (columnKey: string): { value: FilterOperator; label: string }[] => {
    const column = columns.find((col) => col.field === columnKey)

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

  // Format filter value for display
  const formatFilterValue = (field: string, filter: { operator: FilterOperator; value: string | number }): string => {
    const column = columns.find((col) => col.field === field)
    const operatorLabel =
      getOperatorsForColumn(field).find((op) => op.value === filter.operator)?.label || filter.operator

    return `${column?.label || field} ${operatorLabel} ${filter.value}`
  }

  // Determine if we should show the command menu or radio group
  const shouldUseCommandMenu = (columnKey: string): boolean => {
    const column = columns.find((col) => col.field === columnKey)
    if (!column) return true

    // Use radio buttons for date and currency predefined options
    return !["date", "currency"].includes(column.type)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Column selector */}
        <Select
          value={selectedColumn}
          onValueChange={(value) => {
            setSelectedColumn(value)
            setOperator(getOperatorsForColumn(value)[0].value)
            setSelectedValue("")
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {columns.map((column) => (
              <SelectItem key={column.key} value={column.field}>
                {column.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Operator selector - only show if column is selected */}
        {selectedColumn && (
          <Select value={operator} onValueChange={(value) => setOperator(value as FilterOperator)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              {getOperatorsForColumn(selectedColumn).map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Value selector - only show if column is selected */}
        {selectedColumn && (
          <Popover open={openValuePopover} onOpenChange={setOpenValuePopover}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-start">
                {selectedValue || "Select value..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              {shouldUseCommandMenu(selectedColumn) ? (
                <Command>
                  <CommandInput placeholder="Search values..." />
                  <CommandList>
                    <CommandEmpty>No values found.</CommandEmpty>
                    <CommandGroup>
                      {getPredefinedValues(selectedColumn).map((value) => (
                        <CommandItem
                          key={value}
                          value={value}
                          onSelect={(currentValue) => {
                            setSelectedValue(currentValue)
                            setOpenValuePopover(false)
                          }}
                        >
                          <Check className={`mr-2 h-4 w-4 ${selectedValue === value ? "opacity-100" : "opacity-0"}`} />
                          {value}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              ) : (
                <div className="p-2">
                  <RadioGroup
                    value={selectedValue}
                    onValueChange={setSelectedValue}
                    className="flex flex-col space-y-1"
                  >
                    {getPredefinedValues(selectedColumn).map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <RadioGroupItem value={value} id={`value-${value}`} />
                        <Label htmlFor={`value-${value}`}>{value}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}

        {/* Apply filter button */}
        <Button onClick={applyFilter} disabled={!selectedColumn || !selectedValue}>
          Add Filter
        </Button>

        {/* Advanced filter button */}
        <Button variant="outline" onClick={() => setAdvancedFilterOpen(true)} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Advanced
        </Button>

        {/* Clear all filters button - only show if there are active filters */}
        {Object.keys(activeFilters).length > 0 && (
          <Button variant="outline" onClick={clearAllFilters}>
            Clear All
          </Button>
        )}
      </div>

      {/* Active filters */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(activeFilters).map(([field, filter]) => {
            // Skip special fields like $or that are used for advanced filtering
            if (field === "$or") return null

            return (
              <Badge key={field} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                <span>{formatFilterValue(field, filter as { operator: FilterOperator; value: string | number })}</span>
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => removeFilter(field)}>
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove filter</span>
                </Button>
              </Badge>
            )
          })}

          {/* Show a special badge for advanced OR filters */}
          {activeFilters.$or && (
            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 bg-primary/20">
              <span>Advanced OR Filter</span>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => removeFilter("$or")}>
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Advanced Filter Panel */}
      <AdvancedFilterPanel
        view={view}
        open={advancedFilterOpen}
        onOpenChange={setAdvancedFilterOpen}
        onApplyFilters={onFilterChange}
        currentFilters={activeFilters}
      />
    </div>
  )
}
