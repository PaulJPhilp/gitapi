import { z } from "zod"
import { baseNewSchema, baseSchema, supportedFeaturesSchema } from "./common"

export const providerSchema = baseSchema.extend({
    name: z.string(),
    description: z.string(),
    website: z.string(),
    apiKeyRequired: z.boolean(),
    baseUrl: z.string().nullable(),
    isEnabled: z.boolean(),
    releaseDate: z.string().nullable(),
    supportedFeatures: supportedFeaturesSchema
})

export type Provider = z.infer<typeof providerSchema>

export const newProviderSchema = baseNewSchema.extend({
    name: z.string(),
    description: z.string(),
    website: z.string(),
    apiKeyRequired: z.boolean(),
    baseUrl: z.string().nullable(),
    isEnabled: z.boolean(),
    releaseDate: z.string().nullable(),
    supportedFeatures: supportedFeaturesSchema
})

export type NewProvider = z.infer<typeof newProviderSchema>