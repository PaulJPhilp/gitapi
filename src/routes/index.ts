import { Router } from "express"
import { modelsRouter } from "./models"
import { promptRunsRouter } from "./prompt-runs"
import { promptsRouter } from "./prompts"
import { providersRouter } from "./providers"

export const routes = Router()

routes.get("/health", (_req, res) => {
    res.json({ status: "ok" })
})

routes.use("/models", modelsRouter)
routes.use("/prompts", promptsRouter)
routes.use("/providers", providersRouter)
routes.use("/prompt-runs", promptRunsRouter) 