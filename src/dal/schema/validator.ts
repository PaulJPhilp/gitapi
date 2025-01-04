import type { Database } from 'better-sqlite3'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

interface SchemaValidationError {
    type: 'missing_table' | 'missing_column' | 'type_mismatch'
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

export function validateSchema(db: Database): SchemaValidationError[] {
    const errors: SchemaValidationError[] = []

    // Read expected schema from SQL file
    const schemaPath = join(__dirname, '../migrations/001_initial_schema.sql')
    const schemaSql = readFileSync(schemaPath, 'utf-8')

    // Get actual database schema
    const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    AND name NOT IN ('sqlite_sequence')
  `).all() as Array<{ name: string }>

    // Validate each table exists and has correct structure
    const expectedTables = extractTablesFromSql(schemaSql)

    for (const expectedTable of expectedTables) {
        // Check table exists
        if (!tables.find(t => t.name === expectedTable.name)) {
            errors.push({
                type: 'missing_table',
                message: `Missing table: ${expectedTable.name}`
            })
            continue
        }

        // Get actual columns
        const columns = db.prepare(`PRAGMA table_info(${expectedTable.name})`).all() as Array<{
            name: string
            type: string
            notnull: number
            pk: number
        }>

        // Check each expected column
        for (const expectedColumn of expectedTable.columns) {
            const actualColumn = columns.find(c => c.name === expectedColumn.name)

            if (!actualColumn) {
                errors.push({
                    type: 'missing_column',
                    message: `Missing column ${expectedColumn.name} in table ${expectedTable.name}`
                })
                continue
            }

            // Check column type matches
            if (!typesMatch(expectedColumn.type, actualColumn.type)) {
                errors.push({
                    type: 'type_mismatch',
                    message: `Type mismatch for ${expectedTable.name}.${expectedColumn.name}: expected ${expectedColumn.type}, got ${actualColumn.type}`
                })
            }
        }
    }

    return errors
}

// Helper to extract table definitions from SQL
function extractTablesFromSql(sql: string): TableInfo[] {
    const tables: TableInfo[] = []
    const createTableRegex = /CREATE TABLE IF NOT EXISTS (\w+)\s*\(([\s\S]*?)\);/g

    let match: RegExpExecArray | null
    for (; ;) {
        match = createTableRegex.exec(sql)
        if (match === null) break

        const [, tableName, columnsStr] = match
        const columns = columnsStr
            .split(',')
            .map(col => col.trim())
            .filter(col => col && !col.startsWith('FOREIGN KEY') && !col.startsWith('PRIMARY KEY'))
            .map(col => {
                const [name, type, ...constraints] = col.split(' ')
                return {
                    name,
                    type: type.toUpperCase(),
                    notNull: constraints.includes('NOT') && constraints.includes('NULL'),
                    pk: constraints.includes('PRIMARY') && constraints.includes('KEY')
                }
            })

        tables.push({ name: tableName, columns })
    }

    return tables
}

// Helper to check if SQL types are compatible
function typesMatch(expectedType: string, actualType: string): boolean {
    // Normalize types for comparison
    const normalizedExpected = expectedType.toUpperCase()
    const normalizedActual = actualType.toUpperCase()

    // Handle type aliases
    const typeMap: Record<string, string[]> = {
        'TEXT': ['TEXT', 'VARCHAR', 'CHAR', 'CLOB', 'STRING'],
        'INTEGER': ['INTEGER', 'INT', 'BIGINT', 'SMALLINT'],
        'REAL': ['REAL', 'FLOAT', 'DOUBLE'],
        'BOOLEAN': ['BOOLEAN', 'INTEGER'], // SQLite stores booleans as integers
        'TIMESTAMP': ['TIMESTAMP', 'DATETIME']
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