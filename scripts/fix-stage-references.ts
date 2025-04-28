/**
 * This script scans all JSON configuration files and replaces "stage" with "phase"
 *
 * Run with: npx ts-node scripts/fix-stage-references.ts
 */

import fs from "fs"
import path from "path"

// Directories to scan
const directories = ["./data", "./data/mock"]

// Function to recursively scan directories
function scanDirectory(dir: string) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      scanDirectory(filePath)
    } else if (file.endsWith(".json")) {
      fixJsonFile(filePath)
    }
  })
}

// Function to fix a JSON file
function fixJsonFile(filePath: string) {
  try {
    console.log(`Checking ${filePath}...`)
    const content = fs.readFileSync(filePath, "utf8")

    // Check if the file contains "stage"
    if (content.includes('"stage"') || content.includes('"Stage"')) {
      console.log(`Found "stage" references in ${filePath}`)

      // Replace "stage" with "phase" in keys and values
      const fixedContent = content.replace(/"stage"/g, '"phase"').replace(/"Stage"/g, '"Phase"')

      // Write the fixed content back to the file
      fs.writeFileSync(filePath, fixedContent, "utf8")
      console.log(`Fixed ${filePath}`)
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error)
  }
}

// Start scanning
console.log('Scanning for "stage" references in JSON files...')
directories.forEach(scanDirectory)
console.log("Done!")
