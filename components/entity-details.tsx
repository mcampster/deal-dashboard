"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { iconMap } from "@/config/icons"
import { EntityAvatar } from "@/components/entity-avatar"
import { Badge } from "@/components/ui/badge"

interface EntityDetailsProps {
  entity: any
  primaryFields: string[]
  entityType: string
}

export function EntityDetails({ entity, primaryFields, entityType }: EntityDetailsProps) {
  // Get the entity title based on entity type
  const getEntityTitle = () => {
    switch (entityType) {
      case "deals":
        return entity.name || "Deal Details"
      case "contacts":
        return entity.name || "Contact Details"
      case "clients":
        return entity.name || "Client Details"
      default:
        return "Entity Details"
    }
  }

  // Format field label for display
  const formatFieldLabel = (field: string): string => {
    return field
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
  }

  // Update the formatFieldValue function to be more robust
  const formatFieldValue = (value: any, field: string): React.ReactNode => {
    if (value === undefined || value === null) {
      console.log(`Field ${field} has undefined or null value in entity:`, entity)
      return "N/A"
    }

    // Handle different field types
    if (field === "email") {
      return (
        <a href={`mailto:${value}`} className="text-primary hover:underline flex items-center gap-2">
          {iconMap.mail && <iconMap.mail className="h-4 w-4" />}
          {value}
        </a>
      )
    }

    if (field === "phone") {
      return (
        <a href={`tel:${value}`} className="text-primary hover:underline flex items-center gap-2">
          {iconMap.phone && <iconMap.phone className="h-4 w-4" />}
          {value}
        </a>
      )
    }

    if (field === "website") {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          {value}
        </a>
      )
    }

    if (field === "location") {
      return (
        <div className="flex items-center gap-2">
          {iconMap.mapPin && <iconMap.mapPin className="h-4 w-4 text-muted-foreground" />}
          {value}
        </div>
      )
    }

    if (field === "industry") {
      return (
        <div className="flex items-center gap-2">
          {iconMap.briefcase && <iconMap.briefcase className="h-4 w-4 text-muted-foreground" />}
          {value}
        </div>
      )
    }

    if (field === "company") {
      return (
        <div className="flex items-center gap-2">
          {iconMap.building && <iconMap.building className="h-4 w-4 text-muted-foreground" />}
          {value}
        </div>
      )
    }

    if (field === "revenue" || field === "value") {
      return (
        <div className="flex items-center gap-2">
          {iconMap.dollar && <iconMap.dollar className="h-4 w-4 text-muted-foreground" />}
          {value}
        </div>
      )
    }

    // Handle deal phase
    if (field === "phase") {
      let bgColor = "bg-gray-100"

      switch (value) {
        case "Origination":
          bgColor = "bg-blue-100 text-blue-800 border-blue-200"
          break
        case "Execution":
          bgColor = "bg-amber-100 text-amber-800 border-amber-200"
          break
        case "Closeout":
          bgColor = "bg-green-100 text-green-800 border-green-200"
          break
      }

      return (
        <Badge variant="outline" className={`${bgColor}`}>
          {value}
        </Badge>
      )
    }

    // Handle deal status
    if (field === "status") {
      let bgColor = "bg-gray-100"

      // Status colors based on the status value
      if (value.includes("Completed") || value.includes("Approved") || value.includes("Closed Won")) {
        bgColor = "bg-green-100 text-green-800 border-green-200"
      } else if (value.includes("Pending") || value.includes("Review") || value.includes("Building")) {
        bgColor = "bg-amber-100 text-amber-800 border-amber-200"
      } else if (value.includes("Closed Lost")) {
        bgColor = "bg-red-100 text-red-800 border-red-200"
      }

      return (
        <Badge variant="outline" className={`${bgColor}`}>
          {value}
        </Badge>
      )
    }

    // Handle risk rating
    if (field === "riskRating") {
      let bgColor = "bg-gray-100"

      switch (value) {
        case "Low":
          bgColor = "bg-green-100 text-green-800 border-green-200"
          break
        case "Medium":
          bgColor = "bg-amber-100 text-amber-800 border-amber-200"
          break
        case "High":
          bgColor = "bg-red-100 text-red-800 border-red-200"
          break
      }

      return (
        <Badge variant="outline" className={`${bgColor}`}>
          {value}
        </Badge>
      )
    }

    // Handle priority
    if (field === "priority") {
      let bgColor = "bg-gray-100"

      switch (value) {
        case "Low":
          bgColor = "bg-blue-100 text-blue-800 border-blue-200"
          break
        case "Medium":
          bgColor = "bg-amber-100 text-amber-800 border-amber-200"
          break
        case "High":
          bgColor = "bg-red-100 text-red-800 border-red-200"
          break
      }

      return (
        <Badge variant="outline" className={`${bgColor}`}>
          {value}
        </Badge>
      )
    }

    // Handle date fields
    if (field.toLowerCase().includes("date") && value) {
      return new Date(value).toLocaleDateString()
    }

    // For any other field, just return the value as string
    return String(value)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <EntityAvatar
          entity={entityType as "client" | "contact" | "deal"}
          name={entity.name || ""}
          phase={entity.phase}
          value={entity.value}
          size="lg"
        />
        <CardTitle>{getEntityTitle()}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {primaryFields.map((field) => (
          <div key={field} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
            <span className="font-medium text-sm">{formatFieldLabel(field)}:</span>
            <span className="text-sm">{formatFieldValue(entity[field], field)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
