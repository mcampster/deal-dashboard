"use client"

import type React from "react"

import { useEffect } from "react"

interface KeyboardShortcutsProps {
  searchInputRef: React.RefObject<HTMLInputElement>
}

export function KeyboardShortcuts({ searchInputRef }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement !== searchInputRef.current) {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [searchInputRef])

  return null
}
