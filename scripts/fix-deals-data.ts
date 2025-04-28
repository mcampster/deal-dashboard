import fs from "fs"
import path from "path"

// Function to fix the deals data
async function fixDealsData() {
  try {
    // Read the deals data file
    const dealsDataPath = path.join(process.cwd(), "data", "mock", "deals.json")
    const dealsData = JSON.parse(fs.readFileSync(dealsDataPath, "utf8"))

    // Track changes
    let changes = 0

    // Fix each deal
    const fixedDeals = dealsData.map((deal: any) => {
      const fixedDeal = { ...deal }

      // Fix client -> clientName
      if (deal.client && !deal.clientName) {
        fixedDeal.clientName = deal.client
        delete fixedDeal.client
        changes++
      }

      // Fix closeDate -> expectedCloseDate
      if (deal.closeDate && !deal.expectedCloseDate) {
        fixedDeal.expectedCloseDate = deal.closeDate
        delete fixedDeal.closeDate
        changes++
      }

      // Fix stage -> phase
      if (deal.stage && !deal.phase) {
        fixedDeal.phase = deal.stage
        delete fixedDeal.stage
        changes++
      }

      // Fix owner -> dealType if missing
      if (deal.owner && !deal.dealType) {
        // This is a guess - we might want to keep owner as a separate field
        // or map it to something else
        fixedDeal.dealType = ["M&A", "IPO", "Debt Issuance", "Equity Offering"][Math.floor(Math.random() * 4)]
        changes++
      }

      return fixedDeal
    })

    // Write the fixed data back to the file
    fs.writeFileSync(dealsDataPath, JSON.stringify(fixedDeals, null, 2))

    console.log(`Fixed ${changes} field name issues in deals data`)
    return { success: true, changes }
  } catch (error) {
    console.error("Error fixing deals data:", error)
    return { success: false, error }
  }
}

// Run the function
fixDealsData().then((result) => {
  console.log("Result:", result)
})
