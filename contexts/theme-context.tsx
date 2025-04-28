"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
}

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize with system theme
  const [theme, setThemeState] = useState<Theme>("system")

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme") as Theme | null
      if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
        setThemeState(savedTheme)
        console.log("Loaded theme from localStorage:", savedTheme)
      }
    } catch (error) {
      console.error("Error loading theme from localStorage:", error)
    }
  }, [])

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement

    // Remove the previous theme class
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  // Update theme and save to localStorage
  const setTheme = (newTheme: Theme) => {
    try {
      setThemeState(newTheme)
      localStorage.setItem("theme", newTheme)
      console.log("Saved theme to localStorage:", newTheme)
    } catch (error) {
      console.error("Error saving theme to localStorage:", error)
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
