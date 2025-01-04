import type { Database } from "better-sqlite3"
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

interface Migration {
    version: number
    description: string
    sql: string
}

export class MigrationRunner {
    private readonly db: Database
    private readonly migrationsDir: string

    constructor(db: Database) {
        this.db = db
        this.migrationsDir = join(__dirname)
    }

    public async migrate(): Promise<void> {
        // Ensure schema_versions table exists
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS schema_versions (
                version INTEGER PRIMARY KEY,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                description TEXT NOT NULL
            )
        `)

        // Get current version
        const currentVersion = this.getCurrentVersion()

        // Get all migrations
        const migrations = this.loadMigrations()
            .filter((m) => m.version > currentVersion)
            .sort((a, b) => a.version - b.version)

        // Apply each migration in order
        for (const migration of migrations) {
            console.log(
                `Applying migration ${migration.version}: ${migration.description}`
            )

            try {
                this.db.transaction(() => {
                    // Apply migration
                    this.db.exec(migration.sql)

                    // Update version
                    this.db
                        .prepare(`
                            INSERT INTO schema_versions (version, description)
                            VALUES (?, ?)
                        `)
                        .run(migration.version, migration.description)
                })()

                console.log(`Successfully applied migration ${migration.version}`)
            } catch (error) {
                console.error(`Failed to apply migration ${migration.version}:`, error)
                throw error
            }
        }
    }

    private getCurrentVersion(): number {
        const row = this.db
            .prepare(`
                SELECT MAX(version) as version FROM schema_versions
            `)
            .get() as { version: number | null }

        return row.version ?? 0
    }

    private loadMigrations(): Migration[] {
        const migrationFiles = readdirSync(this.migrationsDir)
            .filter((f) => f.endsWith(".sql"))
            .sort()

        return migrationFiles.map((file) => {
            const match = file.match(/^(\d+)_(.+)\.sql$/)
            if (!match) {
                throw new Error(`Invalid migration filename: ${file}`)
            }

            const [, version, name] = match
            const sql = readFileSync(join(this.migrationsDir, file), "utf-8")

            return {
                version: Number.parseInt(version, 10),
                description: name.replace(/_/g, " "),
                sql,
            }
        })
    }

    public async validateMigrations(): Promise<void> {
        const migrations = this.loadMigrations()

        // Check version numbers are sequential
        migrations
            .sort((a, b) => a.version - b.version)
            .forEach((migration, index) => {
                if (migration.version !== index + 1) {
                    throw new Error(
                        `Migration versions must be sequential. Expected version ${index + 1
                        } but found ${migration.version}`
                    )
                }
            })

        // Check for duplicate versions
        const versions = new Set<number>()
        for (const migration of migrations) {
            if (versions.has(migration.version)) {
                throw new Error(`Duplicate migration version: ${migration.version}`)
            }
            versions.add(migration.version)
        }
    }
} 