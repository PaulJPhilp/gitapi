import { NetworkError } from "../../errors"
import type { CompletionsResponse } from "../../schemas/endpoints"
import type { Model } from "../../schemas/models"

interface AnthropicCompletionResponse {
    content: [{
        text: string
    }]
    usage: {
        input_tokens: number
        output_tokens: number
    }
}

export async function completeWithAnthropic(
    prompt: string,
    model: Model,
    apiKey: string,
    temperature?: number,
    maxTokens?: number
): Promise<CompletionsResponse> {
    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01"
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
            throw new NetworkError(`Anthropic API error: ${response.statusText}`, response.status)
        }

        const data = (await response.json()) as AnthropicCompletionResponse

        return {
            text: data.content[0].text,
            usage: {
                promptTokens: data.usage.input_tokens,
                completionTokens: data.usage.output_tokens,
                totalTokens: data.usage.input_tokens + data.usage.output_tokens
            }
        }
    } catch (error) {
        throw new NetworkError(`Failed to complete with Anthropic: ${error}`, undefined, error)
    }
} 