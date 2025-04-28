"use client"

import { useEffect } from "react"
import { getMockData } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DataTest() {
  useEffect(() => {
    // Test direct access to mock data
    const deals = getMockData("deals")
    const contacts = getMockData("contacts")
    const clients = getMockData("clients")
    const activities = getMockData("activities")
    const dealTeams = getMockData("dealTeams")
    const books = getMockData("books")

    console.log("Direct access to mock data:")
    console.log("Deals:", deals.length)
    console.log("Contacts:", contacts.length)
    console.log("Clients:", clients.length)
    console.log("Activities:", activities.length)
    console.log("Deal Teams:", dealTeams.length)
    console.log("Books:", books.length)

    // Log sample data
    if (deals.length > 0) console.log("Sample deal:", deals[0])
    if (contacts.length > 0) console.log("Sample contact:", contacts[0])
    if (clients.length > 0) console.log("Sample client:", clients[0])
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Test</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Check the console for mock data test results.</p>
      </CardContent>
    </Card>
  )
}
