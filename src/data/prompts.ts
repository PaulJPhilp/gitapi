import type { Prompt } from "../schemas/prompts"

export const prompts: Prompt[] = [
    {
        id: "summarize",
        name: "Summarize Text",
        content: "Please provide a concise summary of the following text:\n\n{{text}}",
        isActive: true,
        modelId: "gpt-4-turbo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "analyze-code",
        name: "Code Analysis",
        content: "Please analyze the following code and provide insights on potential improvements, bugs, and best practices:\n\n```{{language}}\n{{code}}\n```",
        isActive: true,
        modelId: "gpt-4-turbo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "translate",
        name: "Translate Text",
        content: "Please translate the following text from {{source_language}} to {{target_language}}:\n\n{{text}}",
        isActive: true,
        modelId: "gpt-3.5-turbo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "explain-concept",
        name: "Explain Concept",
        content: "Please explain the concept of {{concept}} in simple terms that a {{audience}} could understand.",
        isActive: true,
        modelId: "claude-3-sonnet",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
] 