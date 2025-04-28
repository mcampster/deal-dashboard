import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to parse currency values
export function parseCurrencyValue(value: string | number): number {
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
