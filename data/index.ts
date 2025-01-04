export { closeDatabase, getDatabase } from "./config"
export { MigrationRunner } from "./migrations/runner"
export { SchemaValidator } from "./schemas/validator"
export { DatabaseOperations } from "./utils/operations"

// Re-export types
export type { Database } from "better-sqlite3"
