"use client"

import { ScalingIcon as FontSize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useFontSize } from "@/contexts/font-size-context"

export function FontSizeSelector() {
  const { fontSize, setFontSize } = useFontSize()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <FontSize className="h-4 w-4" />
          <span className="hidden sm:inline">Font Size</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setFontSize("small")}
          className={fontSize === "small" ? "bg-primary/10 text-primary font-medium" : ""}
        >
          <span className="text-sm">Small</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setFontSize("medium")}
          className={fontSize === "medium" ? "bg-primary/10 text-primary font-medium" : ""}
        >
          <span className="text-base">Medium</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setFontSize("large")}
          className={fontSize === "large" ? "bg-primary/10 text-primary font-medium" : ""}
        >
          <span className="text-lg">Large</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
