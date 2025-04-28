"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DebugPanelProps {
  data: any
  title: string
}

export function DebugPanel({ data, title }: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">{title}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-2">
          <pre className="text-xs overflow-auto max-h-[300px] bg-muted p-2 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      )}
    </Card>
  )
}
