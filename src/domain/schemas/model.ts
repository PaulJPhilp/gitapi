import { z } from "zod"
import { baseNewSchema, baseSchema, supportedFeaturesSchema } from "./common"

export const modelSchema = baseSchema.extend({
    name: z.string(),
    description: z.string().nullable(),
    providerId: z.string(),
    isEnabled: z.boolean(),
    modelFamily: z.string(),
    contextWindow: z.number(),
    maxTokens: z.number().nullable(),
    inputPricePerToken: z.string(),
    outputPricePerToken: z.string(),
    releaseDate: z.string().nullable(),
    type: z.enum(['proprietary', 'open source']),
    reasoning: z.boolean().default(false),
    supportedFeatures: supportedFeaturesSchema
})

export type Model = z.infer<typeof modelSchema>

export const newModelSchema = baseNewSchema.extend({
    name: z.string(),
    description: z.string().nullable(),
    providerId: z.string(),
    isEnabled: z.boolean(),
    modelFamily: z.string(),
    contextWindow: z.number(),
    maxTokens: z.number().nullable(),
    inputPricePerToken: z.string(),
    outputPricePerToken: z.string(),
    releaseDate: z.string().nullable(),
    type: z.enum(['proprietary', 'open source']),
    reasoning: z.boolean().default(false),
    supportedFeatures: supportedFeaturesSchema
})

export type NewModel = z.infer<typeof newModelSchema> 