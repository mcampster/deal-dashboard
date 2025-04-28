"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, Send, Loader2 } from "lucide-react"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

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
import { viewsConfig } from "@/config/views"
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

export function AIAssistantEnhanced({
  onApplyConfig,
  currentConfig,
  open: controlledOpen,
  onOpenChange,
}: AIAssistantProps) {
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
      // Process the user's request using AI
      const config = await processAIRequestWithVercel(input, currentConfig)
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

// Process AI request using Vercel's AI SDK
async function processAIRequestWithVercel(query: string, currentConfig?: ViewConfig): Promise<ViewConfig> {
  try {
    // Prepare context about available data models and schema
    const schemaContext = JSON.stringify({
      entities: {
        deals: {
          fields: ["id", "name", "value", "stage", "closeDate"],
          sample: {
            id: 1,
            name: "Enterprise SaaS Solution",
            value: "$120,000",
            stage: "Negotiation",
            closeDate: "2023-12-15",
          },
        },
        contacts: {
          fields: ["id", "name", "email", "phone", "company"],
          sample: {
            id: 1,
            name: "John Smith",
            email: "john.smith@example.com",
            phone: "(555) 123-4567",
            company: "Acme Corp",
          },
        },
        clients: {
          fields: ["id", "name", "industry", "location", "revenue"],
          sample: {
            id: 1,
            name: "Acme Corporation",
            industry: "Technology",
            location: "San Francisco, CA",
            revenue: "$25M",
          },
        },
      },
      viewConfigs: viewsConfig.map((v) => ({ id: v.id, label: v.label, entity: v.entity })),
      currentConfig: currentConfig
        ? { id: currentConfig.id, label: currentConfig.label, entity: currentConfig.entity }
        : null,
    })

    // Prompt for the AI model
    const prompt = `
You are a data visualization assistant that helps users create view configurations.
Based on the user's natural language query, generate a JSON configuration for displaying data.

AVAILABLE DATA SCHEMA:
${schemaContext}

USER QUERY: "${query}"

Generate a complete ViewConfig JSON object with these properties:
- id: A unique identifier for this view
- label: A concise title for the view
- icon: One of "dollar", "user", "building", "chart" based on the entity
- description: A brief description of what this view shows
- entity: The data entity to query (deals, contacts, or clients)
- columns: Array of column configurations
- actions: Array of action configurations
- filters: Optional array of filter configurations
- sort: Optional array of sort configurations
- limit: Optional number to limit results

IMPORTANT: Your response must be valid JSON that can be parsed with JSON.parse().
`

    // Call the AI model using Vercel's AI SDK
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
      temperature: 0.2, // Lower temperature for more deterministic outputs
      maxTokens: 1000,
    })

    // Parse the response as JSON
    try {
      // Extract JSON from the response (in case the AI includes explanatory text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No valid JSON found in the response")
      }

      const jsonStr = jsonMatch[0]
      const config = JSON.parse(jsonStr) as ViewConfig

      // Validate the config has required fields
      if (!config.id || !config.label || !config.entity || !Array.isArray(config.columns)) {
        throw new Error("Generated configuration is missing required fields")
      }

      return config
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.log("Raw AI response:", text)

      // Fallback to a default configuration
      return createDefaultConfig(query)
    }
  } catch (error) {
    console.error("Error calling AI model:", error)
    return createDefaultConfig(query)
  }
}

// Create a default configuration as fallback
function createDefaultConfig(query: string): ViewConfig {
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
