import cors from "cors"
import express from "express"
import { providersService } from "./src/services/providers"
import { GithubReleaseService } from "./src/services/release"

const app = express()

app.use(cors())

// Initialize release service
const releaseService = new GithubReleaseService({ githubToken: process.env.GITHUB_TOKEN })

app.get("/models", (_req, res) => {
    try {
        const models = providersService.list()
        res.json(models)
    } catch (error) {
        console.error("Error fetching models:", error)
        if (error instanceof Error) {
            console.error("Error details:", {
                message: error.message,
                stack: error.stack,
                cause: error.cause
            })
        }
        res.status(500).json({ error: "Failed to fetch models" })
    }
})

app.get("/providers", async (_req, res) => {
    try {
        const providers = await providersService.list()
        res.json(providers)
    } catch (error) {
        console.error("Error fetching providers:", error)
        if (error instanceof Error) {
            console.error("Error details:", {
                message: error.message,
                stack: error.stack,
                cause: error.cause
            })
        }
        res.status(500).json({ error: "Failed to fetch providers" })
    }
})

app.get("/validate/:owner/:repo", async (req, res) => {
    const { owner, repo } = req.params

    try {
        const result = await releaseService.validateRepo({ owner, repo })
        res.json(result)
    } catch (error) {
        console.error("Error validating repo:", error)
        res.status(500).json({ error: "Failed to validate repository" })
    }
})

app.get("/releases/:owner/:repo/:tag", async (req, res) => {
    const { owner, repo, tag } = req.params

    try {
        const result = await releaseService.getReleaseByTag({ owner, repo, tag })
        res.json(result)
    } catch (error) {
        console.error("Error getting release:", error)
        res.status(500).json({ error: "Failed to get repository release" })
    }
})

const PORT = process.env.PORT || 9001

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
    console.log("Available endpoints:")
    console.log(`- GET http://localhost:${PORT}/models`)
    console.log(`- GET http://localhost:${PORT}/providers`)
    console.log(`- GET http://localhost:${PORT}/validate/:owner/:repo`)
    console.log(`- GET http://localhost:${PORT}/releases/:owner/:repo/:tag`)
})
