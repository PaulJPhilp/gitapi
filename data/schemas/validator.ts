import type { Database } from "better-sqlite3"
import { readFileSync } from "node:fs"

interface SchemaValidationError {
    type: "missing_table" | "missing_column" | "type_mismatch"
    message: string
}

interface TableInfo {
    name: string
    columns: Array<{
        name: string
        type: string
        notNull: boolean
        pk: boolean
    }>
}

export class SchemaValidator {
    private readonly db: Database
    private readonly schemaPath: string

    constructor(db: Database, schemaPath: string) {
        this.db = db
        this.schemaPath = schemaPath
    }

    public validate(): SchemaValidationError[] {
        const errors: SchemaValidationError[] = []
        const expectedTables = this.loadExpectedSchema()
        const actualTables = this.loadActualSchema()

        // Check for missing tables
        for (const expectedTable of expectedTables) {
            const actualTable = actualTables.find(t => t.name === expectedTable.name)
            if (!actualTable) {
                errors.push({
                    type: "missing_table",
                    message: `Missing table: ${expectedTable.name}`
                })
                continue
            }

            // Check columns
            for (const expectedColumn of expectedTable.columns) {
                const actualColumn = actualTable.columns.find(c => c.name === expectedColumn.name)
                if (!actualColumn) {
                    errors.push({
                        type: "missing_column",
                        message: `Missing column ${expectedColumn.name} in table ${expectedTable.name}`
                    })
                    continue
                }

                // Check type compatibility
                if (!this.typesMatch(expectedColumn.type, actualColumn.type)) {
                    errors.push({
                        type: "type_mismatch",
                        message: `Type mismatch for ${expectedTable.name}.${expectedColumn.name}: expected ${expectedColumn.type}, got ${actualColumn.type}`
                    })
                }
            }
        }

        return errors
    }

    private loadExpectedSchema(): TableInfo[] {
        const sql = readFileSync(this.schemaPath, "utf-8")
        return this.extractTablesFromSql(sql)
    }

    private loadActualSchema(): TableInfo[] {
        const tables: TableInfo[] = []
        const tableNames = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{ name: string }>

        for (const { name } of tableNames) {
            const columns = this.db.prepare(`PRAGMA table_info(${name})`).all() as Array<{
                name: string
                type: string
                notnull: number
                pk: number
            }>

            tables.push({
                name,
                columns: columns.map(col => ({
                    name: col.name,
                    type: col.type,
                    notNull: Boolean(col.notnull),
                    pk: Boolean(col.pk)
                }))
            })
        }

        return tables
    }

    private extractTablesFromSql(sql: string): TableInfo[] {
        const tables: TableInfo[] = []
        const createTableRegex = /CREATE TABLE IF NOT EXISTS (\w+)\s*\(([\s\S]*?)\);/g

        let match: RegExpExecArray | null
        do {
            match = createTableRegex.exec(sql)
            if (match === null) break

            const [, tableName, columnsStr] = match
            const columns = columnsStr
                .split(",")
                .map(col => col.trim())
                .filter(col => col && !col.startsWith("FOREIGN KEY") && !col.startsWith("PRIMARY KEY"))
                .map(col => {
                    const [name, type, ...constraints] = col.split(" ")
                    return {
                        name,
                        type: type.toUpperCase(),
                        notNull: constraints.includes("NOT") && constraints.includes("NULL"),
                        pk: constraints.includes("PRIMARY") && constraints.includes("KEY")
                    }
                })

            tables.push({ name: tableName, columns })
        } while (match !== null)

        return tables
    }

    private typesMatch(expectedType: string, actualType: string): boolean {
        // Normalize types for comparison
        const normalizedExpected = expectedType.toUpperCase()
        const normalizedActual = actualType.toUpperCase()

        // Handle type aliases
        const typeMap: Record<string, string[]> = {
            "TEXT": ["TEXT", "VARCHAR", "CHAR", "CLOB", "STRING"],
            "INTEGER": ["INTEGER", "INT", "BIGINT", "SMALLINT"],
            "REAL": ["REAL", "FLOAT", "DOUBLE"],
            "BOOLEAN": ["BOOLEAN", "INTEGER"], // SQLite stores booleans as integers
            "TIMESTAMP": ["TIMESTAMP", "DATETIME"]
        }

        // Check if types are compatible
        for (const [, aliases] of Object.entries(typeMap)) {
            if (aliases.includes(normalizedExpected)) {
                return aliases.includes(normalizedActual)
            }
        }

        // Default to exact match
        return normalizedExpected === normalizedActual
    }
} 