import { createClient } from "@libsql/client"
import type { RequestHandler } from "express"
import { Router } from "express"

export const client = createClient({
    url: process.env.DATABASE_URL ?? "file:local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN
})

export const providersRouter = Router()

interface ProviderRow {
    id: string
    name: string
    description: string
    website: string
    api_key_required: number
    base_url: string | null
    is_enabled: number
    supported_features: string | null
}

const DEFAULT_SUPPORTED_FEATURES = {
    chat: false,
    completion: false,
    embedding: false,
    imageGeneration: false,
    imageAnalysis: false,
    functionCalling: false,
    streaming: false
}

const getProviders: RequestHandler = async (_req, res, next) => {
    try {
        const result = await client.execute({
            sql: "SELECT * FROM providers",
            args: []
        })

        const providers = (result.rows as unknown as ProviderRow[]).map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            website: row.website,
            baseUrl: row.base_url,
            apiKeyRequired: Boolean(row.api_key_required),
            isEnabled: Boolean(row.is_enabled),
            supportedFeatures: row.supported_features ? JSON.parse(row.supported_features) : DEFAULT_SUPPORTED_FEATURES
        }))

        res.json({
            providers
        })
    } catch (error) {
        next(error)
    }
}

const getProviderById: RequestHandler = async (req, res, next) => {
    try {
        const result = await client.execute({
            sql: "SELECT * FROM providers WHERE id = ?",
            args: [req.params.id]
        })

        if (!result.rows[0]) {
            res.status(404).json({ error: "Provider not found" })
            return
        }

        const row = result.rows[0] as unknown as ProviderRow
        const provider = {
            id: row.id,
            name: row.name,
            description: row.description,
            website: row.website,
            baseUrl: row.base_url,
            apiKeyRequired: Boolean(row.api_key_required),
            isEnabled: Boolean(row.is_enabled),
            supportedFeatures: row.supported_features ? JSON.parse(row.supported_features) : DEFAULT_SUPPORTED_FEATURES
        }

        res.json(provider)
    } catch (error) {
        next(error)
    }
}

const createProvider: RequestHandler = async (req, res, next) => {
    try {
        await client.execute({
            sql: `INSERT INTO providers (id, name, description, website, api_key_required, base_url, is_enabled, supported_features)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                req.body.id,
                req.body.name,
                req.body.description,
                req.body.website,
                req.body.apiKeyRequired ? 1 : 0,
                req.body.baseUrl,
                req.body.isEnabled ? 1 : 0,
                JSON.stringify(req.body.supportedFeatures || DEFAULT_SUPPORTED_FEATURES)
            ]
        })
        res.status(201).json({
            ...req.body,
            supportedFeatures: req.body.supportedFeatures || DEFAULT_SUPPORTED_FEATURES
        })
    } catch (error) {
        next(error)
    }
}

const updateProvider: RequestHandler = async (req, res, next) => {
    try {
        const updates = Object.entries(req.body)
            .map(([key, value]) => {
                if (key === 'apiKeyRequired' || key === 'isEnabled') {
                    return `${key} = ${value ? 1 : 0}`
                }
                if (key === 'supportedFeatures') {
                    return `${key} = '${JSON.stringify(value || DEFAULT_SUPPORTED_FEATURES)}'`
                }
                return `${key} = '${value}'`
            })
            .join(', ')

        await client.execute({
            sql: `UPDATE providers SET ${updates} WHERE id = ?`,
            args: [req.params.id]
        })

        const result = await client.execute({
            sql: "SELECT * FROM providers WHERE id = ?",
            args: [req.params.id]
        })

        const row = result.rows[0] as unknown as ProviderRow
        const provider = {
            id: row.id,
            name: row.name,
            description: row.description,
            website: row.website,
            baseUrl: row.base_url,
            apiKeyRequired: Boolean(row.api_key_required),
            isEnabled: Boolean(row.is_enabled),
            supportedFeatures: row.supported_features ? JSON.parse(row.supported_features) : DEFAULT_SUPPORTED_FEATURES
        }

        res.json(provider)
    } catch (error) {
        next(error)
    }
}

const deleteProvider: RequestHandler = async (req, res, next) => {
    try {
        await client.execute({
            sql: "DELETE FROM providers WHERE id = ?",
            args: [req.params.id]
        })
        res.status(204).end()
    } catch (error) {
        next(error)
    }
}

providersRouter.get("/", getProviders)
providersRouter.get("/:id", getProviderById)
providersRouter.post("/", createProvider)
providersRouter.patch("/:id", updateProvider)
providersRouter.delete("/:id", deleteProvider) 