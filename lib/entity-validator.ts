import Ajv from "ajv"
import addFormats from "ajv-formats"
import dealsSchema from "@/schema/deals-schema.json"
import contactsSchema from "@/schema/contacts-schema.json"
import clientsSchema from "@/schema/clients-schema.json"
import activitiesSchema from "@/schema/activities-schema.json"

// Create a new Ajv instance with formats
const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

// Add schemas
const validateDeal = ajv.compile(dealsSchema)
const validateContact = ajv.compile(contactsSchema)
const validateClient = ajv.compile(clientsSchema)
const validateActivity = ajv.compile(activitiesSchema)

// Entity type mapping
const validators = {
  deals: validateDeal,
  contacts: validateContact,
  clients: validateClient,
  activities: validateActivity,
}

/**
 * Validates an entity against its schema
 * @param entity The entity type ('deals', 'contacts', 'clients', or 'activities')
 * @param data The data to validate
 * @returns An object with validation result and any errors
 */
export function validateEntity(entity: "deals" | "contacts" | "clients" | "activities", data: any) {
  const validator = validators[entity]

  if (!validator) {
    throw new Error(`No validator found for entity type: ${entity}`)
  }

  const valid = validator(data)

  return {
    valid,
    errors: validator.errors || [],
    errorMessage: valid ? null : formatErrors(validator.errors || []),
  }
}

/**
 * Formats validation errors into a readable string
 * @param errors Array of validation errors
 * @returns Formatted error message
 */
function formatErrors(errors: any[]): string {
  return errors
    .map((error) => {
      const path = error.instancePath || "(root)"
      return `${path}: ${error.message}`
    })
    .join("\n")
}

/**
 * Validates a batch of entities against their schema
 * @param entity The entity type ('deals', 'contacts', 'clients', or 'activities')
 * @param dataArray Array of entities to validate
 * @returns An object with overall validation result and detailed errors
 */
export function validateEntityBatch(entity: "deals" | "contacts" | "clients" | "activities", dataArray: any[]) {
  const results = dataArray.map((item, index) => {
    const result = validateEntity(entity, item)
    return {
      index,
      item,
      ...result,
    }
  })

  const valid = results.every((result) => result.valid)
  const invalidItems = results.filter((result) => !result.valid)

  return {
    valid,
    totalItems: dataArray.length,
    validItems: dataArray.length - invalidItems.length,
    invalidItems,
    errorSummary:
      invalidItems.length > 0 ? `${invalidItems.length} of ${dataArray.length} items failed validation` : null,
  }
}

/**
 * Gets the schema for a specific entity type
 * @param entity The entity type ('deals', 'contacts', 'clients', or 'activities')
 * @returns The JSON schema for the entity
 */
export function getEntitySchema(entity: "deals" | "contacts" | "clients" | "activities") {
  switch (entity) {
    case "deals":
      return dealsSchema
    case "contacts":
      return contactsSchema
    case "clients":
      return clientsSchema
    case "activities":
      return activitiesSchema
    default:
      throw new Error(`Unknown entity type: ${entity}`)
  }
}
