"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RelatedEntityConfig } from "@/config/types"

interface PhaseDetailsPanelProps {
  config: RelatedEntityConfig
  data: any
}

export function PhaseDetailsPanel({ config, data }: PhaseDetailsPanelProps) {
  // Extract the phase details from the nested object structure
  const getPhaseData = () => {
    // First check if nestedObjectPath is explicitly specified in the config
    if (config.nestedObjectPath && data[config.nestedObjectPath]) {
      return data[config.nestedObjectPath]
    }

    // For backward compatibility, infer from the ID
    const phaseId = config.id

    if (phaseId === "origination-details" && data.originationDetails) {
      return data.originationDetails
    }

    if (phaseId === "execution-details" && data.executionDetails) {
      return data.executionDetails
    }

    if (phaseId === "closeout-details" && data.closeoutDetails) {
      return data.closeoutDetails
    }

    // Try to infer from the ID by removing "-details" suffix
    const inferredPath = phaseId.replace("-details", "")
    if (data[inferredPath]) {
      return data[inferredPath]
    }

    return {}
  }

  const phaseData = getPhaseData()

  // Format field label for display
  const formatFieldLabel = (field: string): string => {
    return field
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
  }

  // Format field value for display
  const formatFieldValue = (value: any, field: string) => {
    if (value === undefined || value === null) return "N/A"

    // Handle boolean values
    if (typeof value === "boolean") {
      return (
        <Badge variant="outline" className={value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
          {value ? "Yes" : "No"}
        </Badge>
      )
    }

    // Handle date fields
    if (field.toLowerCase().includes("date") && value) {
      return new Date(value).toLocaleDateString()
    }

    // Handle currency values
    if (typeof value === "string" && value.startsWith("$")) {
      return value
    }

    // For any other field, just return the value as string
    return String(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(phaseData).length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No {config.title.toLowerCase()} available.</p>
        ) : (
          <div className="space-y-4">
            {config.columns.map((column) => {
              // Extract the field name from the column.field path
              // For example, "originationDetails.dealTeamComplete" -> "dealTeamComplete"
              const fieldPath = column.field.split(".")
              const fieldName = fieldPath[fieldPath.length - 1]
              const value = phaseData[fieldName]

              return (
                <div
                  key={column.key}
                  className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
                >
                  <span className="font-medium text-sm">{column.label}:</span>
                  <span className="text-sm">{formatFieldValue(value, fieldName)}</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
