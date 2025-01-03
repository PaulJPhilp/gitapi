import { createClient } from "@libsql/client"

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set")
}

export const client = createClient({
    url: dbUrl
})

export type { ResultSet, Row } from "@libsql/client"
