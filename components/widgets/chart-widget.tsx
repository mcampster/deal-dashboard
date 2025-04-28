"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"
import type { WidgetConfig } from "@/config/types"

// Add imports for the dropdown menu and preview panel
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EntityPreviewPanel } from "@/components/entity-preview-panel"
import Link from "next/link"

interface ChartWidgetProps {
  widget: WidgetConfig
  data: any[]
}

// Define a color palette for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#A4DE6C", "#D0ED57", "#FFC658"]

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

export function ChartWidget({ widget, data }: ChartWidgetProps) {
  // Add state for the preview panel
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewEntityId, setPreviewEntityId] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)

  // Add a function to handle preview click
  const handlePreviewClick = (entityId: string) => {
    setPreviewEntityId(entityId)
    setPreviewOpen(true)
  }

  // Add a function to handle closing the preview panel
  const handlePreviewClose = (open: boolean) => {
    setPreviewOpen(open)
    if (!open) {
      // Clear the entity ID when closing to ensure clean state
      setTimeout(() => {
        setPreviewEntityId(null)
      }, 300) // Small delay to ensure animations complete
    }
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

  // Process data for the chart based on widget configuration
  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !widget.fields || widget.fields.length < 1) {
      console.log(`No data or fields for widget ${widget.id}`)
      return []
    }

    // For debugging
    if (debugMode) {
      console.log(`Processing chart data for ${widget.id}:`, {
        dataLength: data.length,
        fields: widget.fields,
        chartType: widget.chartType,
        sampleData: data.slice(0, 3),
      })
    }

    // For pie and donut charts
    if (widget.chartType === "pie" || widget.chartType === "donut") {
      const categoryField = widget.fields[0] // First field is the category
      const valueField = widget.fields[1] || "value" // Second field is the value, default to "value"

      // Group data by category
      const groupedData: Record<string, number> = {}

      data.forEach((item) => {
        const category = item[categoryField] || "Unknown"

        // For deals-by-stage, count deals instead of summing values
        if (widget.id === "deals-by-stage") {
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
  }, [data, widget.fields, widget.chartType, widget.id, debugMode])

  // Format currency values for tooltips
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`
  }

  // Render the appropriate chart based on the widget type
  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No data available</p>
        </div>
      )
    }

    switch (widget.chartType) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => {
                  // For Deals by Stage, we want to show count
                  if (widget.id === "deals-by-stage") {
                    return [`${value} deals`, name]
                  }
                  // For other charts with currency values
                  return [`$${Number(value).toLocaleString()}`, name]
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      case "donut":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => {
                  // For Deals by Stage, we want to show count
                  if (widget.id === "deals-by-stage") {
                    return [`${value} deals`, name]
                  }
                  // For other charts with currency values
                  return [`$${Number(value).toLocaleString()}`, name]
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 5,
                right: 30,
                left: 80, // Increased left margin for location names
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={80}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => (value.length > 12 ? `${value.substring(0, 12)}...` : value)}
              />
              <Tooltip
                formatter={(value, name, props) => {
                  // For Clients by Location, we want to show revenue
                  if (widget.id === "clients-by-location") {
                    return [`$${Number(value).toLocaleString()}`, "Revenue"]
                  }
                  // For other bar charts
                  return [value, name]
                }}
              />
              <Legend />
              <Bar dataKey="value" fill={COLORS[0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Value"]} />
              <Legend />
              {widget.fields.slice(1).map((field, index) => (
                <Line
                  key={field}
                  type="monotone"
                  dataKey={field}
                  stroke={COLORS[index % COLORS.length]}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Unsupported chart type: {widget.chartType}</p>
          </div>
        )
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="py-2 px-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">{widget.title}</CardTitle>
        <div className="flex items-center space-x-2">
          {debugMode && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setDebugMode(!debugMode)}>
              <span className="sr-only">Toggle debug</span>
              {debugMode ? "🐛" : "🔍"}
            </Button>
          )}
          {widget.entity && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-6 w-6 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {data.slice(0, 5).map((item) => (
                  <DropdownMenuItem key={item.id} onClick={() => handlePreviewClick(item.id)}>
                    <Link href={getEntityDetailRoute(item.id)} target="_blank" rel="noopener noreferrer">
                      <span className="text-sm">Open {item.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2">
        {debugMode && (
          <div className="mb-2 p-2 bg-muted rounded text-xs overflow-auto max-h-[100px]">
            <p>Data: {data.length} items</p>
            <p>Fields: {widget.fields?.join(", ")}</p>
            <p>Chart Data: {chartData.length} items</p>
            {chartData.length > 0 && <pre>{JSON.stringify(chartData.slice(0, 3), null, 2)}</pre>}
          </div>
        )}
        <div className="h-[250px] w-full">{renderChart()}</div>
      </CardContent>
      <EntityPreviewPanel
        open={previewOpen}
        onOpenChange={handlePreviewClose}
        entityId={previewEntityId}
        entityType={widget.entity}
      />
    </Card>
  )
}
