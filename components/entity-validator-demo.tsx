"use client"

import { useState } from "react"
import { validateEntity, validateEntityBatch } from "@/lib/entity-validator"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockDatabase } from "@/lib/mock-data"

export function EntityValidatorDemo() {
  const [entityType, setEntityType] = useState<"deals" | "contacts" | "clients" | "activities">("deals")
  const [entityData, setEntityData] = useState("")
  const [validationResult, setValidationResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("validate")
  const [batchValidationResult, setBatchValidationResult] = useState<any>(null)

  const validateCurrentEntity = () => {
    try {
      const data = JSON.parse(entityData)
      const result = validateEntity(entityType, data)
      setValidationResult(result)
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [],
        errorMessage: `Invalid JSON: ${(error as Error).message}`,
      })
    }
  }

  const validateBatch = () => {
    try {
      // Use the mock database for batch validation
      const dataArray = mockDatabase[entityType]
      const result = validateEntityBatch(entityType, dataArray)
      setBatchValidationResult(result)
    } catch (error) {
      setBatchValidationResult({
        valid: false,
        errorSummary: `Error: ${(error as Error).message}`,
      })
    }
  }

  const loadSampleEntity = () => {
    // Get a sample entity from the mock database
    const sample = mockDatabase[entityType][0]
    setEntityData(JSON.stringify(sample, null, 2))
    setValidationResult(null)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Entity Validator</CardTitle>
        <CardDescription>Validate your entities against their JSON schemas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="entity-type" className="text-sm font-medium">
              Entity Type
            </label>
            <Select
              value={entityType}
              onValueChange={(value: any) => {
                setEntityType(value)
                setValidationResult(null)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deals">Deals</SelectItem>
                <SelectItem value="contacts">Contacts</SelectItem>
                <SelectItem value="clients">Clients</SelectItem>
                <SelectItem value="activities">Activities</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="entity-data" className="text-sm font-medium">
              Entity JSON
            </label>
            <Button variant="outline" onClick={loadSampleEntity}>
              Load Sample
            </Button>
          </div>

          <Textarea
            id="entity-data"
            value={entityData}
            onChange={(e) => setEntityData(e.target.value)}
            className="font-mono h-[300px]"
            placeholder={`{
  "id": 1,
  "name": "Example Deal",
  "value": "$10,000",
  "stage": "Proposal",
  "closeDate": "2023-12-31"
}`}
          />
        </div>

        {validationResult && (
          <Alert variant={validationResult.valid ? "default" : "destructive"}>
            {validationResult.valid ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Valid Entity</AlertTitle>
                <AlertDescription>The entity is valid according to the schema.</AlertDescription>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Invalid Entity</AlertTitle>
                <AlertDescription>
                  <pre className="mt-2 whitespace-pre-wrap text-sm">{validationResult.errorMessage}</pre>
                </AlertDescription>
              </>
            )}
          </Alert>
        )}

        <div className="flex items-center space-x-4">
          <Button onClick={validateCurrentEntity}>Validate Entity</Button>
          <Button variant="outline" onClick={validateBatch}>
            Validate All {entityType}
          </Button>
        </div>

        {batchValidationResult && (
          <Alert variant={batchValidationResult.valid ? "default" : "destructive"}>
            {batchValidationResult.valid ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>All Entities Valid</AlertTitle>
                <AlertDescription>
                  All {batchValidationResult.totalItems} {entityType} are valid according to the schema.
                </AlertDescription>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Failed</AlertTitle>
                <AlertDescription>
                  <p>{batchValidationResult.errorSummary}</p>
                  <div className="mt-2 max-h-[200px] overflow-auto">
                    {batchValidationResult.invalidItems?.map((item: any, index: number) => (
                      <div key={index} className="border-t pt-2 mt-2 first:border-t-0 first:pt-0 first:mt-0">
                        <p className="font-medium">Item {item.index + 1}:</p>
                        <pre className="text-xs whitespace-pre-wrap">{item.errorMessage}</pre>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
