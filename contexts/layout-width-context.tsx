"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type LayoutWidth = "fluid" | "fixed"

interface LayoutWidthProviderProps {
  children: React.ReactNode
}

interface LayoutWidthContextType {
  layoutWidth: LayoutWidth
  setLayoutWidth: (width: LayoutWidth) => void
}

const LayoutWidthContext = createContext<LayoutWidthContextType | undefined>(undefined)

export function LayoutWidthProvider({ children }: LayoutWidthProviderProps) {
  // Initialize with fluid layout
  const [layoutWidth, setLayoutWidthState] = useState<LayoutWidth>("fluid")

  // Load layout width preference from localStorage on mount
  useEffect(() => {
    try {
      const savedLayoutWidth = localStorage.getItem("layoutWidth") as LayoutWidth | null
      if (savedLayoutWidth && ["fluid", "fixed"].includes(savedLayoutWidth)) {
        setLayoutWidthState(savedLayoutWidth)
        console.log("Loaded layout width from localStorage:", savedLayoutWidth)
      }
    } catch (error) {
      console.error("Error loading layout width from localStorage:", error)
    }
  }, [])

  // Update layout width and save to localStorage
  const setLayoutWidth = (newLayoutWidth: LayoutWidth) => {
    try {
      setLayoutWidthState(newLayoutWidth)
      localStorage.setItem("layoutWidth", newLayoutWidth)
      console.log("Saved layout width to localStorage:", newLayoutWidth)
    } catch (error) {
      console.error("Error saving layout width to localStorage:", error)
    }
  }

  return <LayoutWidthContext.Provider value={{ layoutWidth, setLayoutWidth }}>{children}</LayoutWidthContext.Provider>
}

export function useLayoutWidth() {
  const context = useContext(LayoutWidthContext)
  if (context === undefined) {
    throw new Error("useLayoutWidth must be used within a LayoutWidthProvider")
  }
  return context
}
