import type { Database } from "better-sqlite3"

interface TableStats {
    tableName: string
    rowCount: number
    size: number
}

export class DatabaseOperations {
    private readonly db: Database

    constructor(db: Database) {
        this.db = db
    }

    /**
     * Get statistics about database tables
     */
    public getTableStats(): TableStats[] {
        const tables = this.db
            .prepare("SELECT name FROM sqlite_master WHERE type='table'")
            .all() as Array<{ name: string }>

        return tables.map(({ name }) => {
            const { count } = this.db
                .prepare(`SELECT COUNT(*) as count FROM ${name}`)
                .get() as { count: number }

            const { size } = this.db
                .prepare("SELECT SUM(pgsize) as size FROM dbstat WHERE name = ?")
                .get(name) as { size: number }

            return {
                tableName: name,
                rowCount: count,
                size: size || 0
            }
        })
    }

    /**
     * Vacuum the database to reclaim space and optimize performance
     */
    public vacuum(): void {
        this.db.exec("VACUUM")
    }

    /**
     * Analyze the database to update statistics
     */
    public analyze(): void {
        this.db.exec("ANALYZE")
    }

    /**
     * Check database integrity
     */
    public checkIntegrity(): { valid: boolean; errors: string[] } {
        const result = this.db
            .prepare("PRAGMA integrity_check")
            .all() as Array<{ integrity_check: string }>

        const errors = result
            .map(row => row.integrity_check)
            .filter(msg => msg !== "ok")

        return {
            valid: errors.length === 0,
            errors
        }
    }

    /**
     * Get the size of the database file in bytes
     */
    public getDatabaseSize(): number {
        const { size } = this.db
            .prepare("SELECT page_count * page_size as size FROM pragma_page_count, pragma_page_size")
            .get() as { size: number }

        return size
    }

    /**
     * Get the current WAL file size in bytes
     */
    public getWalSize(): number {
        const { size } = this.db
            .prepare("PRAGMA wal_size")
            .get() as { size: number }

        return size
    }

    /**
     * Checkpoint the WAL file
     */
    public checkpoint(): void {
        this.db.exec("PRAGMA wal_checkpoint(TRUNCATE)")
    }

    /**
     * Get database statistics
     */
    public getDatabaseStats(): {
        tables: TableStats[]
        databaseSize: number
        walSize: number
        integrity: { valid: boolean; errors: string[] }
    } {
        return {
            tables: this.getTableStats(),
            databaseSize: this.getDatabaseSize(),
            walSize: this.getWalSize(),
            integrity: this.checkIntegrity()
        }
    }
} 