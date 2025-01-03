import { z } from "zod"
import { baseNewSchema, baseSchema } from "./common"

export const promptSchema = baseSchema.extend({
    name: z.string(),
    content: z.string(),
    isActive: z.boolean(),
    modelId: z.string()
})

export type Prompt = z.infer<typeof promptSchema>

export const newPromptSchema = baseNewSchema.extend({
    name: z.string(),
    content: z.string(),
    isActive: z.boolean(),
    modelId: z.string()
})

export type NewPrompt = z.infer<typeof newPromptSchema>