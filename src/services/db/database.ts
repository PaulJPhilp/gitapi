import { client } from "./db"

interface DatabaseStatus {
    isConnected: boolean
    tables: string[]
    error?: string
}

export const databaseService = {
    async checkStatus(): Promise<DatabaseStatus> {
        try {
            // Test connection by running a simple query
            const result = await client.execute(`
                SELECT name FROM sqlite_master 
                WHERE type='table' 
                ORDER BY name;
            `)

            const tables = result.rows.map(row => row.name as string)

            return {
                isConnected: true,
                tables
            }
        } catch (error) {
            return {
                isConnected: false,
                tables: [],
                error: error instanceof Error ? error.message : "Unknown error occurred"
            }
        }
    },

    async getTableStats() {
        const stats = new Map<string, number>()

        try {
            const tables = (await client.execute(`
                SELECT name FROM sqlite_master 
                WHERE type='table' 
                ORDER BY name;
            `)).rows.map(row => row.name as string)

            for (const table of tables) {
                const result = await client.execute(`SELECT COUNT(*) as count FROM ${table}`)
                stats.set(table, Number(result.rows[0].count))
            }

            return stats
        } catch (error) {
            throw new Error(`Failed to get table statistics: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
    }
} 