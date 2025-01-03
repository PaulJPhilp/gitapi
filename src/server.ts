import cors from "cors"
import express from "express"
import { exec } from "node:child_process"
import { initializeDatabase } from "./db/db"
import { errorHandler } from "./middleware/error-handler"
import { modelsRouter } from "./routes/models"
import { promptRunsRouter } from "./routes/prompt-runs"
import { promptsRouter } from "./routes/prompts"
import { providersRouter } from "./routes/providers"

const app = express()
const port = process.env.PORT || 9001

// Kill any existing process on the port
const killExistingProcess = async () => {
    try {
        await new Promise<void>((resolve) => {
            exec(`lsof -ti:${port} | xargs kill -9`, (error: Error | null) => {
                if (error && !error.message.includes('No such process')) {
                    console.warn('No process to kill on port', port)
                }
                resolve()
            })
        })
    } catch (error) {
        if (error instanceof Error) {
            console.warn('Error killing process:', error.message)
        }
    }
}

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
})

// Routes
app.use('/api/providers', providersRouter)
app.use('/api/models', modelsRouter)
app.use('/api/prompts', promptsRouter)
app.use('/api/prompt-runs', promptRunsRouter)

// Error handler
app.use(errorHandler)

// Initialize database and start server
async function start() {
    try {
        await killExistingProcess()
        await initializeDatabase()

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`)
        })
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

start()

export { app }
