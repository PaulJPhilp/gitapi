#!/usr/bin/env node

import chalk from "chalk"
import { databaseService } from "../../src/services/database"

async function checkDatabase() {
    console.log(chalk.bold("\n🔍 Checking Database Status...\n"))

    try {
        // Check basic connectivity
        const status = await databaseService.checkStatus()

        // Connection Status
        if (status.isConnected) {
            console.log(`${chalk.green("✓")} Database Connection: ${chalk.green("Connected")}\n`)
        } else {
            console.log(`${chalk.red("✗")} Database Connection: ${chalk.red("Disconnected")}`)
            if (status.error) {
                console.log(chalk.red(`Error: ${status.error}\n`))
            }
            process.exit(1)
        }

        // Table List
        console.log(chalk.bold("📋 Database Tables:"))
        if (status.tables.length === 0) {
            console.log(chalk.yellow("No tables found in database"))
        } else {
            for (const table of status.tables) {
                console.log(`  ${chalk.blue("•")} ${table}`)
            }
        }

        // Table Statistics
        console.log(chalk.bold("\n📊 Table Statistics:"))
        const tableStats = await databaseService.getTableStats()
        const maxTableNameLength = Math.max(...Array.from(tableStats.keys()).map(t => t.length))

        for (const [table, count] of tableStats) {
            const padding = " ".repeat(maxTableNameLength - table.length)
            console.log(`  ${table}${padding} : ${chalk.cyan(count.toString())} rows`)
        }

        console.log("\n")
    } catch (error) {
        console.error(chalk.red("\n❌ Error checking database status:"))
        console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"))
        process.exit(1)
    }
}

// Run the check
checkDatabase() 