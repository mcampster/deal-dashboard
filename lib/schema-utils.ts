import type { ColumnConfig } from "@/config/types"
import clientsSchema from "@/schema/clients-schema.json"
import contactsSchema from "@/schema/contacts-schema.json"
import dealsSchema from "@/schema/deals-schema.json"
import activitiesSchema from "@/schema/activities-schema.json"
import dealTeamsSchema from "@/schema/deal-teams-schema.json"
import booksSchema from "@/schema/books-schema.json"

// Map entity names to their schemas
const schemaMap: Record<string, any> = {
  clients: clientsSchema,
  contacts: contactsSchema,
  deals: dealsSchema,
  activities: activitiesSchema,
  "deal-teams": dealTeamsSchema,
  books: booksSchema,
}

/**
 * Get the schema for a specific entity
 * @param entity The entity name
 * @returns The schema object or null if not found
 */
export function getSchemaForEntity(entity: string): any {
  return schemaMap[entity] || null
}

/**
 * Get all available columns for an entity from its schema
 * @param entity The entity name
 * @returns Array of column configurations
 */
export function getAvailableColumnsFromSchema(entity: string): ColumnConfig[] {
  const schema = getSchemaForEntity(entity)

  if (!schema || !schema.properties) {
    console.warn(`Schema not found for entity: ${entity}`)
    return []
  }

  const columns: ColumnConfig[] = []

  // Process each property in the schema
  Object.entries(schema.properties).forEach(([key, value]: [string, any]) => {
    // Skip internal properties or those marked as hidden
    if (key.startsWith("_") || value.hidden) {
      return
    }

    // Determine column type based on schema property type
    let columnType = "text"
    if (value.type === "number") {
      columnType = value.format === "currency" ? "currency" : "text"
    } else if (value.type === "string") {
      if (value.format === "date" || value.format === "date-time") {
        columnType = "date"
      } else if (value.format === "email") {
        columnType = "email"
      } else if (value.format === "phone") {
        columnType = "phone"
      } else if (key === "company" || key === "client" || key === "clientName") {
        columnType = "company"
      } else if (key === "industry") {
        columnType = "industry"
      } else if (key === "location" || key === "city" || key === "country") {
        columnType = "location"
      }
    }

    // Create column config
    columns.push({
      key,
      label: value.title || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
      type: columnType as any,
      field: key,
      filterable: value.filterable !== false, // Default to true unless explicitly set to false
    })
  })

  return columns
}

/**
 * Get a subset of columns that are commonly used for an entity
 * @param entity The entity name
 * @returns Array of common column configurations
 */
export function getCommonColumnsForEntity(entity: string): string[] {
  switch (entity) {
    case "clients":
      return ["name", "industry", "location", "revenue", "employees", "status"]
    case "contacts":
      return ["name", "title", "email", "phone", "company", "lastContact"]
    case "deals":
      return ["name", "value", "phase", "clientName", "expectedCloseDate", "dealType"]
    case "activities":
      return ["type", "subject", "date", "contact", "deal", "notes"]
    case "deal-teams":
      return ["name", "lead", "members", "deals", "revenue"]
    case "books":
      return ["name", "description", "deals", "totalValue"]
    default:
      return []
  }
}
