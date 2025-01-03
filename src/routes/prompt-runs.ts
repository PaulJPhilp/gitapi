import {
    Router,
    type RequestHandler
} from "express"
import { z } from "zod"
import { promptRunsService } from "../services/prompt-runs"

const promptRunsRouter = Router()

const UsageSchema = z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number()
})

const CreatePromptRunSchema = z.object({
    promptId: z.string(),
    modelId: z.string(),
    providerId: z.string(),
    content: z.string(),
    completion: z.string(),
    usage: UsageSchema
})

interface PromptRunParams {
    id: string
}

const getPromptRun: RequestHandler<PromptRunParams> = async (req, res, next) => {
    try {
        const promptRun = await promptRunsService.getById(req.params.id)
        if (!promptRun) {
            res.status(404).json({ error: "Prompt run not found" })
            return
        }
        res.json(promptRun)
    } catch (error) {
        next(error)
    }
}

const createPromptRun: RequestHandler = async (req, res, next) => {
    try {
        const data = CreatePromptRunSchema.parse(req.body)
        const promptRun = await promptRunsService.create(data)
        res.status(201).json(promptRun)
    } catch (error) {
        next(error)
    }
}

promptRunsRouter.get("/:id", getPromptRun)
promptRunsRouter.post("/", createPromptRun)

export { promptRunsRouter }
