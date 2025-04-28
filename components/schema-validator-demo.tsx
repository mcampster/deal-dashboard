"use client"

import { useState } from "react"
import { validateConfig, generateMinimalConfig } from "@/lib/schema-validator"
import { generateListView, generateDashboard, generateFilteredView } from "@/lib/config-generator"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SchemaValidatorDemo() {
  const [configText, setConfigText] = useState("")
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    errors: any[]
    errorMessage: string | null
  } | null>(null)

  const validateCurrentConfig = () => {
    try {
      const config = JSON.parse(configText)
      const result = validateConfig(config)
      setValidationResult(result)
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [],
        errorMessage: `Invalid JSON: ${(error as Error).message}`,
      })
    }
  }

  const generateConfig = (type: string) => {
    let config

    switch (type) {
      case "minimal-list":
        config = generateMinimalConfig("list")
        break
      case "minimal-dashboard":
        config = generateMinimalConfig("dashboard")
        break
      case "deals-list":
        config = generateListView("deals")
        break
      case "contacts-list":
        config = generateListView("contacts")
        break
      case "clients-list":
        config = generateListView("clients")
        break
      case "deals-dashboard":
        config = generateDashboard("deals")
        break
      case "contacts-dashboard":
        config = generateDashboard("contacts")
        break
      case "clients-dashboard":
        config = generateDashboard("clients")
        break
      case "filtered-deals":
        const dealsView = generateListView("deals")
        config = generateFilteredView(dealsView, "value", ">", "$100,000", "High Value Deals")
        break
      default:
        config = generateMinimalConfig("list")
    }

    setConfigText(JSON.stringify(config, null, 2))
    setValidationResult(null)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuration Schema Validator</CardTitle>
        <CardDescription>
          Validate your configuration against the JSON schema or generate example configurations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="config" className="text-sm font-medium">
              Configuration JSON
            </label>
            <Select onValueChange={generateConfig}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Generate example..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal-list">Minimal List View</SelectItem>
                <SelectItem value="minimal-dashboard">Minimal Dashboard</SelectItem>
                <SelectItem value="deals-list">Deals List View</SelectItem>
                <SelectItem value="contacts-list">Contacts List View</SelectItem>
                <SelectItem value="clients-list">Clients List View</SelectItem>
                <SelectItem value="deals-dashboard">Deals Dashboard</SelectItem>
                <SelectItem value="contacts-dashboard">Contacts Dashboard</SelectItem>
                <SelectItem value="clients-dashboard">Clients Dashboard</SelectItem>
                <SelectItem value="filtered-deals">Filtered Deals View</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            id="config"
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
            className="font-mono h-[400px]"
            placeholder={`{
  "id": "example-view",
  "label": "Example View",
  "icon": "dashboard",
  "description": "An example view",
  "type": "list",
  "entity": "deals",
  "columns": [
    { "key": "name", "label": "Name", "type": "text", "field": "name" }
  ],
  "actions": [
    { "id": "refresh", "label": "Refresh", "icon": "refresh", "type": "secondary" }
  ]
}`}
          />
        </div>

        {validationResult && (
          <Alert variant={validationResult.valid ? "default" : "destructive"}>
            {validationResult.valid ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Valid Configuration</AlertTitle>
                <AlertDescription>The configuration is valid according to the schema.</AlertDescription>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Invalid Configuration</AlertTitle>
                <AlertDescription>
                  <pre className="mt-2 whitespace-pre-wrap text-sm">{validationResult.errorMessage}</pre>
                </AlertDescription>
              </>
            )}
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={validateCurrentConfig}>Validate Configuration</Button>
      </CardFooter>
    </Card>
  )
}
