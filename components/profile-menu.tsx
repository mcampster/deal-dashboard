"use client"

import { User, Moon, Sun, Monitor, ScalingIcon, Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/contexts/theme-context"
import { useFontSize } from "@/contexts/font-size-context"
import { useLayoutWidth } from "@/contexts/layout-width-context"

export function ProfileMenu() {
  const { theme, setTheme } = useTheme()
  const { fontSize, setFontSize } = useFontSize()
  const { layoutWidth, setLayoutWidth } = useLayoutWidth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">Profile menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Appearance</DropdownMenuLabel>

          {/* Theme options */}
          <DropdownMenuItem
            onClick={() => setTheme("light")}
            className={theme === "light" ? "bg-primary/10 text-primary font-medium" : ""}
          >
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            className={theme === "dark" ? "bg-primary/10 text-primary font-medium" : ""}
          >
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            className={theme === "system" ? "bg-primary/10 text-primary font-medium" : ""}
          >
            <Monitor className="mr-2 h-4 w-4" />
            <span>System</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Font Size</DropdownMenuLabel>

          {/* Font size options */}
          <DropdownMenuItem
            onClick={() => setFontSize("small")}
            className={fontSize === "small" ? "bg-primary/10 text-primary font-medium" : ""}
          >
            <ScalingIcon className="mr-2 h-4 w-4" />
            <span className="text-sm">Small</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setFontSize("medium")}
            className={fontSize === "medium" ? "bg-primary/10 text-primary font-medium" : ""}
          >
            <ScalingIcon className="mr-2 h-4 w-4" />
            <span className="text-base">Medium</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setFontSize("large")}
            className={fontSize === "large" ? "bg-primary/10 text-primary font-medium" : ""}
          >
            <ScalingIcon className="mr-2 h-4 w-4" />
            <span className="text-lg">Large</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Layout Width</DropdownMenuLabel>

          {/* Layout width options */}
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
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
