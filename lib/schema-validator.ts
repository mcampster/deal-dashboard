import Ajv from "ajv"
import configSchema from "@/schema/config-schema.json"

// Create a new Ajv instance
const ajv = new Ajv({ allErrors: true })

// Add the schema
const validate = ajv.compile(configSchema)

/**
 * Validates a configuration object against the schema
 * @param config The configuration object to validate
 * @returns An object with validation result and any errors
 */
export function validateConfig(config: any) {
  const valid = validate(config)

  return {
    valid,
    errors: validate.errors || [],
    errorMessage: valid ? null : formatErrors(validate.errors || []),
  }
}

/**
 * Formats validation errors into a readable string
 * @param errors Array of validation errors
 * @returns Formatted error message
 */
function formatErrors(errors: any[]): string {
  return errors
    .map((error) => {
      const path = error.instancePath || "(root)"
      return `${path}: ${error.message}`
    })
    .join("\n")
}

/**
 * Generates a minimal valid configuration for the specified view type
 * @param type The type of view to generate ('list' or 'dashboard')
 * @returns A minimal valid configuration
 */
export function generateMinimalConfig(type: "list" | "dashboard" | "details" | "master-details"): any {
  if (type === "list") {
    return {
      id: `new-${type}-${Date.now()}`,
      label: "New List View",
      icon: "dashboard",
      description: "A new list view",
      type: "list",
      entity: "deals", // Default entity
      columns: [{ key: "name", label: "Name", type: "text", field: "name" }],
      actions: [{ id: "refresh", label: "Refresh", icon: "refresh", type: "secondary" }],
    }
  } else if (type === "dashboard") {
    return {
      id: `new-${type}-${Date.now()}`,
      label: "New Dashboard",
      icon: "chart",
      description: "A new dashboard view",
      type: "dashboard",
      actions: [{ id: "refresh", label: "Refresh", icon: "refresh", type: "secondary" }],
      widgets: [
        {
          id: "metric-widget",
          type: "metric",
          title: "Total Count",
          width: "quarter",
          height: "1x",
          entity: "deals",
          metricField: "count",
          metricFormat: "number",
          hideFilters: true,
          hideSorts: true,
        },
      ],
    }
  } else if (type === "details") {
    return {
      id: `new-${type}-${Date.now()}`,
      label: "New Details View",
      icon: "user",
      description: "A new details view",
      type: "details",
      entity: "clients", // Default entity
      actions: [{ id: "refresh", label: "Refresh", icon: "refresh", type: "secondary" }],
      detailsConfig: {
        primaryFields: ["name", "industry", "location", "revenue"],
        relatedEntities: [],
      },
    }
  } else if (type === "master-details") {
    return {
      id: `new-${type}-${Date.now()}`,
      label: "New Master-Details View",
      icon: "columns",
      description: "A new master-details view",
      type: "master-details",
      entity: "deals", // Default entity
      columns: [{ key: "name", label: "Name", type: "text", field: "name" }],
      actions: [{ id: "refresh", label: "Refresh", icon: "refresh", type: "secondary" }],
      detailsConfig: {
        primaryFields: ["name", "value", "stage", "closeDate"],
      },
    }
  }

  // Default fallback
  return {
    id: `new-list-${Date.now()}`,
    label: "New List View",
    icon: "dashboard",
    description: "A new list view",
    type: "list",
    entity: "deals",
    columns: [{ key: "name", label: "Name", type: "text", field: "name" }],
    actions: [{ id: "refresh", label: "Refresh", icon: "refresh", type: "secondary" }],
  }
}

/**
 * Gets all available entities from the schema
 * @returns Array of entity names
 */
export function getAvailableEntities(): string[] {
  return ["deals", "contacts", "clients"]
}

/**
 * Gets all available column types from the schema
 * @returns Array of column types
 */
export function getAvailableColumnTypes(): string[] {
  return (configSchema.definitions.columnType as any).enum
}

/**
 * Gets all available icon names from the schema
 * @returns Array of icon names
 */
export function getAvailableIcons(): string[] {
  return (configSchema.definitions.iconName as any).enum
}

/**
 * Gets all available widget types from the schema
 * @returns Array of widget types
 */
export function getAvailableWidgetTypes(): string[] {
  return (configSchema.definitions.widgetType as any).enum
}

/**
 * Gets all available chart types from the schema
 * @returns Array of chart types
 */
export function getAvailableChartTypes(): string[] {
  return (configSchema.definitions.chartType as any).enum
}

/**
 * Gets all available widget heights from the schema
 * @returns Array of widget heights
 */
export function getAvailableWidgetHeights(): string[] {
  return ["1x", "2x", "3x", "4x", "auto"]
}

/**
 * Gets all available filter operators from the schema
 * @returns Array of filter operators
 */
export function getAvailableFilterOperators(): string[] {
  return (configSchema.definitions.filterOperator as any).enum
}

/**
 * Gets all available sort directions from the schema
 * @returns Array of sort directions
 */
export function getAvailableSortDirections(): string[] {
  return (configSchema.definitions.sortDirection as any).enum
}
