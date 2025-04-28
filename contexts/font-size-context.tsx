"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type FontSize = "small" | "medium" | "large"

interface FontSizeContextType {
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined)

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with medium font size
  const [fontSize, setFontSizeState] = useState<FontSize>("medium")

  // Load font size from localStorage on mount
  useEffect(() => {
    try {
      const savedFontSize = localStorage.getItem("fontSize") as FontSize | null
      if (savedFontSize && ["small", "medium", "large"].includes(savedFontSize)) {
        setFontSizeState(savedFontSize)
        console.log("Loaded font size from localStorage:", savedFontSize)

        // Apply font size class to the document body
        document.body.classList.remove("text-small", "text-medium", "text-large")
        document.body.classList.add(`text-${savedFontSize}`)
      }
    } catch (error) {
      console.error("Error loading font size from localStorage:", error)
    }
  }, [])

  // Update font size and save to localStorage
  const setFontSize = (size: FontSize) => {
    try {
      setFontSizeState(size)
      localStorage.setItem("fontSize", size)
      console.log("Saved font size to localStorage:", size)

      // Apply font size class to the document body
      document.body.classList.remove("text-small", "text-medium", "text-large")
      document.body.classList.add(`text-${size}`)
    } catch (error) {
      console.error("Error saving font size to localStorage:", error)
    }
  }

  return <FontSizeContext.Provider value={{ fontSize, setFontSize }}>{children}</FontSizeContext.Provider>
}

export function useFontSize() {
  const context = useContext(FontSizeContext)
  if (context === undefined) {
    throw new Error("useFontSize must be used within a FontSizeProvider")
  }
  return context
}
