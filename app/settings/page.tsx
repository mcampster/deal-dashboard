"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { viewsConfig } from "@/config/views"

// Use the first view as a placeholder
const placeholderView = viewsConfig[0]

export default function SettingsPage() {
  // Simple placeholder for now
  return (
    <AppLayout currentView={placeholderView} onApplyCustomConfig={() => {}}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure application settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This feature is under development.</p>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
