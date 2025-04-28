export type ColumnType = "text" | "currency" | "date" | "email" | "phone" | "company" | "industry" | "location"

// Update the ColumnConfig interface to include a filterable flag
export interface ColumnConfig {
  key: string
  label: string
  type: ColumnType
  icon?: string // Reference to icon key in iconMap
  field: string // Field name in the GraphQL query
  filterable?: boolean // Whether this column should appear in the quick filter UI
}

export type ActionType = "primary" | "secondary"

export interface ActionConfig {
  id: string
  label: string
  icon: string // Reference to icon key in iconMap
  type: ActionType
}

export type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "greaterThan"
  | "lessThan"
  | "greaterThanOrEquals"
  | "lessThanOrEquals"
  | "="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "in" // Add "in" operator for multi-select

// Update the FilterConfig interface to be more comprehensive
export interface FilterConfig {
  field: string
  operator: FilterOperator
  value: string | number | (string | number)[] // Support array values for multi-select
  label?: string // Optional human-readable label
}

export type SortDirection = "asc" | "desc"

export interface SortConfig {
  field: string
  direction: SortDirection
  label?: string // Optional human-readable label
}

// Define view types - add "master-details" type
export type ViewType = "list" | "dashboard" | "details" | "master-details"

// Define widget types for dashboards
export type WidgetType = "table" | "chart" | "metric" | "card"

// Define chart types
export type ChartType = "bar" | "line" | "pie" | "donut"

// Define render types for related entities
export type RelatedEntityRenderType = "table" | "key-value" | "nested-object"

// Updated height type using multipliers
export type WidgetHeight = "1x" | "2x" | "3x" | "4x" | "auto"

// Widget configuration for dashboard views
export interface WidgetConfig {
  id: string
  type: WidgetType
  title: string
  width: "full" | "half" | "third" | "quarter" // Width of the widget in the grid
  height?: WidgetHeight // Updated height property using multipliers
  entity: string // Entity name for GraphQL query
  fields?: string[] // Fields to query
  columns?: ColumnConfig[] // For table widgets
  filters?: FilterConfig[] // Filters to apply
  sort?: SortConfig[] // Sort configuration
  limit?: number // Limit on number of results
  chartType?: ChartType // For chart widgets
  chartOptions?: Record<string, any> // Additional chart options
  metricField?: string // Field to use for metric widgets
  metricFormat?: string // Format for metric widgets (e.g., "currency", "number", "percent")
  metricIcon?: string // Icon for metric widgets
  actions?: ActionConfig[] // Actions for widgets (especially card widgets)
  hideFilters?: boolean // Whether to hide filter indicators
  hideSorts?: boolean // Whether to hide sort indicators
  description?: string // Optional description for tooltips
}

// Define visualization configuration for list views
export interface VisualizationConfig {
  field: string
  type: "donut" | "pie" | "bar"
  title: string
  width?: "full" | "half" | "third" | "quarter"
}

// Define related entity configuration for details views
export interface RelatedEntityConfig {
  id: string
  title: string
  entity: string
  columns: ColumnConfig[]
  relationField: string // Field that relates to the parent entity
  filters?: FilterConfig[]
  sort?: SortConfig[]
  limit?: number
  actions?: ActionConfig[]
  renderType?: RelatedEntityRenderType // How to render this related entity
  nestedObjectPath?: string // Path to the nested object for nested-object render type
}

// Add this to the ViewConfig interface
export interface MasterDetailsConfig {
  viewConfig?: ViewConfig // Optional view config for the details panel
}

export interface ViewConfig {
  id: string
  label: string
  icon: string // Reference to icon key in iconMap
  description: string
  type: ViewType // Type of view (list, dashboard, or details)
  entity?: string // Entity name for GraphQL query (required for list views)
  columns?: ColumnConfig[] // Required for list views
  actions: ActionConfig[]
  filters?: FilterConfig[] // Array of filters to apply to the view
  sort?: SortConfig[] // Array of sort configurations
  limit?: number // Optional limit on the number of results
  widgets?: WidgetConfig[] // Array of widgets for dashboard views
  visualizations?: VisualizationConfig[] // Array of visualizations for list views
  detailsConfig?: {
    primaryFields: string[] // Fields to display in the details panel
    relatedEntities?: RelatedEntityConfig[] // Related entities to display
    viewConfig?: ViewConfig // Optional view config for the details panel
  } // Configuration for details views
  masterDetailsConfig?: MasterDetailsConfig // Configuration for master-details views
}

export interface PaginationState {
  page: number
  pageSize: number
}

export interface FilterState {
  [key: string]:
    | string
    | {
        operator: FilterOperator
        value: string | number | (string | number)[] // Support array values for multi-select
      }
}

export interface SortState {
  field: string
  direction: SortDirection
}
