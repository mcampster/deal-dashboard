"use client"

import type React from "react"

import { useState } from "react"
import { Bot, Loader2, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import type { ViewConfig } from "@/config/types"

interface AIInputProps {
  onApplyConfig: (config: ViewConfig) => void
  currentConfig?: ViewConfig
}

export function AIInput({ onApplyConfig, currentConfig }: AIInputProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    setIsLoading(true)

    try {
      // Process the user's request
      const config = await processAIRequest(input, currentConfig)

      // Apply the configuration immediately
      onApplyConfig(config)

      // Show success toast
      toast({
        title: "AI Configuration Applied",
        description: `Created view based on: "${input}"`,
      })

      // Clear the input
      setInput("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not process your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full max-w-md items-center">
      <Bot className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask AI to create a view..."
        className="pl-9 pr-12"
        disabled={isLoading}
      />
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        className="absolute right-1 h-7 w-7"
        disabled={isLoading || !input.trim()}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        <span className="sr-only">Send</span>
      </Button>
    </form>
  )
}

// Enhanced AI request processor that can intelligently select entity and apply filters
async function processAIRequest(query: string, currentConfig?: ViewConfig): Promise<ViewConfig> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Parse the query to identify intent
  const queryLower = query.toLowerCase()

  // Check for "recent deals by close date" pattern
  if (queryLower.includes("recent") && queryLower.includes("deal") && queryLower.includes("close date")) {
    // Extract the limit if specified (e.g., "3 recent deals")
    let limit = 3 // Default limit
    const limitMatch = queryLower.match(/(\d+)\s+recent\s+deals/)
    if (limitMatch && limitMatch[1]) {
      limit = Number.parseInt(limitMatch[1], 10)
    }

    // Create a configuration for recent deals sorted by close date
    return {
      id: "recent-deals",
      label: `${limit} Recent Deals`,
      icon: "dollar",
      description: `Showing the ${limit} most recent deals by close date`,
      entity: "deals",
      columns: [
        { key: "name", label: "Deal Name", type: "text", field: "name" },
        { key: "value", label: "Value", type: "currency", field: "value" },
        { key: "stage", label: "Stage", type: "text", field: "stage" },
        { key: "closeDate", label: "Close Date", type: "date", field: "closeDate" },
      ],
      actions: [
        { id: "add-deal", label: "Add Deal", icon: "plus", type: "primary" },
        { id: "export-deals", label: "Export Deals", icon: "download", type: "secondary" },
        { id: "refresh", label: "Refresh", icon: "refresh", type: "secondary" },
      ],
      sort: [
        {
          field: "closeDate",
          direction: "desc",
          label: "Most recent first",
        },
      ],
      limit: limit,
    }
  }

  // For the specific query "Show me all deals with a value > 100,000"
  if (
    queryLower.includes("deals") &&
    queryLower.includes("value") &&
    (queryLower.includes(">") || queryLower.includes("greater")) &&
    queryLower.includes("100,000")
  ) {
    return {
      id: "ai-filtered-deals",
      label: "High Value Deals",
      icon: "dollar",
      description: "Deals with value greater than $100,000",
      entity: "deals",
      columns: [
        { key: "name", label: "Deal Name", type: "text", field: "name" },
        { key: "value", label: "Value", type: "currency", field: "value" },
        { key: "stage", label: "Stage", type: "text", field: "stage" },
        { key: "closeDate", label: "Close Date", type: "date", field: "closeDate" },
      ],
      actions: [
        { id: "add-deal", label: "Add Deal", icon: "plus", type: "primary" },
        { id: "export-deals", label: "Export Deals", icon: "download", type: "secondary" },
        { id: "refresh", label: "Refresh", icon: "refresh", type: "secondary" },
      ],
      filters: [
        {
          field: "value",
          operator: ">",
          value: "$100,000",
          label: "Value over $100,000",
        },
      ],
    }
  }

  // Handle "Show me all clients in the Technology industry"
  if (queryLower.includes("clients") && queryLower.includes("technology") && queryLower.includes("industry")) {
    return {
      id: "tech-clients",
      label: "Technology Clients",
      icon: "building",
      description: "Clients in the Technology industry",
      entity: "clients",
      columns: [
        { key: "name", label: "Company Name", type: "text", field: "name" },
        { key: "industry", label: "Industry", type: "industry", icon: "briefcase", field: "industry" },
        { key: "location", label: "Location", type: "location", icon: "mapPin", field: "location" },
        { key: "revenue", label: "Annual Revenue", type: "currency", field: "revenue" },
      ],
      actions: [
        { id: "add-client", label: "Add Client", icon: "plus", type: "primary" },
        { id: "export-clients", label: "Export Clients", icon: "download", type: "secondary" },
        { id: "refresh", label: "Refresh", icon: "refresh", type: "secondary" },
      ],
      filters: [
        {
          field: "industry",
          operator: "=",
          value: "Technology",
          label: "Technology industry only",
        },
      ],
    }
  }

  // Handle "Find contacts at Acme Corp"
  if (queryLower.includes("contacts") && queryLower.includes("acme corp")) {
    return {
      id: "acme-contacts",
      label: "Acme Corp Contacts",
      icon: "user",
      description: "Contacts at Acme Corporation",
      entity: "contacts",
      columns: [
        { key: "name", label: "Name", type: "text", field: "name" },
        { key: "email", label: "Email", type: "email", icon: "mail", field: "email" },
        { key: "phone", label: "Phone", type: "phone", icon: "phone", field: "phone" },
        { key: "company", label: "Company", type: "company", icon: "building", field: "company" },
      ],
      actions: [
        { id: "add-contact", label: "Add Contact", icon: "plus", type: "primary" },
        { id: "export-contacts", label: "Export Contacts", icon: "download", type: "secondary" },
        { id: "refresh", label: "Refresh", icon: "refresh", type: "secondary" },
      ],
      filters: [
        {
          field: "company",
          operator: "=",
          value: "Acme Corp",
          label: "Acme Corp employees",
        },
      ],
    }
  }

  // Default fallback - return a modified version of the current config or a default one
  return {
    id: "ai-generated-view",
    label: "AI Generated View",
    icon: "dollar",
    description: `View generated based on: "${query}"`,
    entity: "deals",
    columns: [
      { key: "name", label: "Name", type: "text", field: "name" },
      { key: "value", label: "Value", type: "currency", field: "value" },
      { key: "stage", label: "Stage", type: "text", field: "stage" },
    ],
    actions: [{ id: "refresh", label: "Refresh", icon: "refresh", type: "secondary" }],
    filters: [],
  }
}
