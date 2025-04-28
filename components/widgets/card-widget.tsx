"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import type { WidgetConfig } from "@/config/types"

interface CardWidgetProps {
  widget: WidgetConfig
  data: any[]
}

export function CardWidget({ widget, data }: CardWidgetProps) {
  console.log(`CardWidget ${widget.id} data:`, data)

  // Get the first item from the data
  const item = data && data.length > 0 ? data[0] : null

  if (!item) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{widget.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available</p>
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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <Link href={getEntityDetailRoute(item.id)} className="hover:underline text-primary">
          <CardTitle>{widget.title}</CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3">
          {widget.fields?.map((field, index) => (
            <div key={field} className="flex justify-between items-center border-b pb-2 last:border-0">
              <span className="font-medium text-sm">{formatFieldLabel(field)}:</span>
              {index === 0 ? (
                <Link href={getEntityDetailRoute(item.id)} className="text-sm text-primary hover:underline">
                  {formatFieldValue(item[field], field)}
                </Link>
              ) : (
                <span className="text-sm">{formatFieldValue(item[field], field)}</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
