import Database from 'better-sqlite3'
import { MigrationRunner } from './migrations/runner'
import { validateSchema } from './schema/validator'

interface DatabaseConfig {
    filename: string
    verbose?: boolean
}

export async function initializeDatabase(config: DatabaseConfig): Promise<Database> {
    // Initialize database connection
    const db = new Database(config.filename, {
        verbose: config.verbose
    })

    // Enable foreign keys
    db.pragma('foreign_keys = ON')

    // Run migrations
    const migrationRunner = new MigrationRunner(db)
    await migrationRunner.validateMigrations()
    await migrationRunner.migrate()

    // Validate schema matches domain models
    const errors = validateSchema(db)
    if (errors.length > 0) {
        console.error('Schema validation errors:')
        for (const error of errors) {
            console.error(`- ${error.type}: ${error.message}`)
        }
        throw new Error('Schema validation failed')
    }

    return db
}

// Helper to ensure database is properly closed
export function closeDatabase(db: Database): void {
    try {
        db.close()
    } catch (error) {
        console.error('Error closing database:', error)
        throw error
    }
} 