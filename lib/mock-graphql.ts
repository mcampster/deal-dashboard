import { mockDatabase } from "@/lib/mock-data"

// Types for our GraphQL-like API
export interface QueryOptions {
  entity: string
  fields: string[]
  filter?: Record<string, any>
  pagination?: {
    page: number
    pageSize: number
  }
  sort?: {
    field: string
    direction: "asc" | "desc"
  }[]
  limit?: number
}

export interface QueryResult<T = any> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Helper function to parse currency values for comparison
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

// Helper function to compare dates
function compareDates(a: string, b: string, direction: "asc" | "desc"): number {
  const dateA = new Date(a).getTime()
  const dateB = new Date(b).getTime()
  return direction === "asc" ? dateA - dateB : dateB - dateA
}

// Helper function to compare values (including currency)
function compareValues(a: any, b: any, field: string, direction: "asc" | "desc"): number {
  // Handle currency fields
  if (typeof a[field] === "string" && a[field].startsWith("$")) {
    const valueA = parseCurrencyValue(a[field])
    const valueB = parseCurrencyValue(b[field])
    return direction === "asc" ? valueA - valueB : valueB - valueA
  }

  // Handle date fields
  if (field === "closeDate" || field.toLowerCase().includes("date")) {
    return compareDates(a[field], b[field], direction)
  }

  // Handle regular string comparison
  if (typeof a[field] === "string") {
    return direction === "asc" ? a[field].localeCompare(b[field]) : b[field].localeCompare(a[field])
  }

  // Handle numeric comparison
  return direction === "asc" ? a[field] - b[field] : b[field] - a[field]
}

// Helper function to check if an item matches a filter condition
function matchesFilterCondition(item: any, field: string, operator: string, value: any): boolean {
  // Special handling for ID field
  if (field === "id") {
    // Get item's ID and ensure consistent type comparison
    const itemId = typeof item.id === "string" ? Number.parseInt(item.id, 10) : item.id

    // Normalize filter ID value
    let filterId: string | number = value
    if (typeof value === "string" && /^\d+$/.test(value)) {
      filterId = Number.parseInt(value, 10)
    }

    // For debugging
    console.log(`Comparing IDs: item=${itemId} (${typeof itemId}) vs filter=${filterId} (${typeof filterId})`)

    switch (operator) {
      case "=":
      case "equals":
        return itemId == filterId // Use loose equality to match string "1" with number 1
      case "!=":
      case "notEquals":
        return itemId != filterId
      default:
        return true
    }
  }

  // Special handling for dealId field when filtering related entities
  if (field === "dealId") {
    // Convert both values to numbers to ensure consistent comparison
    const itemId = typeof item.dealId === "string" ? Number.parseInt(item.dealId, 10) : Number(item.dealId || 0)
    const filterId = typeof value === "string" ? Number.parseInt(value, 10) : Number(value || 0)

    console.log(
      `[mock-graphql] Comparing dealId: item=${itemId} (${typeof itemId}) vs filter=${filterId} (${typeof filterId})`,
    )

    switch (operator) {
      case "=":
      case "equals":
        const result = itemId === filterId // Use strict equality for numbers
        console.log(`[mock-graphql] dealId comparison result: ${result}`)
        return result
      case "!=":
      case "notEquals":
        return itemId !== filterId
      default:
        return true
    }
  }

  // Handle "in" operator for multi-select
  if (operator === "in" && Array.isArray(value)) {
    return value.some((val) => {
      // For each value in the array, check if it matches the item's field value
      if (field === "value" || field.includes("revenue")) {
        const itemNumericValue = parseCurrencyValue(item[field])
        const filterNumericValue = parseCurrencyValue(val as string)
        return itemNumericValue === filterNumericValue
      }
      return item[field] === val
    })
  }

  // Handle currency fields specially
  if (field === "value" || field.includes("revenue")) {
    const itemNumericValue = parseCurrencyValue(item[field])
    const filterNumericValue = parseCurrencyValue(value as string)

    switch (operator) {
      case ">":
      case "greaterThan":
        return itemNumericValue > filterNumericValue
      case ">=":
      case "greaterThanOrEquals":
        return itemNumericValue >= filterNumericValue
      case "<":
      case "lessThan":
        return itemNumericValue < filterNumericValue
      case "<=":
      case "lessThanOrEquals":
        return itemNumericValue <= filterNumericValue
      case "=":
      case "equals":
        return itemNumericValue === filterNumericValue
      case "!=":
      case "notEquals":
        return itemNumericValue !== filterNumericValue
      default:
        return true
    }
  }

  // Handle date fields specially
  if (field === "closeDate" || field.toLowerCase().includes("date")) {
    const itemDate = new Date(item[field]).getTime()
    const filterDate = new Date(value as string).getTime()

    switch (operator) {
      case ">":
      case "greaterThan":
        return itemDate > filterDate
      case ">=":
      case "greaterThanOrEquals":
        return itemDate >= filterDate
      case "<":
      case "lessThan":
        return itemDate < filterDate
      case "<=":
      case "lessThanOrEquals":
        return itemDate <= filterDate
      case "=":
      case "equals":
        return itemDate === filterDate
      case "!=":
      case "notEquals":
        return itemDate !== filterDate
      default:
        return true
    }
  }

  // Special handling for company field when filtering contacts by client
  if (field === "company" || field === "relatedTo") {
    const itemValue = String(item[field] || "").toLowerCase()
    const filterValue = String(value || "").toLowerCase()

    switch (operator) {
      case "=":
      case "equals":
        return itemValue === filterValue
      case "!=":
      case "notEquals":
        return itemValue !== filterValue
      case "contains":
        return itemValue.includes(filterValue)
      case "notContains":
        return !itemValue.includes(filterValue)
      default:
        return true
    }
  }

  // Handle regular string/number comparisons
  switch (operator) {
    case "contains":
      return String(item[field]).toLowerCase().includes(String(value).toLowerCase())
    case "notContains":
      return !String(item[field]).toLowerCase().includes(String(value).toLowerCase())
    case "=":
    case "equals":
      return item[field] == value
    case "!=":
    case "notEquals":
      return item[field] != value
    default:
      return true
  }
}

// Mock GraphQL query function
export async function query<T = any>(options: QueryOptions): Promise<QueryResult<T>> {
  const { entity, fields, filter = {}, pagination = { page: 1, pageSize: 10 }, sort = [], limit } = options

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300)) // Reduced delay

  // Get data from our mock database
  const data = mockDatabase[entity as keyof typeof mockDatabase] as any[]

  if (!data) {
    throw new Error(`Entity "${entity}" not found`)
  }

  // Apply filters if any
  let filteredData = [...data]

  if (Object.keys(filter).length > 0) {
    console.log(`[mock-graphql] Applying filters for ${entity}:`, filter)

    filteredData = filteredData.filter((item) => {
      // Handle special OR logic for advanced filtering
      if (filter.$or && Array.isArray(filter.$or)) {
        // If any condition in the OR array matches, return true
        return filter.$or.some((condition) => {
          return matchesFilterCondition(item, condition.field, condition.operator, condition.value)
        })
      }

      // Standard AND logic for regular filters
      return Object.entries(filter).every(([key, filterValue]) => {
        // Skip special keys like $or
        if (key === "$or") return true

        // Handle special filter objects with operators
        if (filterValue && typeof filterValue === "object" && "operator" in filterValue && "value" in filterValue) {
          const { operator, value } = filterValue
          const matches = matchesFilterCondition(item, key, operator, value)

          // Debug log for important filters
          if (key === "company" || key === "relatedTo" || key === "clientName" || key === "dealId") {
            console.log(
              `[mock-graphql] Filter ${key} ${operator} ${value} on item ${key}=${item[key]}: ${matches ? "MATCH" : "NO MATCH"}`,
            )
          }

          return matches
        }

        // Simple string contains filter (default behavior)
        if (typeof filterValue === "string" && typeof item[key] === "string") {
          return item[key].toLowerCase().includes(filterValue.toLowerCase())
        }

        return item[key] === filterValue
      })
    })

    console.log(`[mock-graphql] After applying filters: ${filteredData.length} items`)
    if (entity === "dealTeams") {
      console.log(
        `[mock-graphql] Sample filtered dealTeams:`,
        filteredData.slice(0, 3).map((item: any) => ({
          id: item.id,
          dealId: item.dealId,
          name: item.name,
        })),
      )
    }
  }

  // Special handling for ID filtering - with enhanced logging
  if (
    filter.id &&
    typeof filter.id === "object" &&
    "operator" in filter.id &&
    filter.id.operator === "=" &&
    filter.id.value !== undefined
  ) {
    const idValue = filter.id.value
    console.log(`[mock-graphql] ID filter detected. Looking for entity with ID: ${idValue} (${typeof idValue})`)
    console.log(`[mock-graphql] Current filtered data count before ID filtering: ${filteredData.length}`)

    // Create a new filtered array specifically for ID filtering
    // Use the original data array to ensure we're not filtering an already filtered list
    const idFilteredData = data.filter((item) => {
      // Convert both to strings for comparison to ensure type consistency
      const itemIdStr = String(item.id)
      const filterIdStr = String(idValue)

      const match = itemIdStr === filterIdStr
      console.log(`[mock-graphql] Comparing item ID: ${itemIdStr} with filter ID: ${filterIdStr}, match: ${match}`)

      return match
    })

    console.log(`[mock-graphql] After ID filtering: ${idFilteredData.length} items found`)

    // Important: Replace the filteredData with our ID-filtered results
    filteredData = idFilteredData

    // Debug the first item to make sure we have the right one
    if (filteredData.length > 0) {
      console.log("[mock-graphql] First item after ID filtering:", filteredData[0])
    } else {
      console.log("[mock-graphql] No items found with ID:", idValue)

      // Additional fallback approach - try loose equality
      const fallbackFilteredData = data.filter((item) => item.id == idValue)
      if (fallbackFilteredData.length > 0) {
        console.log("[mock-graphql] Found items using loose equality:", fallbackFilteredData.length)
        filteredData = fallbackFilteredData
      }
    }
  }

  // Apply sorting if specified
  if (sort.length > 0) {
    filteredData.sort((a, b) => {
      // Apply each sort in order
      for (const { field, direction } of sort) {
        const comparison = compareValues(a, b, field, direction)
        if (comparison !== 0) return comparison
      }
      return 0
    })
  }

  // Apply limit if specified (before pagination)
  if (limit && limit > 0) {
    filteredData = filteredData.slice(0, limit)
  }

  // Calculate pagination
  const total = filteredData.length
  const totalPages = Math.ceil(total / pagination.pageSize)
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize

  // Get paginated data
  const paginatedData = filteredData.slice(start, end)

  // Debug the paginated data
  console.log(
    `[mock-graphql] After pagination: ${paginatedData.length} items, first item:`,
    paginatedData.length > 0 ? paginatedData[0].id : "none",
  )

  // Select only the requested fields
  const selectedData = paginatedData.map((item) => {
    const result: Record<string, any> = {}

    fields.forEach((field) => {
      // Handle nested fields (e.g., "originationDetails.dealTeamComplete")
      if (field.includes(".")) {
        const [parent, child] = field.split(".")
        if (item[parent] && typeof item[parent] === "object") {
          result[field] = item[parent][child]
        } else {
          result[field] = undefined
        }
      } else {
        result[field] = item[field]
      }
    })

    return result
  }) as T[]

  // Debug the final selected data
  console.log(
    `[mock-graphql] Final selected data: ${selectedData.length} items, first item ID:`,
    selectedData.length > 0 ? selectedData[0].id : "none",
  )

  return {
    data: selectedData,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages,
  }
}
