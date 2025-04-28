// Import mock data from JSON files
import dealsData from "@/data/mock/deals.json"
import contactsData from "@/data/mock/contacts.json"
import clientsData from "@/data/mock/clients.json"
import activitiesData from "@/data/mock/activities.json"
import dealTeamsData from "@/data/mock/deal-teams.json"
import booksData from "@/data/mock/books.json"
import { fixMockData } from "./mock-data-fixer"

// Log the data to help with debugging
console.log("Mock database initialization started")
console.log("Deals data:", dealsData ? dealsData.length : "not loaded")
console.log("Contacts data:", contactsData ? contactsData.length : "not loaded")
console.log("Clients data:", clientsData ? clientsData.length : "not loaded")
console.log("Activities data:", activitiesData ? activitiesData.length : "not loaded")
console.log("Deal Teams data:", dealTeamsData ? dealTeamsData.length : "not loaded")
console.log("Books data:", booksData ? booksData.length : "not loaded")

// Export the mock database for use in the data explorer
export const mockDatabase = {
  deals: dealsData,
  contacts: contactsData,
  clients: clientsData,
  activities: activitiesData,
  dealTeams: dealTeamsData,
  books: booksData,
}

// Log the data to help with debugging
console.log("Mock database initialized with:", {
  deals: mockDatabase.deals.length,
  contacts: mockDatabase.contacts.length,
  clients: mockDatabase.clients.length,
  activities: mockDatabase.activities.length,
  dealTeams: mockDatabase.dealTeams.length,
  books: mockDatabase.books.length,
})

// Export a function to directly access the mock database
export function getMockData(entityType: string, id?: string | number) {
  console.log(`Direct data access requested for: ${entityType}${id ? ` with ID: ${id}` : ""}`)

  // Check if the entity exists in the mock database
  if (entityType in mockDatabase) {
    let data = mockDatabase[entityType as keyof typeof mockDatabase]
    console.log(`Found ${data.length} items for ${entityType}`)

    // If ID is provided, filter by ID
    if (id !== undefined) {
      const idStr = String(id)
      data = data.filter((item: any) => String(item.id) === idStr)
      console.log(`Filtered to ${data.length} items with ID: ${id}`)
    }

    // For clients data, ensure revenue field exists
    if (entityType === "clients") {
      data = data.map((item: any) => {
        // If revenue is undefined, provide a default value
        if (item.revenue === undefined) {
          console.log(`Adding missing revenue field to client: ${item.name}`)
          return {
            ...item,
            revenue: item.id % 5 === 0 ? "$250M" : item.id % 3 === 0 ? "$120M" : "$75M",
          }
        }
        return item
      })
    }

    // For deals data, ensure we have the correct field names
    if (entityType === "deals") {
      data = data.map((item: any) => {
        // Ensure we have clientName instead of client
        if (item.client && !item.clientName) {
          console.log(`Converting client to clientName for deal: ${item.name}`)
          return {
            ...item,
            clientName: item.client,
          }
        }
        return item
      })
    }

    const fixedData = fixMockData(data)
    return fixedData
  }

  console.log(`No data found for entity: ${entityType}`)
  return []
}
