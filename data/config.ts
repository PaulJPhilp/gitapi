import type { Database } from "better-sqlite3";
import BetterSqlite3 from "better-sqlite3";

interface DatabaseConfig {
    filename: string;
    options?: BetterSqlite3.Options;
}

const defaultConfig: DatabaseConfig = {
    filename: "data/db.sqlite",
    options: {
        verbose: process.env.NODE_ENV === "development" ? console.log : undefined,
    },
};

let db: Database | null = null;

export function getDatabase(config: DatabaseConfig = defaultConfig): Database {
    if (!db) {
        db = new BetterSqlite3(config.filename, config.options);
        db.pragma("journal_mode = WAL");
        db.pragma("foreign_keys = ON");
    }
    return db;
}

export function closeDatabase(): void {
    if (db) {
        db.close();
        db = null;
    }
}
