/**
 * This utility fixes "stage" references in mock data at runtime
 */

// Function to recursively fix "stage" references in an object
export function fixStageReferences(obj: any): any {
  if (!obj) return obj

  // If it's an array, fix each item
  if (Array.isArray(obj)) {
    return obj.map((item) => fixStageReferences(item))
  }

  // If it's not an object, return as is
  if (typeof obj !== "object") {
    return obj
  }

  // Create a new object with fixed properties
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    // If the key is "stage", change it to "phase"
    const newKey = key === "stage" ? "phase" : key

    // Recursively fix the value
    result[newKey] = fixStageReferences(value)
  }

  return result
}

// Function to fix mock data before it's used
export function fixMockData(data: any): any {
  return fixStageReferences(data)
}
