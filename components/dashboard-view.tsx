"use client"

import { useState, useMemo, useEffect } from "react"
import { Loader2, MoreHorizontal, ChevronDown, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DynamicTable } from "@/components/dynamic-table"
import { useViewData } from "@/hooks/use-view-data"
import type { ViewConfig, WidgetConfig, FilterConfig, SortConfig } from "@/config/types"
import { EntityPreviewPanel } from "@/components/entity-preview-panel"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface DashboardViewProps {
  view: ViewConfig
}

// Define a color palette for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#A4DE6C", "#D0ED57", "#FFC658"]

export function DashboardView({ view }: DashboardViewProps) {
  const [widgetStates, setWidgetStates] = useState<Record<string, { isLoading: boolean; error: Error | null }>>({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewEntityId, setPreviewEntityId] = useState<string | null>(null)
  const [previewEntityType, setPreviewEntityType] = useState<string>("")

  useEffect(() => {
    console.log(`DashboardView: Rendering with view ID ${view.id} (${view.label})`)
  }, [view.id, view.label])

  // Helper to update widget state
  const updateWidgetState = (widgetId: string, state: { isLoading?: boolean; error?: Error | null }) => {
    setWidgetStates((prev) => ({
      ...prev,
      [widgetId]: {
        isLoading: state.isLoading ?? prev[widgetId]?.isLoading ?? false,
        error: state.error ?? prev[widgetId]?.error ?? null,
      },
    }))
  }

  // Add a function to handle preview click
  const handlePreviewClick = (entityId: string, entityType: string) => {
    setPreviewEntityId(entityId)
    setPreviewEntityType(entityType)
    setPreviewOpen(true)
  }

  // Add a function to handle closing the preview panel
  const handlePreviewClose = (open: boolean) => {
    setPreviewOpen(open)
    if (!open) {
      // Clear the entity ID when closing to ensure clean state
      setTimeout(() => {
        setPreviewEntityId(null)
        setPreviewEntityType("")
      }, 300) // Small delay to ensure animations complete
    }
  }

  if (!view.widgets || view.widgets.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">This dashboard has no widgets configured.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {view.widgets.map((widget) => (
          <div
            key={widget.id}
            className={`
              ${widget.width === "full" ? "col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4" : ""}
              ${widget.width === "half" ? "col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-2" : ""}
              ${widget.width === "third" ? "col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1" : ""}
              ${widget.width === "quarter" ? "col-span-1" : ""}
            `}
          >
            <WidgetRenderer
              widget={widget}
              onStateChange={(state) => updateWidgetState(widget.id, state)}
              state={widgetStates[widget.id]}
              onPreviewClick={handlePreviewClick}
            />
          </div>
        ))}
      </div>
      <EntityPreviewPanel
        open={previewOpen}
        onOpenChange={handlePreviewClose}
        entityId={previewEntityId}
        entityType={previewEntityType}
      />
    </div>
  )
}

interface WidgetRendererProps {
  widget: WidgetConfig
  onStateChange: (state: { isLoading?: boolean; error?: Error | null }) => void
  state?: { isLoading: boolean; error: Error | null }
  onPreviewClick: (entityId: string, entityType: string) => void
}

function WidgetRenderer({ widget, onStateChange, state, onPreviewClick }: WidgetRendererProps) {
  // Create a minimal view config for the widget
  const widgetViewConfig = useMemo(
    () => ({
      id: `widget-${widget.id}`,
      label: widget.title,
      icon: "dashboard",
      description: "",
      type: "list",
      entity: widget.entity,
      columns: widget.columns || [],
      actions: [],
      filters: widget.filters,
      sort: widget.sort,
      limit: widget.limit,
    }),
    [widget],
  )

  // For chart widgets, ensure we request all necessary fields
  const fieldsToFetch = useMemo(() => {
    if (widget.type === "chart" && widget.fields) {
      // For pie and bar charts, we need to ensure we get all the data
      if (widget.chartType === "pie" || widget.chartType === "bar") {
        return ["id", ...widget.fields]
      }
      return ["id", ...widget.fields]
    }

    // For metric widgets, make sure we fetch the field needed for calculation
    if (widget.type === "metric" && widget.metricField) {
      if (widget.metricField === "count") {
        return ["id"] // Just need any field for counting
      }

      if (widget.metricField.includes(":")) {
        const [_, field] = widget.metricField.split(":")
        return ["id", field]
      }

      return ["id", widget.metricField]
    }

    // For card widgets, ensure we fetch all the fields specified
    if (widget.type === "card" && widget.fields) {
      return ["id", ...widget.fields]
    }

    return undefined
  }, [widget.type, widget.fields, widget.metricField, widget.chartType, widget.id])

  // Use the same data hook for consistency
  const { data, isLoading, error } = useViewData({
    view: widgetViewConfig,
    pagination: { page: 1, pageSize: 1000 }, // Use a large page size to get all data for aggregations
    fields: fieldsToFetch,
  })

  // Move state update to useEffect to avoid updating during render
  useEffect(() => {
    if (state?.isLoading !== isLoading || state?.error !== error) {
      onStateChange({ isLoading, error })
    }
  }, [isLoading, error, state, onStateChange])

  // Get widget height class based on size
  const getWidgetHeightClass = () => {
    if (widget.height) {
      return `widget-height-${widget.height}`
    }

    // Default mapping based on widget type
    if (widget.type === "metric") {
      return "widget-height-1x"
    } else if (widget.type === "chart" || widget.type === "card") {
      return "widget-height-2x"
    } else if (widget.type === "table") {
      return "widget-height-4x"
    }
    return "widget-height-2x"
  }

  // Format filter and sort information for tooltip
  const getFilterSortInfo = () => {
    const parts = []

    if (widget.filters && widget.filters.length > 0) {
      const filterInfo = widget.filters.map(formatFilterForDisplay).join(", ")
      parts.push(`Filtered by: ${filterInfo}`)
    }

    if (widget.sort && widget.sort.length > 0) {
      const sortInfo = widget.sort.map(formatSortForDisplay).join(", ")
      parts.push(`Sorted by: ${sortInfo}`)
    }

    return parts.join("\n")
  }

  // Format a filter for display
  const formatFilterForDisplay = (filter: FilterConfig) => {
    const operatorMap: Record<string, string> = {
      equals: "=",
      notEquals: "≠",
      contains: "contains",
      notContains: "not contains",
      greaterThan: ">",
      lessThan: "<",
      greaterThanOrEquals: "≥",
      lessThanOrEquals: "≤",
      in: "in",
    }

    const operator = operatorMap[filter.operator] || filter.operator
    const value = Array.isArray(filter.value) ? filter.value.join(", ") : filter.value

    return `${filter.label || filter.field} ${operator} ${value}`
  }

  // Format a sort for display
  const formatSortForDisplay = (sort: SortConfig) => {
    return `${sort.label || sort.field} (${sort.direction === "asc" ? "↑" : "↓"})`
  }

  // Handle loading state
  if (isLoading) {
    return (
      <Card className={`${getWidgetHeightClass()}`}>
        <CardHeader className="py-1 px-3">
          <CardTitle className="text-sm">{widget.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-0">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  // Handle error state
  if (error) {
    return (
      <Card className={`${getWidgetHeightClass()} border-destructive/50`}>
        <CardHeader className="py-1 px-3">
          <CardTitle className="text-sm">{widget.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <p className="text-destructive text-xs">Error: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  // Render the appropriate widget based on type
  switch (widget.type) {
    case "table":
      return (
        <Card className={getWidgetHeightClass()}>
          <CardHeader className="py-1 px-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-1">
              <CardTitle className="text-sm">{widget.title}</CardTitle>
              {(widget.filters?.length > 0 || widget.sort?.length > 0) && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                        <Info className="h-3 w-3 text-muted-foreground" />
                        <span className="sr-only">Widget information</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs whitespace-pre-line">{getFilterSortInfo()}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Refresh</DropdownMenuItem>
                <DropdownMenuItem>Export</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-0 widget-content-container">
            <div className="h-full overflow-auto scrollbar-container">
              <DynamicTable
                view={widgetViewConfig}
                data={data}
                isLoading={isLoading}
                error={error}
                onRowClick={(entityId) => {
                  if (widgetViewConfig.entity) {
                    onPreviewClick(entityId, widgetViewConfig.entity)
                  }
                }}
                className="compact-dashboard-table"
                hideFilters={widget.hideFilters !== false} // Hide by default
                hideSorts={widget.hideSorts !== false} // Hide by default
              />
              <div className="scroll-indicator">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      )

    case "metric":
      return <MetricWidget widget={widget} heightClass={getWidgetHeightClass()} data={data} />

    case "chart":
      return <ChartWidget widget={widget} heightClass={getWidgetHeightClass()} data={data} />

    case "card":
      return <CardWidget widget={widget} heightClass={getWidgetHeightClass()} data={data} />

    default:
      return (
        <Card className={`${getWidgetHeightClass()}`}>
          <CardHeader className="py-1 px-3">
            <CardTitle className="text-sm">{widget.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <p className="text-muted-foreground text-xs">Unknown widget type: {(widget as any).type}</p>
          </CardContent>
        </Card>
      )
  }
}

// Helper function to parse currency values
function parseCurrencyValue(value: string | number): number {
  if (typeof value === "number") return value
  if (typeof value !== "string") return 0

  // Handle values with M/B/K suffixes
  if (value.includes("M")) {
    return Number.parseFloat(value.replace(/[$M,]/g, "")) * 1000000
  } else if (value.includes("B")) {
    return Number.parseFloat(value.replace(/[$B,]/g, "")) * 1000000000
  } else if (value.includes("K")) {
    return Number.parseFloat(value.replace(/[$K,]/g, "")) * 1000
  }

  // Remove $ and commas, then parse as float
  return Number.parseFloat(value.replace(/[$,]/g, "")) || 0
}

// Custom metric widget that uses our dashboard card components
function MetricWidget({ widget, heightClass, data }: { widget: WidgetConfig; heightClass: string; data: any[] }) {
  // Calculate the metric value
  const calculateMetricValue = () => {
    if (!data || data.length === 0 || !widget.metricField) {
      return "N/A"
    }

    // For count metrics
    if (widget.metricField === "count") {
      return formatValue(data.length, widget.metricFormat)
    }

    // For sum, average, min, max metrics
    if (widget.metricField.includes(":")) {
      const [operation, field] = widget.metricField.split(":")

      // Extract values, handling currency strings
      const values = data.map((item) => {
        const value = item[field]

        if (value === undefined) {
          return 0
        }

        if (typeof value === "string") {
          // Handle currency strings like "$120,000"
          if (value.startsWith("$")) {
            // Handle values like "$25M" by converting M/B/K to actual numbers
            if (value.includes("M")) {
              return Number.parseFloat(value.replace(/[$M,]/g, "")) * 1000000
            } else if (value.includes("B")) {
              return Number.parseFloat(value.replace(/[$B,]/g, "")) * 1000000000
            } else if (value.includes("K")) {
              return Number.parseFloat(value.replace(/[$K,]/g, "")) * 1000
            }
            // Handle regular currency strings like "$120,000"
            return Number.parseFloat(value.replace(/[$,]/g, ""))
          }
          // Try to parse other string values as numbers
          const parsed = Number.parseFloat(value)
          return isNaN(parsed) ? 0 : parsed
        }
        return typeof value === "number" ? value : 0
      })

      if (values.length === 0) return "N/A"

      let result
      switch (operation) {
        case "sum":
          result = values.reduce((a, b) => a + b, 0)
          return formatValue(result, widget.metricFormat)
        case "avg":
          result = values.reduce((a, b) => a + b, 0) / values.length
          return formatValue(result, widget.metricFormat)
        case "min":
          result = Math.min(...values)
          return formatValue(result, widget.metricFormat)
        case "max":
          result = Math.max(...values)
          return formatValue(result, widget.metricFormat)
        default:
          return "N/A"
      }
    }

    // For single value metrics (first item's field)
    const value = data[0][widget.metricField]
    return formatValue(value, widget.metricFormat)
  }

  // Format the value based on the specified format
  const formatValue = (value: any, format?: string) => {
    if (value === undefined || value === null) return "N/A"

    if (typeof value === "string") {
      if (value.startsWith("$")) return value // Already formatted as currency
      return value
    }

    switch (format) {
      case "currency":
        // Format large numbers as $XXM or $XXB
        if (value >= 1000000000) {
          return `$${(value / 1000000000).toFixed(1)}B`
        } else if (value >= 1000000) {
          return `$${(value / 1000000).toFixed(1)}M`
        } else if (value >= 1000) {
          return `$${(value / 1000).toFixed(1)}K`
        }
        return `$${value.toLocaleString()}`
      case "percent":
        return `${typeof value === "number" ? value.toFixed(1) : value}%`
      case "number":
        // Format large numbers with K, M, B suffixes
        if (value >= 1000000000) {
          return `${(value / 1000000000).toFixed(1)}B`
        } else if (value >= 1000000) {
          return `${(value / 1000000).toFixed(1)}M`
        } else if (value >= 1000) {
          return `${(value / 1000).toFixed(1)}K`
        }
        return typeof value === "number" ? value.toLocaleString() : value
      default:
        return value
    }
  }

  // Get the trend value and direction
  const getTrend = () => {
    // This is a placeholder - in a real app, you'd calculate trends based on historical data
    const trendValue = Math.random() > 0.5 ? 5.2 : -3.8
    return {
      value: trendValue,
      direction: trendValue >= 0 ? "up" : "down",
    }
  }

  const metricValue = calculateMetricValue()
  const trend = getTrend()

  return (
    <Card className={heightClass}>
      <CardHeader className="py-1 px-3">
        <CardTitle className="text-sm">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center items-center p-2">
        <div className="text-2xl font-bold">{metricValue}</div>
        <p className={`text-xs ${trend.direction === "up" ? "text-green-500" : "text-red-500"} flex items-center mt-1`}>
          {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
        </p>
      </CardContent>
    </Card>
  )
}

// Custom chart widget that uses our dashboard card components
function ChartWidget({ widget, heightClass, data }: { widget: WidgetConfig; heightClass: string; data: any[] }) {
  // Process data for the chart based on widget configuration
  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !widget.fields || widget.fields.length < 1) {
      return []
    }

    // For pie and donut charts
    if (widget.chartType === "pie" || widget.chartType === "donut") {
      const categoryField = widget.fields[0] // First field is the category
      const valueField = widget.fields[1] || "value" // Second field is the value, default to "value"

      // Group data by category
      const groupedData: Record<string, number> = {}

      data.forEach((item) => {
        const category = item[categoryField] || "Unknown"

        // For deals-by-phase, count deals instead of summing values
        if (widget.id === "deals-by-phase") {
          groupedData[category] = (groupedData[category] || 0) + 1
          return
        }

        // For numeric values
        if (typeof item[valueField] === "number") {
          groupedData[category] = (groupedData[category] || 0) + item[valueField]
          return
        }

        // For currency values (strings with $ sign)
        if (
          typeof item[valueField] === "string" &&
          (item[valueField].includes("$") ||
            item[valueField].includes("M") ||
            item[valueField].includes("K") ||
            item[valueField].includes("B"))
        ) {
          const numericValue = parseCurrencyValue(item[valueField])
          groupedData[category] = (groupedData[category] || 0) + numericValue
          return
        }

        // Count occurrences if no numeric value is available
        groupedData[category] = (groupedData[category] || 0) + 1
      })

      // Convert to array format for Recharts
      return Object.entries(groupedData).map(([name, value]) => ({
        name,
        value,
      }))
    }

    // For bar charts
    if (widget.chartType === "bar") {
      const categoryField = widget.fields[0] // First field is the category
      const valueField = widget.fields[1] || "value" // Second field is the value, default to "value"

      // Group data by category
      const groupedData: Record<string, number> = {}

      data.forEach((item) => {
        const category = item[categoryField] || "Unknown"

        // For numeric values
        if (typeof item[valueField] === "number") {
          groupedData[category] = (groupedData[category] || 0) + item[valueField]
          return
        }

        // For currency values (strings with $ sign)
        if (
          typeof item[valueField] === "string" &&
          (item[valueField].includes("$") ||
            item[valueField].includes("M") ||
            item[valueField].includes("K") ||
            item[valueField].includes("B"))
        ) {
          const numericValue = parseCurrencyValue(item[valueField])
          groupedData[category] = (groupedData[category] || 0) + numericValue
          return
        }

        // Count occurrences if no numeric value is available
        groupedData[category] = (groupedData[category] || 0) + 1
      })

      // Convert to array format for Recharts
      return Object.entries(groupedData)
        .map(([name, value]) => ({
          name,
          value,
        }))
        .sort((a, b) => b.value - a.value) // Sort by value descending
    }

    // For line charts, we can use the data as is
    return data.map((item) => {
      const result: Record<string, any> = { name: item[widget.fields[0]] || "Unknown" }

      // Add all other fields as values
      for (let i = 1; i < widget.fields.length; i++) {
        const field = widget.fields[i]

        // Handle currency values
        if (typeof item[field] === "string" && item[field].startsWith("$")) {
          result[field] = Number.parseFloat(item[field].replace(/[$,]/g, ""))
        } else {
          result[field] = item[field]
        }
      }

      return result
    })
  }, [data, widget.fields, widget.chartType, widget.id])

  // Render the appropriate chart based on the widget type
  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground text-xs">No data available</p>
        </div>
      )
    }

    switch (widget.chartType) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={0} outerRadius={80} fill="#8884d8" dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value, name, props) => {
                  return [`${value}`, name]
                }}
              />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        )

      case "donut":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value, name, props) => {
                  return [`${value}`, name]
                }}
              />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        )

      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 5,
                right: 10,
                left: 60,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={60}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => (value.length > 10 ? `${value.substring(0, 10)}...` : value)}
              />
              <RechartsTooltip />
              <Bar dataKey="value" fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <RechartsTooltip />
              {widget.fields.slice(1).map((field, index) => (
                <Line
                  key={field}
                  type="monotone"
                  dataKey={field}
                  stroke={COLORS[index % COLORS.length]}
                  activeDot={{ r: 6 }}
                />
              ))}
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </LineChart>
          </ResponsiveContainer>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-xs">Unsupported chart type: {widget.chartType}</p>
          </div>
        )
    }
  }

  return (
    <Card className={heightClass}>
      <CardHeader className="py-1 px-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">{widget.title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-3.5 w-3.5" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Refresh</DropdownMenuItem>
            <DropdownMenuItem>Export</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-0 widget-content-container">
        <div className="h-full">{renderChart()}</div>
      </CardContent>
    </Card>
  )
}

// Custom card widget that uses our dashboard card components
function CardWidget({ widget, heightClass, data }: { widget: WidgetConfig; heightClass: string; data: any[] }) {
  // Get the first item from the data
  const item = data && data.length > 0 ? data[0] : null

  if (!item) {
    return (
      <Card className={heightClass}>
        <CardHeader className="py-1 px-3">
          <CardTitle className="text-sm">{widget.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <p className="text-muted-foreground text-xs">No data available</p>
        </CardContent>
      </Card>
    )
  }

  // Get the route for the entity detail page
  const getEntityDetailRoute = (entityId: string) => {
    switch (widget.entity) {
      case "deals":
        return `/deals/details?id=${entityId}`
      case "contacts":
        return `/contacts/details?id=${entityId}`
      case "clients":
        return `/clients/details?id=${entityId}`
      default:
        return `/${widget.entity}/details?id=${entityId}`
    }
  }

  // Format field labels for display
  const formatFieldLabel = (field: string): string => {
    // Convert camelCase to Title Case
    return field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
  }

  // Format field values for display
  const formatFieldValue = (value: any, field: string): string => {
    if (value === undefined || value === null) return "N/A"

    // Handle currency values
    if (typeof value === "string" && value.startsWith("$")) {
      return value
    }

    // Handle revenue field specifically
    if (field === "revenue" && typeof value === "number") {
      return `$${value.toLocaleString()}`
    }

    return String(value)
  }

  return (
    <Card className={heightClass}>
      <CardHeader className="py-1 px-3">
        <Link href={getEntityDetailRoute(item.id)} className="hover:underline">
          <CardTitle className="text-sm">{widget.title}</CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="p-0 widget-content-container">
        <div className="divide-y overflow-auto scrollbar-container">
          {widget.fields?.map((field, index) => (
            <div key={field} className="flex justify-between items-center px-3 py-1">
              <span className="text-xs font-medium text-muted-foreground">{formatFieldLabel(field)}:</span>
              {index === 0 ? (
                <Link href={getEntityDetailRoute(item.id)} className="text-xs font-medium text-primary hover:underline">
                  {formatFieldValue(item[field], field)}
                </Link>
              ) : (
                <span className="text-xs font-medium">{formatFieldValue(item[field], field)}</span>
              )}
            </div>
          ))}
          {widget.fields && widget.fields.length > 5 && (
            <div className="scroll-indicator">
              <ChevronDown className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
