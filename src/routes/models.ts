import { Router } from "express"
import { modelsService } from "../services/models"

export const modelsRouter = Router()

modelsRouter.get("/", async (req, res, next) => {
    try {
        const models = await modelsService.list()
        res.json({ models })
    } catch (error) {
        next(error)
    }
})

modelsRouter.get("/:id", async (req, res, next) => {
    try {
        const model = await modelsService.getById(req.params.id)
        res.json(model)
    } catch (error) {
        next(error)
    }
})

modelsRouter.post("/", async (req, res, next) => {
    try {
        const model = await modelsService.create(req.body)
        res.status(201).json(model)
    } catch (error) {
        next(error)
    }
})

modelsRouter.patch("/:id", async (req, res, next) => {
    try {
        const model = await modelsService.update(req.params.id, req.body)
        res.json(model)
    } catch (error) {
        next(error)
    }
})

modelsRouter.delete("/:id", async (req, res, next) => {
    try {
        await modelsService.delete(req.params.id)
        res.status(204).send()
    } catch (error) {
        next(error)
    }
}) 