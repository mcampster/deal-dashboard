import dealsSchema from "@/schema/deals-schema.json"
import clientsSchema from "@/schema/clients-schema.json"
import contactsSchema from "@/schema/contacts-schema.json"
import activitiesSchema from "@/schema/activities-schema.json"
import dealTeamsSchema from "@/schema/deal-teams-schema.json"
import booksSchema from "@/schema/books-schema.json"
import type { ViewConfig } from "@/config/types"

// Map entity types to their schemas
const schemaMap: Record<string, any> = {
  deals: dealsSchema,
  clients: clientsSchema,
  contacts: contactsSchema,
  activities: activitiesSchema,
  "deal-teams": dealTeamsSchema,
  books: booksSchema,
}

// Remove the field mappings since we're fixing the source data
const fieldMappings: Record<string, Record<string, string>> = {
  deals: {
    // Remove the mapping, we'll fix the source data instead
  },
}

/**
 * Checks for any remaining "stage" references in a view config
 */
export function checkForStageReferences(viewConfig: ViewConfig): string[] {
  const stageReferences: string[] = []

  // Check the config as a string for any "stage" references
  const configString = JSON.stringify(viewConfig)
  if (configString.includes('"stage"') || configString.includes('"Stage"')) {
    // Find all occurrences and their context
    const regex = /"([^"]*stage[^"]*)"/gi
    let match
    while ((match = regex.exec(configString)) !== null) {
      stageReferences.push(match[1])
    }
  }

  return stageReferences
}

/**
 * Validates and corrects column references in a view configuration
 */
export function validateViewConfig(viewConfig: ViewConfig): ViewConfig {
  const entity = viewConfig.entity
  if (!entity || !schemaMap[entity]) {
    return viewConfig // Can't validate without a schema
  }

  const schema = schemaMap[entity]
  const mappings = fieldMappings[entity] || {}
  const validFields = Object.keys(schema.properties || {})

  // Function to correct a field name
  const correctFieldName = (field: string): string => {
    // Check if there's a mapping for this field
    if (mappings[field]) {
      return mappings[field]
    }

    // Return original if it's valid
    if (validFields.includes(field)) {
      return field
    }

    // Try to find a case-insensitive match
    const lowerField = field.toLowerCase()
    const match = validFields.find((f) => f.toLowerCase() === lowerField)
    return match || field
  }

  // Create a new config with corrected fields
  const correctedConfig = { ...viewConfig }

  // Correct columns
  if (correctedConfig.columns) {
    correctedConfig.columns = correctedConfig.columns.map((column) => {
      if (typeof column === "string") {
        return correctFieldName(column)
      } else if (column.field) {
        return {
          ...column,
          field: correctFieldName(column.field),
        }
      }
      return column
    })
  }

  // Correct quick filters
  if (correctedConfig.quickFilters) {
    correctedConfig.quickFilters = correctedConfig.quickFilters.map((filter) => {
      if (filter.field) {
        return {
          ...filter,
          field: correctFieldName(filter.field),
        }
      }
      return filter
    })
  }

  // Correct default sorts
  if (correctedConfig.defaultSort) {
    correctedConfig.defaultSort = correctedConfig.defaultSort.map((sort) => {
      if (sort.field) {
        return {
          ...sort,
          field: correctFieldName(sort.field),
        }
      }
      return sort
    })
  }

  // Correct groupBy
  if (correctedConfig.groupBy) {
    correctedConfig.groupBy = correctFieldName(correctedConfig.groupBy)
  }

  // Correct metrics in dashboard views
  if (correctedConfig.widgets) {
    correctedConfig.widgets = correctedConfig.widgets.map((widget) => {
      // Handle table widgets
      if (widget.type === "table" && widget.columns) {
        return {
          ...widget,
          columns: widget.columns.map((column) => {
            if (typeof column === "string") {
              return correctFieldName(column)
            } else if (column.field) {
              return {
                ...column,
                field: correctFieldName(column.field),
              }
            }
            return column
          }),
        }
      }

      // Handle chart widgets
      if (widget.type === "chart" && widget.config) {
        const config = { ...widget.config }
        if (config.xField) {
          config.xField = correctFieldName(config.xField)
        }
        if (config.yField) {
          config.yField = correctFieldName(config.yField)
        }
        if (config.groupBy) {
          config.groupBy = correctFieldName(config.groupBy)
        }
        return {
          ...widget,
          config,
        }
      }

      // Handle metric widgets
      if (widget.type === "metric" && widget.field) {
        return {
          ...widget,
          field: correctFieldName(widget.field),
        }
      }

      return widget
    })
  }

  // Check for any remaining "stage" references
  const stageReferences = checkForStageReferences(correctedConfig)
  if (stageReferences.length > 0) {
    console.warn(`View ${correctedConfig.id} still contains "stage" references:`, stageReferences)
  }

  return correctedConfig
}

/**
 * Applies schema validation to all view configurations
 */
export function validateAllViewConfigs(views: ViewConfig[]): ViewConfig[] {
  return views.map((view) => validateViewConfig(view))
}
