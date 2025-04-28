"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface EntityDataViewerProps {
  entityName: string
  displayName: string
  data: any[]
  description?: string
}

export function EntityDataViewer({ entityName, displayName, data, description }: EntityDataViewerProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter data based on search term
  const filteredData = searchTerm
    ? data.filter((item) => JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()))
    : data

  // Function to download entity data as JSON
  const downloadEntityData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${entityName}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{displayName} Data</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[200px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={downloadEntityData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md bg-muted p-4 overflow-auto max-h-[600px]">
          <pre className="text-sm">{JSON.stringify(filteredData, null, 2)}</pre>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Showing {filteredData.length} of {data.length} {displayName.toLowerCase()}
          </p>
          <p className="text-sm text-muted-foreground">
            Entity Type: <code>{entityName}</code>
          </p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
