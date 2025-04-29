"use client"

import { Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLayoutWidth } from "@/contexts/layout-width-context"

export function LayoutWidthSelector() {
  const { layoutWidth, setLayoutWidth } = useLayoutWidth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2">
          {layoutWidth === "fluid" ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
          <span className="hidden sm:inline">Layout</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLayoutWidth("fluid")}
          className={layoutWidth === "fluid" ? "bg-primary/10 text-primary font-medium" : ""}
        >
          <Maximize className="mr-2 h-4 w-4" />
          <span>Fluid</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLayoutWidth("fixed")}
          className={layoutWidth === "fixed" ? "bg-primary/10 text-primary font-medium" : ""}
        >
          <Minimize className="mr-2 h-4 w-4" />
          <span>Fixed</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
