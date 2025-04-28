"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Check, FileJson, Files } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Import schemas
import configSchema from "@/schema/config-schema.json"
import dealsSchema from "@/schema/deals-schema.json"
import contactsSchema from "@/schema/contacts-schema.json"
import clientsSchema from "@/schema/clients-schema.json"
import activitiesSchema from "@/schema/activities-schema.json"

interface SchemaExplorerProps {
  className?: string
}

export function SchemaExplorer({ className }: SchemaExplorerProps) {
  const [activeTab, setActiveTab] = useState("config")
  const [copied, setCopied] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)

  // Get the active schema based on the selected tab
  const getActiveSchema = () => {
    switch (activeTab) {
      case "config":
        return configSchema
      case "deals":
        return dealsSchema
      case "contacts":
        return contactsSchema
      case "clients":
        return clientsSchema
      case "activities":
        return activitiesSchema
      default:
        return configSchema
    }
  }

  // Get all schemas combined into a single object
  const getAllSchemas = () => {
    return {
      config: configSchema,
      deals: dealsSchema,
      contacts: contactsSchema,
      clients: clientsSchema,
      activities: activitiesSchema,
    }
  }

  // Format the schema as a pretty-printed JSON string
  const formattedSchema = JSON.stringify(getActiveSchema(), null, 2)

  // Format all schemas as a pretty-printed JSON string
  const formattedAllSchemas = JSON.stringify(getAllSchemas(), null, 2)

  // Copy the schema to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedSchema)
    setCopied(true)
    toast({
      title: "Copied to clipboard",
      description: "The schema has been copied to your clipboard.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  // Copy all schemas to clipboard
  const copyAllToClipboard = () => {
    navigator.clipboard.writeText(formattedAllSchemas)
    setCopiedAll(true)
    toast({
      title: "All schemas copied",
      description: "All schemas have been copied to your clipboard.",
    })
    setTimeout(() => setCopiedAll(false), 2000)
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          Schema Explorer
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={copyAllToClipboard}>
            {copiedAll ? <Check className="h-4 w-4" /> : <Files className="h-4 w-4" />}
            {copiedAll ? "Copied All" : "Copy All"}
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={copyToClipboard}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-0">
            <div className="rounded-md bg-muted p-4 overflow-auto max-h-[600px]">
              <pre className="text-sm">{formattedSchema}</pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
