import { Router } from "express"
import { promptsService } from "../services/prompts"

export const promptsRouter = Router()

promptsRouter.get("/", async (req, res, next) => {
    try {
        const prompts = await promptsService.list()
        res.json(prompts)
    } catch (error) {
        next(error)
    }
})

promptsRouter.get("/:id", async (req, res, next) => {
    try {
        const prompt = await promptsService.getById(req.params.id)
        res.json(prompt)
    } catch (error) {
        next(error)
    }
})

promptsRouter.post("/", async (req, res, next) => {
    try {
        const prompt = await promptsService.create(req.body)
        res.status(201).json(prompt)
    } catch (error) {
        next(error)
    }
})

promptsRouter.patch("/:id", async (req, res, next) => {
    try {
        const prompt = await promptsService.update(req.params.id, req.body)
        res.json(prompt)
    } catch (error) {
        next(error)
    }
})

promptsRouter.delete("/:id", async (req, res, next) => {
    try {
        await promptsService.delete(req.params.id)
        res.status(204).send()
    } catch (error) {
        next(error)
    }
}) 