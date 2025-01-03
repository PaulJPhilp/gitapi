import fs from "node:fs"
import path from "node:path"
import { client } from "./client"

async function migrate() {
    try {
        const schema = fs.readFileSync(path.join(process.cwd(), "src/db/schema.sql"), "utf-8")
        await client.execute(schema)
        console.log("Migration completed successfully")
    } catch (error) {
        console.error("Migration failed:", error)
        process.exit(1)
    }
}

migrate() 