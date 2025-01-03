import { NetworkError } from "../../errors"
import type { CompletionsResponse } from "../../schemas/endpoints"
import type { Model } from "../../schemas/models"

interface AnthropicCompletionResponse {
    id: string
    type: "message"
    role: "assistant"
    content: [{
        type: "text",
        text: string
    }]
    stop_reason: string
    stop_sequence: string | null
    usage: {
        input_tokens: number
        output_tokens: number
        cache_creation_input_tokens: number
        cache_read_input_tokens: number
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
        // Map our model IDs to Anthropic's model IDs
        const modelMap: Record<string, string> = {
            "claude-3-sonnet": "claude-3-sonnet-20240229",
            "claude-3-opus": "claude-3-opus-20240229"
        }

        const anthropicModelId = modelMap[model.id] ?? model.id
        console.log("[Anthropic Provider] Making request with model:", anthropicModelId)
        console.log("[Anthropic Provider] API Key length:", apiKey?.length ?? 0)

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "anthropic-version": "2023-06-01",
                "x-api-key": apiKey
            },
            body: JSON.stringify({
                model: anthropicModelId,
                messages: [{
                    role: "user",
                    content: prompt
                }],
                max_tokens: maxTokens ?? model.maxTokens ?? 1024,
                temperature: temperature ?? model.defaultTemperature ?? 0.7
            })
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error("[Anthropic Provider] Error response:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData,
                requestBody: {
                    model: anthropicModelId,
                    messages: [{
                        role: "user",
                        content: "REDACTED"
                    }],
                    max_tokens: maxTokens ?? model.maxTokens ?? 1024,
                    temperature: temperature ?? model.defaultTemperature ?? 0.7
                }
            })
            throw new NetworkError(`Anthropic API error: ${response.statusText}`, response.status)
        }

        const data = (await response.json()) as AnthropicCompletionResponse
        console.log("[Anthropic Provider] Response:", data)

        return {
            text: data.content[0].text,
            usage: {
                promptTokens: data.usage.input_tokens + data.usage.cache_creation_input_tokens + data.usage.cache_read_input_tokens,
                completionTokens: data.usage.output_tokens,
                totalTokens: data.usage.input_tokens + data.usage.cache_creation_input_tokens + data.usage.cache_read_input_tokens + data.usage.output_tokens
            }
        }
    } catch (error) {
        console.error("[Anthropic Provider] Error:", error)
        throw new NetworkError(`Failed to complete with Anthropic: ${error}`, undefined, error)
    }
} 