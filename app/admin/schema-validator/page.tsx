"use client"

import { AppLayout } from "@/components/app-layout"
import { SchemaValidatorDemo } from "@/components/schema-validator-demo"
import { viewsConfig } from "@/config/views"

// Use the first view as a placeholder for the layout
const placeholderView = viewsConfig[0]

export default function SchemaValidatorPage() {
  return (
    <AppLayout currentView={placeholderView} onApplyCustomConfig={() => {}}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Configuration Schema Validator</h1>
        <p className="text-muted-foreground">Validate and generate configurations using the JSON schema</p>
      </div>

      <SchemaValidatorDemo />
    </AppLayout>
  )
}
