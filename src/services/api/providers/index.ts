import type { CompletionsResponse } from "../../../schemas/endpoints"
import type { Model } from "../../../schemas/models"
import { NetworkError } from "../../errors"
import { completeWithAnthropic } from "./anthropic"
import { completeWithOpenAI } from "./openai"

export async function completeWithProvider(
    prompt: string,
    model: Model,
    apiKey: string,
    temperature?: number,
    maxTokens?: number
): Promise<CompletionsResponse> {
    switch (model.providerId) {
        case "anthropic":
            return await completeWithAnthropic(prompt, model, apiKey, temperature, maxTokens)
        case "openai":
            return await completeWithOpenAI(prompt, model, apiKey, temperature, maxTokens)
        default:
            throw new NetworkError(`Provider ${model.providerId} is not supported for completions`)
    }
}

export * from "./anthropic"
export * from "./openai"

