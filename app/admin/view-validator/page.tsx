import { ViewSchemaValidator } from "@/components/view-schema-validator"

export default function ViewValidatorPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-4">View Configuration Validator</h1>
      <ViewSchemaValidator />
    </div>
  )
}
