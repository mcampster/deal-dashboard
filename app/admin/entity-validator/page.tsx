"use client"

import { AppLayout } from "@/components/app-layout"
import { EntityValidatorDemo } from "@/components/entity-validator-demo"
import { viewsConfig } from "@/config/views"

// Use the first view as a placeholder for the layout
const placeholderView = viewsConfig[0]

export default function EntityValidatorPage() {
  return (
    <AppLayout currentView={placeholderView} onApplyCustomConfig={() => {}}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Entity Validator</h1>
        <p className="text-muted-foreground">Validate and manage your data entities using JSON schemas</p>
      </div>

      <EntityValidatorDemo />
    </AppLayout>
  )
}
