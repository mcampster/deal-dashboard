"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { iconMap } from "@/config/icons"
import type { WidgetConfig } from "@/config/types"

interface MetricWidgetProps {
  widget: WidgetConfig
  data: any[]
}

export function MetricWidget({ widget, data }: MetricWidgetProps) {
  // Calculate the metric value
  const calculateMetricValue = () => {
    if (!data || data.length === 0 || !widget.metricField) {
      console.log(`No data or metric field for widget ${widget.id}`)
      return "N/A"
    }

    // For count metrics
    if (widget.metricField === "count") {
      console.log(`Count metric for widget ${widget.id}: ${data.length}`)
      return formatValue(data.length, widget.metricFormat)
    }

    // For sum, average, min, max metrics
    if (widget.metricField.includes(":")) {
      const [operation, field] = widget.metricField.split(":")
      console.log(`${operation} operation on ${field} for widget ${widget.id}`)

      // Extract values, handling currency strings
      const values = data.map((item) => {
        const value = item[field]
        console.log(`Raw value for ${field}:`, value, `in item:`, item.id || "unknown")

        if (value === undefined) {
          console.warn(`Field ${field} is undefined in item:`, item)
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

      console.log(`Processed values for ${field}:`, values)

      if (values.length === 0) return "N/A"

      let result
      switch (operation) {
        case "sum":
          result = values.reduce((a, b) => a + b, 0)
          console.log(`Sum result: ${result}`)
          return formatValue(result, widget.metricFormat)
        case "avg":
          result = values.reduce((a, b) => a + b, 0) / values.length
          console.log(`Average result: ${result}`)
          return formatValue(result, widget.metricFormat)
        case "min":
          result = Math.min(...values)
          console.log(`Min result: ${result}`)
          return formatValue(result, widget.metricFormat)
        case "max":
          result = Math.max(...values)
          console.log(`Max result: ${result}`)
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
  const MetricIcon = widget.metricIcon ? iconMap[widget.metricIcon as keyof typeof iconMap] : null

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        {MetricIcon && <MetricIcon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metricValue}</div>
        <p className={`text-xs ${trend.direction === "up" ? "text-green-500" : "text-red-500"} flex items-center`}>
          {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
          <span className="text-muted-foreground ml-1">from last period</span>
        </p>
      </CardContent>
    </Card>
  )
}
