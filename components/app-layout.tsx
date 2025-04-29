"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Bell, Menu, Settings, BookOpen, Users, BarChart4 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Toaster } from "@/components/ui/toaster"
import { StickyConfigPanel } from "@/components/sticky-config-panel"
import { AIInput } from "@/components/ai-input"
import { ProfileMenu } from "@/components/profile-menu"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { LayoutWidthSelector } from "@/components/layout-width-selector"
import { iconMap } from "@/config/icons"
import type { ViewConfig } from "@/config/types"
import { cn } from "@/lib/utils"
import { useLayoutWidth } from "@/contexts/layout-width-context"

interface AppLayoutProps {
  children: React.ReactNode
  currentView: ViewConfig
  onApplyCustomConfig: (config: ViewConfig) => void
}

export function AppLayout({ children, currentView, onApplyCustomConfig }: AppLayoutProps) {
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const pathname = usePathname()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { layoutWidth } = useLayoutWidth()

  // Navigation items with proper routes and separators - keeping the original structure
  const navItems = [
    // Dashboard section
    { type: "link", href: "/", label: "Dashboard", icon: "dashboard" },
    { type: "separator", label: "Investment Banking" },
    // Investment Banking section - using dynamic routes
    { type: "link", href: "/deals", label: "Deals", icon: "dollar" },
    { type: "link", href: "/dealTeams", label: "Deal Teams", icon: "users" },
    { type: "link", href: "/books", label: "Books", icon: "book" },
    { type: "separator", label: "CRM" },
    // CRM section - using dynamic routes
    { type: "link", href: "/contacts", label: "Contacts", icon: "user" },
    { type: "link", href: "/clients", label: "Clients", icon: "building" },
    { type: "link", href: "/activities", label: "Activities", icon: "calendar" },
    { type: "separator", label: "Admin" },
    // Admin section - updated paths
    { type: "link", href: "/admin/data-explorer", label: "Data Explorer", icon: "database" },
    { type: "link", href: "/admin/entity-validator", label: "Entity Validator", icon: "file-json" },
    { type: "link", href: "/admin/schema-validator", label: "Schema Validator", icon: "settings" },
    { type: "link", href: "/admin/schema-explorer", label: "Schema Explorer", icon: "file-json" },
    { type: "link", href: "/test", label: "Test Page", icon: "settings" },
  ]

  // Add new icons to iconMap
  iconMap.book = BookOpen
  iconMap.users = Users
  iconMap.charts = BarChart4

  // Ensure the dashboard icon exists
  const DashboardIcon = iconMap.dashboard

  // Determine container class based on layout width preference
  const containerClass = layoutWidth === "fixed" ? "container mx-auto p-4 md:p-6" : "w-full p-4 md:p-6"

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0 w-[70px]">
            <nav className="grid gap-1 py-2">
              {navItems.map((item, index) => {
                if (item.type === "separator") {
                  return (
                    <div key={`separator-${index}`} className="mt-3 mb-1 px-2">
                      <div className="h-px bg-border" />
                    </div>
                  )
                }

                const isActive = pathname === item.href
                const NavIcon = iconMap[item.icon as keyof typeof iconMap]

                // Only render if the icon exists
                if (!NavIcon) return null

                return (
                  <Link
                    key={item.label}
                    href={item.href as string}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 px-1 text-[10px] transition-colors rounded-md mx-1",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                  >
                    <NavIcon className="h-4 w-4 mb-1" />
                    <span className="text-center line-clamp-2">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <DashboardIcon className="h-5 w-5" />
          <span className="sr-only sm:not-sr-only">Investment Banking</span>
        </Link>

        {/* AI Input in the middle */}
        <div className="mx-auto flex-1 flex justify-center">
          <AIInput onApplyConfig={onApplyCustomConfig} currentConfig={currentView} inputRef={searchInputRef} />
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Layout Width Selector */}
          <LayoutWidthSelector />

          {/* Config Panel Toggle Button */}
          <Button
            variant={showConfigPanel ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => {
              console.log("Toggling Config Panel")
              setShowConfigPanel(!showConfigPanel)
            }}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">View Config</span>
          </Button>

          <Button size="icon" variant="ghost">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Profile Menu */}
          <ProfileMenu />
        </div>
      </header>

      {/* Add padding to account for fixed header */}
      <div className="pt-16 flex flex-1">
        {/* Fixed Icon-based Sidebar Navigation */}
        <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-[70px] border-r bg-background z-20 overflow-y-auto">
          <div className="flex h-full flex-col">
            <div className="flex-1 py-2">
              <nav className="grid gap-1">
                {navItems.map((item, index) => {
                  if (item.type === "separator") {
                    return (
                      <div key={`separator-${index}`} className="mt-3 mb-1 px-2">
                        <div className="h-px bg-border" />
                      </div>
                    )
                  }

                  const isActive = pathname === item.href
                  const NavIcon = iconMap[item.icon as keyof typeof iconMap]

                  // Only render if the icon exists
                  if (!NavIcon) return null

                  return (
                    <Link
                      key={item.label}
                      href={item.href as string}
                      className={cn(
                        "flex flex-col items-center justify-center py-2 px-1 text-[10px] transition-colors rounded-md mx-1",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent",
                      )}
                    >
                      <NavIcon className="h-4 w-4 mb-1" />
                      <span className="text-center line-clamp-2">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content with Sticky Config Panel - add left padding to account for fixed sidebar */}
        <div className="flex flex-1 md:pl-[70px]">
          <main className="flex-1 overflow-auto">
            <div className={containerClass}>{children}</div>
          </main>

          {/* Sticky Config Panel */}
          <StickyConfigPanel
            onApplyConfig={onApplyCustomConfig}
            currentConfig={currentView}
            visible={showConfigPanel}
            onVisibilityChange={setShowConfigPanel}
          />
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts searchInputRef={searchInputRef} />
    </div>
  )
}
