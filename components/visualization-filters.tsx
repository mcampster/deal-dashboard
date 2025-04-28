"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts"
import { Badge } from "@/components/ui/badge"
import { X, ChevronDown, ChevronUp, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ViewConfig, FilterState } from "@/config/types"
import { cn } from "@/lib/utils"

// Define a color palette for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#A4DE6C", "#D0ED57", "#FFC658"]

interface VisualizationFiltersProps {
  view: ViewConfig
  data: any[]
  onFilterChange: (filters: FilterState) => void
  currentFilters: FilterState
}

export interface VisualizationConfig {
  field: string
  type: "donut" | "pie" | "bar"
  title: string
  width?: "full" | "half" | "third" | "quarter"
}

export function VisualizationFilters({ view, data, onFilterChange, currentFilters }: VisualizationFiltersProps) {
  const [activeSegments, setActiveSegments] = useState<Record<string, string | null>>({})
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // Get visualization configs from the view
  const visualizations = useMemo(() => {
    return view.visualizations || []
  }, [view])

  // If no visualizations are configured, don't render anything
  if (!visualizations.length) {
    return null
  }

  // Process data for each visualization
  const getChartData = (field: string) => {
    if (!data || data.length === 0) return []

    // Group data by the field value
    const groupedData: Record<string, number> = {}

    data.forEach((item) => {
      const value = item[field] || "Unknown"
      groupedData[value] = (groupedData[value] || 0) + 1
    })

    // Convert to array format for Recharts
    return Object.entries(groupedData).map(([name, value]) => ({
      name,
      value,
    }))
  }

  // Handle clicking on a chart segment
  const handleSegmentClick = (field: string, value: string) => {
    // If the segment is already active, remove the filter
    if (activeSegments[field] === value) {
      const newFilters = { ...currentFilters }
      delete newFilters[field]
      onFilterChange(newFilters)

      // Update active segments
      const newActiveSegments = { ...activeSegments }
      delete newActiveSegments[field]
      setActiveSegments(newActiveSegments)
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

      // Update active segments
      setActiveSegments({
        ...activeSegments,
        [field]: value,
      })
    }
  }

  // Clear filter for a specific field
  const clearFilter = (field: string) => {
    const newFilters = { ...currentFilters }
    delete newFilters[field]
    onFilterChange(newFilters)

    // Update active segments
    const newActiveSegments = { ...activeSegments }
    delete newActiveSegments[field]
    setActiveSegments(newActiveSegments)
  }

  // Get width class based on configuration
  const getWidthClass = (width?: "full" | "half" | "third" | "quarter") => {
    switch (width) {
      case "full":
        return "col-span-full"
      case "half":
        return "col-span-1 md:col-span-2"
      case "third":
        return "col-span-1"
      case "quarter":
        return "col-span-1 md:col-span-1 lg:col-span-1"
      default:
        return "col-span-1"
    }
  }

  // Render active shape with subtle animation
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 4}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          strokeWidth={0}
          className="transition-all duration-300 ease-in-out"
        />
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#333" className="text-xs font-medium">
          {payload.name}
        </text>
        <text x={cx} y={cy + 15} textAnchor="middle" fill="#666" className="text-xs">
          {payload.value}
        </text>
      </g>
    )
  }

  // Simple tooltip component
  const SimpleTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 text-xs border rounded shadow-sm transition-opacity duration-300 ease-in-out">
          <p>{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  // Count active filters
  const activeFilterCount = Object.keys(activeSegments).length

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 h-8 px-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="sr-only md:not-sr-only">Analytics</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
            {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
          </Button>

          {/* Show active filters inline when collapsed */}
          {!isExpanded && activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              {Object.entries(activeSegments).map(([field, value]) => (
                <Badge key={field} variant="outline" className="flex items-center gap-1 h-7 px-2 text-xs">
                  {field}: {value}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearFilter(field)
                    }}
                  />
                </Badge>
              ))}

              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Clear all filters
                    onFilterChange({})
                    setActiveSegments({})
                  }}
                  className="h-7 px-2 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-3 gap-3 transition-all duration-300 mt-3",
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 overflow-hidden",
        )}
      >
        {visualizations.map((viz) => {
          const chartData = getChartData(viz.field)
          const isActive = activeSegments[viz.field] !== undefined
          const activeIndex = isActive ? chartData.findIndex((item) => item.name === activeSegments[viz.field]) : null

          return (
            <Card key={viz.field} className={getWidthClass(viz.width)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{viz.title}</CardTitle>
                  {isActive && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => clearFilter(viz.field)}
                    >
                      {activeSegments[viz.field]} <X className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={viz.type === "donut" ? 40 : 0}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        onClick={(data) => handleSegmentClick(viz.field, data.name)}
                        onMouseEnter={(_, index) => setHoverIndex(index)}
                        onMouseLeave={() => setHoverIndex(null)}
                        activeIndex={hoverIndex !== null ? hoverIndex : activeIndex}
                        activeShape={renderActiveShape}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            style={{
                              opacity: activeSegments[viz.field] && activeSegments[viz.field] !== entry.name ? 0.4 : 1,
                              cursor: "pointer",
                              stroke: activeSegments[viz.field] === entry.name ? "#fff" : "none",
                              strokeWidth: activeSegments[viz.field] === entry.name ? 2 : 0,
                              transition: "opacity 0.3s ease, stroke-width 0.3s ease",
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={<SimpleTooltip />}
                        wrapperStyle={{ transition: "opacity 0.3s ease", pointerEvents: "none" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
