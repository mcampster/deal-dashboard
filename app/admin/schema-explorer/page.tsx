"use client"

import { AppLayout } from "@/components/app-layout"
import { SchemaExplorer } from "@/components/schema-explorer"
import { viewsConfig } from "@/config/views"

// Use the first view as a placeholder for the layout
const placeholderView = viewsConfig[0]

export default function SchemaExplorerPage() {
  return (
    <AppLayout currentView={placeholderView} onApplyCustomConfig={() => {}}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Schema Explorer</h1>
        <p className="text-muted-foreground">View and explore the JSON schemas that define your data models</p>
      </div>

      <SchemaExplorer />
    </AppLayout>
  )
}
