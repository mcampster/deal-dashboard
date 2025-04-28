// This is a utility script to check for any remaining "stage" references
// in our data and configuration files.

import fs from "fs"
import path from "path"

// Define directories to scan
const dirsToScan = ["./data", "./components", "./lib", "./config", "./app"]

// Define file extensions to scan
const fileExtensionsToScan = [".ts", ".tsx", ".json"]

// Function to scan a file for "stage" references
async function scanFile(filePath: string): Promise<{ file: string; lines: string[] }> {
  const content = await fs.promises.readFile(filePath, "utf8")
  const lines = content.split("\n")
  const matchingLines: string[] = []

  lines.forEach((line, index) => {
    // Check for "stage" references but not in comments or strings like "message"
    // This is a simple check and might have false positives
    if (
      (line.includes("stage") || line.includes("Stage")) &&
      !line.trim().startsWith("//") &&
      !line.includes("stageRef") &&
      !line.includes("stageName") &&
      !line.includes("message") &&
      !line.includes("// stage")
    ) {
      matchingLines.push(`Line ${index + 1}: ${line.trim()}`)
    }
  })

  return {
    file: filePath,
    lines: matchingLines,
  }
}

// Function to scan a directory recursively
async function scanDirectory(dir: string): Promise<{ file: string; lines: string[] }[]> {
  const results: { file: string; lines: string[] }[] = []

  const entries = await fs.promises.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // Skip node_modules
      if (entry.name === "node_modules") continue

      const subResults = await scanDirectory(fullPath)
      results.push(...subResults)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name)
      if (fileExtensionsToScan.includes(ext)) {
        const fileResults = await scanFile(fullPath)
        if (fileResults.lines.length > 0) {
          results.push(fileResults)
        }
      }
    }
  }

  return results
}

// Main function
async function main() {
  console.log('Scanning for "stage" references...')

  const allResults: { file: string; lines: string[] }[] = []

  for (const dir of dirsToScan) {
    const results = await scanDirectory(dir)
    allResults.push(...results)
  }

  console.log(`\nFound ${allResults.length} files with "stage" references:`)

  allResults.forEach((result) => {
    console.log(`\n${result.file}:`)
    result.lines.forEach((line) => console.log(`  ${line}`))
  })
}

main().catch(console.error)
