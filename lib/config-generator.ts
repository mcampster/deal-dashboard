import { validateConfig } from "@/lib/schema-validator"
import { mockDatabase } from "@/lib/mock-data"
import type { ViewConfig, ColumnConfig, WidgetConfig } from "@/config/types"

/**
 * Generates a list view configuration for the specified entity
 * @param entity The entity to create a view for
 * @returns A valid list view configuration
 */
export function generateListView(entity: "deals" | "contacts" | "clients"): ViewConfig {
  // Get sample data for the entity
  const sampleData = mockDatabase[entity][0]

  // Generate columns based on the entity's fields
  const columns: ColumnConfig[] = Object.keys(sampleData)
    .filter((key) => key !== "id") // Skip the ID field
    .map((field) => {
      // Determine column type based on field name and value
      let type: "text" | "currency" | "date" | "email" | "phone" | "company" | "industry" | "location" = "text"
      let icon: string | undefined = undefined

      if (
        field === "value" ||
        field === "revenue" ||
        (typeof sampleData[field] === "string" && sampleData[field].startsWith("$"))
      ) {
        type = "currency"
      } else if (field.toLowerCase().includes("date")) {
        type = "date"
      } else if (field === "email") {
        type = "email"
        icon = "mail"
      } else if (field === "phone") {
        type = "phone"
        icon = "phone"
      } else if (field === "company") {
        type = "company"
        icon = "building"
      } else if (field === "industry") {
        type = "industry"
        icon = "briefcase"
      } else if (field === "location") {
        type = "location"
        icon = "mapPin"
      }

      // Create column config
      const column: ColumnConfig = {
        key: field,
        label: field.charAt(0).toUpperCase() + field.slice(1), // Capitalize first letter
        type,
        field,
      }

      if (icon) {
        column.icon = icon
      }

      return column
    })

  // Create view config
  const config: ViewConfig = {
    id: `${entity}-view-${Date.now()}`,
    label: `${entity.charAt(0).toUpperCase() + entity.slice(1)}`, // Capitalize first letter
    icon: entity === "deals" ? "dollar" : entity === "contacts" ? "user" : "building",
    description: `View and manage your ${entity}`,
    type: "list",
    entity,
    columns,
    actions: [
      { id: `add-${entity.slice(0, -1)}`, label: `Add ${entity.slice(0, -1)}`, icon: "plus", type: "primary" },
      { id: `export-${entity}`, label: `Export ${entity}`, icon: "download", type: "secondary" },
      { id: "refresh", label: "Refresh", icon: "refresh", type: "secondary" },
    ],
  }

  // Validate the config
  const validation = validateConfig(config)
  if (!validation.valid) {
    console.error("Generated invalid config:", validation.errorMessage)
    throw new Error(`Failed to generate valid config: ${validation.errorMessage}`)
  }

  return config
}

/**
 * Generates a dashboard view configuration for the specified entity
 * @param entity The primary entity for the dashboard
 * @returns A valid dashboard view configuration
 */
export function generateDashboard(entity: "deals" | "contacts" | "clients"): ViewConfig {
  // Get sample data for the entity
  const sampleData = mockDatabase[entity][0]

  // Determine entity-specific fields and metrics
  const widgets: WidgetConfig[] = []

  // Add a count metric widget
  widgets.push({
    id: `total-${entity}`,
    type: "metric",
    title: `Total ${entity.charAt(0).toUpperCase() + entity.slice(1)}`,
    width: "quarter",
    entity,
    metricField: "count",
    metricFormat: "number",
    metricIcon: entity === "deals" ? "dollar" : entity === "contacts" ? "user" : "building",
  })

  // Add entity-specific metric widgets
  if (entity === "deals") {
    widgets.push({
      id: "total-value",
      type: "metric",
      title: "Total Value",
      width: "quarter",
      entity,
      metricField: "sum:value",
      metricFormat: "currency",
      metricIcon: "dollar",
    })

    widgets.push({
      id: "avg-deal-value",
      type: "metric",
      title: "Average Deal Value",
      width: "quarter",
      entity,
      metricField: "avg:value",
      metricFormat: "currency",
      metricIcon: "dollar",
    })

    widgets.push({
      id: "deals-by-stage",
      type: "chart",
      title: "Deals by Stage",
      width: "half",
      height: "medium",
      entity,
      chartType: "pie",
      fields: ["stage", "value"],
    })
  } else if (entity === "clients") {
    widgets.push({
      id: "total-revenue",
      type: "metric",
      title: "Total Revenue",
      width: "quarter",
      entity,
      metricField: "sum:revenue",
      metricFormat: "currency",
      metricIcon: "dollar",
    })

    widgets.push({
      id: "clients-by-industry",
      type: "chart",
      title: "Clients by Industry",
      width: "half",
      height: "medium",
      entity,
      chartType: "pie",
      fields: ["industry", "revenue"],
    })
  } else if (entity === "contacts") {
    widgets.push({
      id: "contacts-by-company",
      type: "chart",
      title: "Contacts by Company",
      width: "half",
      height: "medium",
      entity,
      chartType: "pie",
      fields: ["company", "id"],
    })
  }

  // Add a table widget
  const tableColumns = Object.keys(sampleData)
    .filter((key) => (key !== "id" && widgets.length < 3 ? true : !["id", "closeDate"].includes(key)))
    .map((field) => {
      // Determine column type based on field name and value
      let type: "text" | "currency" | "date" | "email" | "phone" | "company" | "industry" | "location" = "text"
      let icon: string | undefined = undefined

      if (
        field === "value" ||
        field === "revenue" ||
        (typeof sampleData[field] === "string" && sampleData[field].startsWith("$"))
      ) {
        type = "currency"
      } else if (field.toLowerCase().includes("date")) {
        type = "date"
      } else if (field === "email") {
        type = "email"
        icon = "mail"
      } else if (field === "phone") {
        type = "phone"
        icon = "phone"
      } else if (field === "company") {
        type = "company"
        icon = "building"
      } else if (field === "industry") {
        type = "industry"
        icon = "briefcase"
      } else if (field === "location") {
        type = "location"
        icon = "mapPin"
      }

      // Create column config
      const column: ColumnConfig = {
        key: field,
        label: field.charAt(0).toUpperCase() + field.slice(1), // Capitalize first letter
        type,
        field,
      }

      if (icon) {
        column.icon = icon
      }

      return column
    })

  widgets.push({
    id: `recent-${entity}`,
    type: "table",
    title: `Recent ${entity.charAt(0).toUpperCase() + entity.slice(1)}`,
    width: "half",
    height: "large",
    entity,
    columns: tableColumns,
    sort: entity === "deals" ? [{ field: "closeDate", direction: "desc" }] : undefined,
    limit: 5,
  })

  // Create dashboard config
  const config: ViewConfig = {
    id: `${entity}-dashboard-${Date.now()}`,
    label: `${entity.charAt(0).toUpperCase() + entity.slice(1)} Dashboard`,
    icon: "chart",
    description: `Overview of your ${entity}`,
    type: "dashboard",
    actions: [{ id: "refresh", label: "Refresh", icon: "refresh", type: "secondary" }],
    widgets,
  }

  // Validate the config
  const validation = validateConfig(config)
  if (!validation.valid) {
    console.error("Generated invalid dashboard config:", validation.errorMessage)
    throw new Error(`Failed to generate valid dashboard config: ${validation.errorMessage}`)
  }

  return config
}

/**
 * Generates a filtered view based on an existing view
 * @param baseView The base view to filter
 * @param field The field to filter on
 * @param operator The filter operator
 * @param value The filter value
 * @param label Optional label for the filter
 * @returns A new filtered view configuration
 */
export function generateFilteredView(
  baseView: ViewConfig,
  field: string,
  operator: string,
  value: string | number,
  label?: string,
): ViewConfig {
  // Create a copy of the base view
  const filteredView: ViewConfig = JSON.parse(JSON.stringify(baseView))

  // Update ID and label
  filteredView.id = `${baseView.id}-filtered-${Date.now()}`
  filteredView.label = `Filtered ${baseView.label}`

  // Add the filter
  if (!filteredView.filters) {
    filteredView.filters = []
  }

  filteredView.filters.push({
    field,
    operator: operator as any,
    value,
    label: label || `${field} ${operator} ${value}`,
  })

  // Validate the config
  const validation = validateConfig(filteredView)
  if (!validation.valid) {
    console.error("Generated invalid filtered view:", validation.errorMessage)
    throw new Error(`Failed to generate valid filtered view: ${validation.errorMessage}`)
  }

  return filteredView
}
