"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface GlobalSearchProps {
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
}

export function GlobalSearch({ placeholder = "Search...", className, onSearch }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = () => {
    if (onSearch) onSearch(query)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setQuery("")
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div
      className={cn(
        "relative flex items-center w-full max-w-md transition-all duration-100",
        isFocused && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        className,
      )}
    >
      <div className="absolute left-3 text-muted-foreground">
        <Search size={18} />
      </div>
      <Input
        ref={inputRef}
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "pl-10 pr-10 h-10 bg-muted/50 border-muted focus-visible:bg-background",
          "rounded-full w-full transition-all duration-100",
          "placeholder:text-muted-foreground/70",
        )}
      />
      {query && (
        <button
          onClick={clearSearch}
          className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      )}
      <div className="absolute right-3 text-xs text-muted-foreground hidden md:flex items-center space-x-1">
        {!query && (
          <>
            <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px]">/</kbd>
          </>
        )}
      </div>
    </div>
  )
}
