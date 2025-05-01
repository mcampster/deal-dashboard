import type { ViewConfig } from "@/config/types"

// Import JSON files
import dealsConfig from "@/data/deals.json"
import contactsConfig from "@/data/contacts.json"
import clientsConfig from "@/data/clients.json"
import highValueDealsConfig from "@/data/high-value-deals.json"
import techClientsConfig from "@/data/tech-clients.json"
import recentDealsConfig from "@/data/recent-deals.json"
import lowValueDealsConfig from "@/data/low-value-deals.json"
import salesDashboardConfig from "@/data/sales-dashboard.json"
import clientsDashboardConfig from "@/data/clients-dashboard.json"
import dealDetailsConfig from "@/data/deal-details.json"
import clientDetailsConfig from "@/data/client-details.json"
import contactDetailsConfig from "@/data/contact-details.json"
import activitiesConfig from "@/data/activities.json"
import recentActivitiesConfig from "@/data/recent-activities.json"
import activityDetailsConfig from "@/data/activity-details.json"
import dealsMasterDetailsConfig from "@/data/deals-master-details.json"
import contactsMasterDetailsConfig from "@/data/contactsMasterDetailsConfig.json"
import dealTeamsConfig from "@/data/deal-teams.json"
import booksConfig from "@/data/books.json"
import investmentBankingDashboardConfig from "@/data/investment-banking-dashboard.json"

// Import new deal configurations
import dealOriginationViewConfig from "@/data/deal-origination-view.json"
import dealSyndicateViewConfig from "@/data/deal-syndicate-view.json"
import dealComplianceViewConfig from "@/data/deal-compliance-view.json"
import dashboardOriginationConfig from "@/data/dashboard-origination.json"
import dashboardSyndicateConfig from "@/data/dashboard-syndicate.json"
import dashboardComplianceConfig from "@/data/dashboard-compliance.json"

// Try to import the validation function
import { validateAllViewConfigs } from "@/lib/config-validator"

// Add type property to existing configs if they don't have it
const addTypeToConfig = (
  config: any,
  defaultType: "list" | "dashboard" | "details" | "master-details" = "list",
): ViewConfig => {
  if (!config.type) {
    return {
      ...config,
      type: defaultType,
    }
  }
  return config as ViewConfig
}

// Wrap in try-catch to handle any errors
let viewsConfig: ViewConfig[] = []

try {
  // Combine all view configurations and validate them against schemas
  viewsConfig = validateAllViewConfigs([
    addTypeToConfig(dealsConfig),
    addTypeToConfig(contactsConfig),
    addTypeToConfig(clientsConfig),
    addTypeToConfig(activitiesConfig),
    addTypeToConfig(highValueDealsConfig),
    addTypeToConfig(techClientsConfig),
    addTypeToConfig(recentDealsConfig),
    addTypeToConfig(recentActivitiesConfig),
    addTypeToConfig(lowValueDealsConfig),
    addTypeToConfig(salesDashboardConfig, "dashboard"),
    addTypeToConfig(clientsDashboardConfig, "dashboard"),
    addTypeToConfig(dealDetailsConfig, "details"),
    addTypeToConfig(clientDetailsConfig, "details"),
    addTypeToConfig(contactDetailsConfig, "details"),
    addTypeToConfig(activityDetailsConfig, "details"),
    addTypeToConfig(dealsMasterDetailsConfig, "master-details"),
    addTypeToConfig(contactsMasterDetailsConfig, "master-details"),
    addTypeToConfig(dealTeamsConfig),
    addTypeToConfig(booksConfig),
    addTypeToConfig(investmentBankingDashboardConfig, "dashboard"),

    // Add new deal configurations
    addTypeToConfig(dealOriginationViewConfig),
    addTypeToConfig(dealSyndicateViewConfig),
    addTypeToConfig(dealComplianceViewConfig),
    addTypeToConfig(dashboardOriginationConfig, "dashboard"),
    addTypeToConfig(dashboardSyndicateConfig, "dashboard"),
    addTypeToConfig(dashboardComplianceConfig, "dashboard"),
  ])
} catch (error) {
  console.error("Error setting up viewsConfig:", error)
  viewsConfig = []
}

// Helper function to get a view by ID
export function getViewById(id: string): ViewConfig | undefined {
  try {
    return viewsConfig.find((view) => view.id === id)
  } catch (error) {
    console.error("Error in getViewById:", error)
    return undefined
  }
}

// Helper function to get all view IDs
export function getAllViewIds(): string[] {
  try {
    return viewsConfig.map((view) => view.id)
  } catch (error) {
    console.error("Error in getAllViewIds:", error)
    return []
  }
}

// Helper function to get views by entity
export function getViewsByEntity(entity: string): ViewConfig[] {
  try {
    return viewsConfig.filter((view) => view.entity === entity)
  } catch (error) {
    console.error("Error in getViewsByEntity:", error)
    return []
  }
}

// Helper function to get views by type
export function getViewsByType(type: "list" | "dashboard" | "details" | "master-details"): ViewConfig[] {
  try {
    return viewsConfig.filter((view) => view.type === type)
  } catch (error) {
    console.error("Error in getViewsByType:", error)
    return []
  }
}

export { viewsConfig }
