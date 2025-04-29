"use client"

import { useRef } from "react"
import { GlobalSearch } from "./global-search"
import { KeyboardShortcuts } from "./keyboard-shortcuts"

export function HeaderWithSearch() {
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (query: string) => {
    console.log("Searching for:", query)
    // Implement your search logic here
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex flex-1 items-center gap-4 md:gap-6">
        <div className="hidden md:block md:w-auto flex-1">
          <GlobalSearch placeholder="Search deals, clients, contacts..." onSearch={handleSearch} />
        </div>

        {/* Other header elements like profile menu, notifications, etc. */}
      </div>
      <KeyboardShortcuts searchInputRef={searchInputRef} />
    </header>
  )
}
