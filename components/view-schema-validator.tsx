"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/dashboard-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { validateViewConfig } from "@/lib/config-validator"
import { getViewById, viewsConfig } from "@/config/views"
import type { ViewConfig } from "@/config/types"
import dealsSchema from "@/schema/deals-schema.json"
import clientsSchema from "@/schema/clients-schema.json"
import contactsSchema from "@/schema/contacts-schema.json"

export function ViewSchemaValidator() {
  const [activeView, setActiveView] = useState<ViewConfig | null>(null)
  const [validationResults, setValidationResults] = useState<any>(null)
  const [selectedTab, setSelectedTab] = useState("schema")

  const schemaMap: Record<string, any> = {
    deals: dealsSchema,
    clients: clientsSchema,
    contacts: contactsSchema,
  }

  const validateView = (viewId: string) => {
    const view = getViewById(viewId)
    if (!view) return

    setActiveView(view)

    // Get schema for this entity
    const schema = schemaMap[view.entity]
    if (!schema) {
      setValidationResults({
        valid: false,
        error: `No schema found for entity: ${view.entity}`,
        invalidFields: [],
      })
      return
    }

    // Validate fields against schema
    const validFields = Object.keys(schema.properties || {})
    const invalidFields: string[] = []

    // Check columns
    if (view.columns) {
      view.columns.forEach((column) => {
        const field = typeof column === "string" ? column : column.field
        if (field && !validFields.includes(field)) {
          invalidFields.push(`Column: ${field}`)
        }
      })
    }

    // Check quick filters
    if (view.quickFilters) {
      view.quickFilters.forEach((filter) => {
        if (filter.field && !validFields.includes(filter.field)) {
          invalidFields.push(`QuickFilter: ${filter.field}`)
        }
      })
    }

    // Check sort fields
    if (view.defaultSort) {
      view.defaultSort.forEach((sort) => {
        if (sort.field && !validFields.includes(sort.field)) {
          invalidFields.push(`Sort: ${sort.field}`)
        }
      })
    }

    // Check groupBy
    if (view.groupBy && !validFields.includes(view.groupBy)) {
      invalidFields.push(`GroupBy: ${view.groupBy}`)
    }

    // Check widgets for dashboard views
    if (view.widgets) {
      view.widgets.forEach((widget, index) => {
        // Table widget columns
        if (widget.type === "table" && widget.columns) {
          widget.columns.forEach((column) => {
            const field = typeof column === "string" ? column : column.field
            if (field && !validFields.includes(field)) {
              invalidFields.push(`Widget[${index}].column: ${field}`)
            }
          })
        }

        // Chart widget fields
        if (widget.type === "chart" && widget.config) {
          if (widget.config.xField && !validFields.includes(widget.config.xField)) {
            invalidFields.push(`Widget[${index}].xField: ${widget.config.xField}`)
          }
          if (widget.config.yField && !validFields.includes(widget.config.yField)) {
            invalidFields.push(`Widget[${index}].yField: ${widget.config.yField}`)
          }
          if (widget.config.groupBy && !validFields.includes(widget.config.groupBy)) {
            invalidFields.push(`Widget[${index}].groupBy: ${widget.config.groupBy}`)
          }
        }

        // Metric widget field
        if (widget.type === "metric" && widget.field && !validFields.includes(widget.field)) {
          invalidFields.push(`Widget[${index}].field: ${widget.field}`)
        }
      })
    }

    // Specifically check for any "stage" references
    const configString = JSON.stringify(view)
    const stageReferences: string[] = []
    const regex = /"([^"]*stage[^"]*)"/gi
    let match
    while ((match = regex.exec(configString)) !== null) {
      stageReferences.push(match[1])
    }

    if (stageReferences.length > 0) {
      invalidFields.push(...stageReferences.map((ref) => `Invalid "stage" reference: ${ref}`))
    }

    // Set validation results
    setValidationResults({
      valid: invalidFields.length === 0,
      invalidFields,
      correctedView: validateViewConfig(view),
      stageReferences,
    })
  }

  const dealViews = viewsConfig.filter((view) => view.entity === "deals")

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>View Schema Validator</CardTitle>
        <CardDescription>Validate views against their schema definitions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Deal Views</h3>
          <div className="flex flex-wrap gap-2">
            {dealViews.map((view) => (
              <Button key={view.id} variant="outline" onClick={() => validateView(view.id)}>
                {view.name}
              </Button>
            ))}
          </div>
        </div>

        {activeView && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">
              {activeView.name}
              <Badge variant="outline" className="ml-2">
                {activeView.type}
              </Badge>
              <Badge variant="secondary" className="ml-2">
                {activeView.entity}
              </Badge>
            </h3>

            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="schema">Validation Results</TabsTrigger>
                <TabsTrigger value="current">Current Config</TabsTrigger>
                <TabsTrigger value="corrected">Corrected Config</TabsTrigger>
              </TabsList>

              <TabsContent value="schema">
                {validationResults && (
                  <>
                    <Alert variant={validationResults.valid ? "default" : "destructive"}>
                      <AlertTitle>
                        {validationResults.valid ? "Valid Configuration" : "Invalid Configuration"}
                      </AlertTitle>
                      <AlertDescription>
                        {validationResults.valid
                          ? "All fields in this view match the schema definition."
                          : "The following fields do not match the schema definition:"}
                      </AlertDescription>
                    </Alert>

                    {!validationResults.valid && (
                      <ScrollArea className="h-60 mt-4 p-4 border rounded-md">
                        <ul className="list-disc pl-6">
                          {validationResults.invalidFields.map((field: string, index: number) => (
                            <li key={index} className="text-destructive">
                              {field}
                            </li>
                          ))}
                        </ul>

                        {validationResults.stageReferences && validationResults.stageReferences.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-bold text-destructive">Stage References Found!</h4>
                            <p className="text-sm text-destructive mb-2">
                              "stage" is not a valid field and should be replaced with "phase"
                            </p>
                            <ul className="list-disc pl-6">
                              {validationResults.stageReferences.map((ref: string, index: number) => (
                                <li key={index} className="text-destructive">
                                  {ref}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </ScrollArea>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="current">
                <ScrollArea className="h-96 p-4 border rounded-md">
                  <pre className="text-sm">{JSON.stringify(activeView, null, 2)}</pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="corrected">
                {validationResults?.correctedView && (
                  <ScrollArea className="h-96 p-4 border rounded-md">
                    <pre className="text-sm">{JSON.stringify(validationResults.correctedView, null, 2)}</pre>
                  </ScrollArea>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
