'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"

interface Template {
    id: string
    name: string
    content: string
    version: string
}

interface Prompt {
    id: string
    templateId: string
    templateVersion: string
    parameters: Record<string, string>
    createdAt: Date
}

export function PromptsView() {
    const [templates, setTemplates] = useState<Template[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
    const [parameters, setParameters] = useState<Record<string, string>>({})
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const { toast } = useToast()

    useEffect(() => {
        // Load templates
        fetch("/api/test/templates")
            .then((res) => res.json())
            .then(setTemplates)
            .catch(console.error)

        // Load prompts
        fetch("/api/test/prompts")
            .then((res) => res.json())
            .then(setPrompts)
            .catch(console.error)
    }, [])

    const extractParameters = (content: string): string[] => {
        const matches = content.match(/{{([^}]+)}}/g) || []
        return matches.map(m => m.slice(2, -2))
    }

    const handleTemplateSelect = (templateId: string) => {
        const template = templates.find(t => t.id === templateId)
        if (template) {
            setSelectedTemplate(template)
            const params = extractParameters(template.content)
            const initialParams = Object.fromEntries(params.map(p => [p, ""]))
            setParameters(initialParams)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedTemplate) return

        try {
            const response = await fetch("/api/test/prompts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    templateId: selectedTemplate.id,
                    templateVersion: selectedTemplate.version,
                    parameters
                })
            })

            if (!response.ok) throw new Error("Failed to create prompt")

            const newPrompt = await response.json()
            setPrompts([...prompts, newPrompt])
            setSelectedTemplate(null)
            setParameters({})

            toast({
                title: "Success",
                description: "Prompt created successfully"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create prompt",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                    onValueChange={handleTemplateSelect}
                    value={selectedTemplate?.id}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                        {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                                {template.name} (v{template.version})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedTemplate && (
                    <div className="space-y-4">
                        <pre className="p-2 bg-gray-100 rounded text-sm">
                            {selectedTemplate.content}
                        </pre>

                        {Object.keys(parameters).map((param) => (
                            <div key={param}>
                                <Input
                                    placeholder={param}
                                    value={parameters[param]}
                                    onChange={(e) => setParameters({
                                        ...parameters,
                                        [param]: e.target.value
                                    })}
                                    required
                                />
                            </div>
                        ))}

                        <Button type="submit">Create Prompt</Button>
                    </div>
                )}
            </form>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Prompts</h2>
                {prompts.map((prompt) => {
                    const template = templates.find(t => t.id === prompt.templateId)
                    return (
                        <Card key={prompt.id} className="p-4">
                            <h3 className="font-medium">
                                {template?.name || "Unknown Template"}
                            </h3>
                            <p className="text-sm text-gray-500">
                                Version: {prompt.templateVersion}
                            </p>
                            <div className="mt-2">
                                <h4 className="text-sm font-medium">Parameters:</h4>
                                <pre className="mt-1 p-2 bg-gray-100 rounded text-sm">
                                    {JSON.stringify(prompt.parameters, null, 2)}
                                </pre>
                            </div>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
} 