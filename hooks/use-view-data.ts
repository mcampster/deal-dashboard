"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { query, type QueryResult } from "@/lib/mock-graphql"
import { getMockData } from "@/lib/mock-data" // Import direct data access function
import type { ViewConfig, PaginationState, FilterState, FilterConfig, SortConfig } from "@/config/types"
import { fixMockData } from "@/lib/mock-data-fixer"

interface UseViewDataOptions {
  view: ViewConfig
  pagination?: PaginationState
  filter?: FilterState
  fields?: string[] // Add custom fields option
  key?: string // Add key for forcing refresh
}

interface UseViewDataResult<T = any> {
  data: T[]
  isLoading: boolean
  error: Error | null
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  refresh: () => void
  setPage: (page: number) => void
  setFilter: (filter: FilterState) => void
  currentFilter?: FilterState // Expose the current filter state
}

// Counter to generate unique IDs for each hook instance
let hookInstanceCounter = 0

export function useViewData<T = any>({
  view,
  pagination = { page: 1, pageSize: 10 },
  filter = {},
  fields: customFields,
  key,
}: UseViewDataOptions): UseViewDataResult<T> {
  const [queryResult, setQueryResult] = useState<QueryResult<T> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [currentPagination, setCurrentPagination] = useState(pagination)
  const [currentFilter, setCurrentFilter] = useState<FilterState>(filter)
  const [refreshCounter, setRefreshCounter] = useState(0)

  // Create refs for tracking request IDs and hook instance ID
  const requestIdRef = useRef(0)
  const hookIdRef = useRef(`hook_${++hookInstanceCounter}`)
  const viewIdRef = useRef(view.id)
  const initialLoadRef = useRef(false)

  // Log when view ID changes
  if (viewIdRef.current !== view.id) {
    console.log(`[hook_${hookInstanceCounter}] View ID changed from ${viewIdRef.current} to ${view.id}`)
    viewIdRef.current = view.id
  }

  // Log the hook instance and its parameters for debugging
  const hookId = hookIdRef.current
  const hasIdFilter = filter.id !== undefined

  // Extract specific view properties we care about to avoid reference equality issues
  const viewId = view.id
  const viewEntity = view.entity
  const viewColumns = view.columns
  const viewFilters = view.filters
  const viewSort = view.sort
  const viewLimit = view.limit

  // Memoize fields to prevent unnecessary re-renders
  const fields = useMemo(() => {
    // If custom fields are provided, use them
    if (customFields) {
      const fieldList = [...customFields]
      return fieldList.includes("id") ? fieldList : [...fieldList, "id"]
    }

    // Otherwise use column fields
    const fieldList = viewColumns ? viewColumns.map((column) => column.field) : ["id"]
    return fieldList.includes("id") ? fieldList : [...fieldList, "id"]
    // Use JSON.stringify to create a stable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(customFields), JSON.stringify(viewColumns?.map((c) => c.field))])

  // Memoize sort config to prevent unnecessary re-renders
  const sortConfig = useMemo(() => {
    return viewSort
      ? viewSort.map((sort: SortConfig) => ({
          field: sort.field,
          direction: sort.direction,
        }))
      : undefined
  }, [viewSort])

  // Apply filters from the view configuration when the view changes
  useEffect(() => {
    console.log(`[${hookId}] View changed to: ${viewId}, applying filters from view config`)

    if (viewFilters && viewFilters.length > 0) {
      const configFilters: FilterState = {}

      viewFilters.forEach((filterConfig: FilterConfig) => {
        configFilters[filterConfig.field] = {
          operator: filterConfig.operator,
          value: filterConfig.value,
        }
      })

      // Use a functional update to avoid dependency on currentFilter
      setCurrentFilter((prevFilter) => {
        // Preserve ID filter if it exists
        const idFilter = prevFilter.id ? { id: prevFilter.id } : {}
        return {
          ...configFilters,
          ...idFilter, // Keep the ID filter
        }
      })
    } else if (!hasIdFilter) {
      // Clear filters if the view doesn't have any, but preserve ID filter if it exists
      setCurrentFilter((prevFilter) => {
        const idFilter = prevFilter.id ? { id: prevFilter.id } : {}
        return idFilter
      })
    }

    // Force a refresh when view changes
    setRefreshCounter((prev) => prev + 1)
  }, [viewId, viewFilters, hasIdFilter, hookId]) // Include viewId to ensure filters update when view changes

  // Fetch data effect
  useEffect(() => {
    let isMounted = true
    const currentRequestId = ++requestIdRef.current

    // Log when the effect runs with the current view ID
    console.log(
      `[${hookId}] Data fetch effect running for view: ${viewId}, entity: ${viewEntity}, key: ${key || "none"}`,
    )

    // If no entity is specified, return empty data
    if (!viewEntity) {
      if (isMounted) {
        setQueryResult({
          data: [],
          total: 0,
          page: currentPagination.page,
          pageSize: currentPagination.pageSize,
          totalPages: 0,
        })
        setIsLoading(false)
      }
      return
    }

    // Set loading state only if this is not a subsequent load
    if (!initialLoadRef.current) {
      setIsLoading(true)
    }

    setError(null)

    // Try to use the query function first
    const fetchData = async () => {
      try {
        console.log(`[${hookId}] Fetching data for entity: ${viewEntity}, fields:`, fields)
        console.log(`[${hookId}] Current filter:`, currentFilter)

        // Try to get data using the query function
        const result = await query<T>({
          entity: viewEntity,
          fields,
          pagination: currentPagination,
          filter: currentFilter,
          sort: sortConfig,
          limit: viewLimit,
        })

        if (isMounted && currentRequestId === requestIdRef.current) {
          console.log(`[${hookId}] Data received:`, result.data.length, "items")
          const fixedData = fixMockData(result.data)
          setQueryResult({ ...result, data: fixedData })
          initialLoadRef.current = true
        }
      } catch (err) {
        console.error(`[${hookId}] Error fetching data:`, err)

        if (isMounted && currentRequestId === requestIdRef.current) {
          // FALLBACK: Try direct access to mock data if entity is available
          console.log(`[${hookId}] Trying direct data access as fallback`)
          let directData = getMockData(viewEntity) as T[]

          // Apply ID filter if it exists
          if (currentFilter.id && typeof currentFilter.id === "object" && "value" in currentFilter.id) {
            const idValue = currentFilter.id.value
            console.log(`[${hookId}] Applying ID filter to direct data: ${idValue}`)

            directData = directData.filter((item: any) => {
              // Convert both to strings for comparison
              const itemIdStr = String(item.id)
              const filterIdStr = String(idValue)
              const match = itemIdStr === filterIdStr

              console.log(`[${hookId}] Direct data ID comparison: ${itemIdStr} === ${filterIdStr} = ${match}`)
              return match
            })

            console.log(`[${hookId}] After ID filtering: ${directData.length} items`)
          }

          if (directData && directData.length > 0) {
            // Apply limit if specified
            if (viewLimit && viewLimit > 0) {
              directData = directData.slice(0, viewLimit)
            }

            // Apply pagination
            const total = directData.length
            const totalPages = Math.ceil(total / currentPagination.pageSize)
            const start = (currentPagination.page - 1) * currentPagination.pageSize
            const end = start + currentPagination.pageSize

            const paginatedData = directData.slice(start, end)
            const fixedData = fixMockData(paginatedData)

            setQueryResult({
              data: fixedData,
              total,
              page: currentPagination.page,
              pageSize: currentPagination.pageSize,
              totalPages,
            })
            initialLoadRef.current = true
          } else {
            setError(err instanceof Error ? err : new Error(String(err)))
          }
        }
      } finally {
        if (isMounted && currentRequestId === requestIdRef.current) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [viewId, viewEntity, viewLimit, currentFilter, currentPagination, sortConfig, fields, refreshCounter, hookId, key])

  const refresh = () => {
    console.log(`[${hookId}] Refreshing data for view: ${viewId}`)
    setRefreshCounter((prev) => prev + 1)
  }

  const setPage = (page: number) => {
    console.log(`[${hookId}] Setting page to: ${page} for view: ${viewId}`)
    setCurrentPagination((prev) => ({ ...prev, page }))
  }

  const setFilter = (filter: FilterState) => {
    console.log(`[${hookId}] Setting new filter for view: ${viewId}:`, filter)
    setCurrentFilter(filter)
    // Reset to first page when filter changes
    setCurrentPagination((prev) => ({ ...prev, page: 1 }))
  }

  return {
    data: queryResult?.data || [],
    isLoading,
    error,
    pagination: {
      page: queryResult?.page || currentPagination.page,
      pageSize: queryResult?.pageSize || currentPagination.pageSize,
      total: queryResult?.total || 0,
      totalPages: queryResult?.totalPages || 0,
    },
    refresh,
    setPage,
    setFilter,
    currentFilter, // Expose the current filter state
  }
}
