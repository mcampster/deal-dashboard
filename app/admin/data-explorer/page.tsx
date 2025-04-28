"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download, Search } from "lucide-react"
import { viewsConfig } from "@/config/views"
import { mockDatabase } from "@/lib/mock-data"

// Use the first view as a placeholder for the layout
const placeholderView = viewsConfig[0]

export default function DataExplorerPage() {
  const [activeTab, setActiveTab] = useState("deals")
  const [searchTerm, setSearchTerm] = useState("")

  // Filter data based on search term
  const getFilteredData = (data: any[]) => {
    if (!searchTerm) return data

    return data.filter((item) =>
      Object.values(item).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }

  // Download data as JSON
  const downloadData = (entity: string) => {
    const data = mockDatabase[entity as keyof typeof mockDatabase]
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${entity}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <AppLayout currentView={placeholderView} onApplyCustomConfig={() => {}}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Data Explorer</h1>
        <p className="text-muted-foreground">View and explore the raw data that powers the application</p>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search data..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={() => downloadData(activeTab)} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Download</span>
        </Button>
      </div>

      <Tabs defaultValue="deals" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="dealTeams">Deal Teams</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
        </TabsList>

        {Object.keys(mockDatabase).map((entity) => {
          const data = mockDatabase[entity as keyof typeof mockDatabase]
          const filteredData = getFilteredData(data)

          return (
            <TabsContent key={entity} value={entity}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{entity.charAt(0).toUpperCase() + entity.slice(1)} Data</CardTitle>
                      <CardDescription>
                        {filteredData.length} of {data.length} records
                        {searchTerm && ` (filtered by "${searchTerm}")`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md bg-muted p-4 overflow-auto max-h-[800px]">
                    <pre className="text-sm">{JSON.stringify(filteredData, null, 2)}</pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </AppLayout>
  )
}
