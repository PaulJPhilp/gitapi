import { z } from "zod"
import { baseNewSchema, baseSchema, usageSchema } from "./common"

export const promptRunSchema = baseSchema.extend({
    promptId: z.string(),
    modelId: z.string(),
    providerId: z.string(),
    content: z.string(),
    completion: z.string(),
    usage: usageSchema
})

export type PromptRun = z.infer<typeof promptRunSchema>

export const newPromptRunSchema = baseNewSchema.extend({
    promptId: z.string(),
    modelId: z.string(),
    providerId: z.string(),
    content: z.string(),
    completion: z.string(),
    usage: usageSchema
})

export type NewPromptRun = z.infer<typeof newPromptRunSchema>