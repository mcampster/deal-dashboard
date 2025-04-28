"use client"

import { DataTest } from "@/components/data-test"

export default function TestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Data Test Page</h1>
      <p className="text-muted-foreground mb-4">
        This page is for development and testing purposes. It tests direct access to mock data.
      </p>
      <DataTest />
    </div>
  )
}
