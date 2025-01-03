import { NetworkError } from "../../errors"
import type { CompletionsResponse } from "../../schemas/endpoints"
import type { Model } from "../../schemas/models"

interface OpenAICompletionResponse {
    choices: [{
        message: {
            content: string
        }
    }]
    usage: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
}

export async function completeWithOpenAI(
    prompt: string,
    model: Model,
    apiKey: string,
    temperature?: number,
    maxTokens?: number
): Promise<CompletionsResponse> {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model.id,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: temperature ?? model.defaultTemperature ?? 0.7,
                max_tokens: maxTokens ?? model.maxTokens ?? 1024
            })
        })

        if (!response.ok) {
            throw new NetworkError(`OpenAI API error: ${response.statusText}`, response.status)
        }

        const data = (await response.json()) as OpenAICompletionResponse

        return {
            text: data.choices[0].message.content,
            usage: {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens
            }
        }
    } catch (error) {
        throw new NetworkError(`Failed to complete with OpenAI: ${error}`, undefined, error)
    }
} 