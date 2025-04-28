"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, Send, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import type { ViewConfig } from "@/config/types"

interface AIAssistantProps {
  onApplyConfig: (config: ViewConfig) => void
  currentConfig?: ViewConfig
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

type MessageType = "user" | "assistant"

interface Message {
  type: MessageType
  content: string
}

export function AIAssistant({ onApplyConfig, currentConfig, open: controlledOpen, onOpenChange }: AIAssistantProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "assistant",
      content:
        "Hi! I can help you create custom views. Try asking something like 'Show me all deals with a value > $100,000' or 'Show me 3 recent deals by close date'",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [generatedConfig, setGeneratedConfig] = useState<ViewConfig | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sync with controlled state if provided
  useEffect(() => {
    if (controlledOpen !== undefined) {
      setOpen(controlledOpen)
    }
  }, [controlledOpen])

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleOpenChange = (newOpen: boolean) => {
    console.log("AIAssistant open state changing to:", newOpen)
    setOpen(newOpen)
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage = { type: "user" as MessageType, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Process the user's request
      const config = await processAIRequest(input, currentConfig)
      setGeneratedConfig(config)

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: `I've created a view to ${input}. You can apply it or ask for something else.`,
        },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: "I'm sorry, I couldn't process that request. Please try again with a different query.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyConfig = () => {
    if (generatedConfig) {
      onApplyConfig(generatedConfig)
      handleOpenChange(false)
      toast({
        title: "AI Configuration Applied",
        description: "The AI-generated configuration has been applied to your view.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI Data Assistant</DialogTitle>
          <DialogDescription>
            Ask the AI to create custom views or filter your data using natural language.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 h-[400px]">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.type === "assistant" && (
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-4 w-4" />
                        <span className="text-xs font-medium">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="flex items-center space-x-2">
            <Input
              placeholder="Ask the AI to create a view..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              disabled={isLoading}
            />
            <Button size="icon" onClick={handleSendMessage} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleApplyConfig} disabled={!generatedConfig || isLoading} className="w-full">
            Apply Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Enhanced AI request processor that can intelligently select entity and apply filters
async function processAIRequest(query: string, currentConfig?: ViewConfig): Promise<ViewConfig> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

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
