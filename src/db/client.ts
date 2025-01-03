import { createClient } from "@libsql/client"

const url = process.env.DATABASE_URL || "file:local.db"
const authToken = process.env.DATABASE_AUTH_TOKEN

export const client = createClient({
    url,
    authToken
}) 