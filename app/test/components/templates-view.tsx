'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"

interface Template {
    id: string
    name: string
    content: string
    version: string
    createdAt: Date
    updatedAt: Date
    isDeprecated: boolean
}

export function TemplatesView() {
    const [templates, setTemplates] = useState<Template[]>([])
    const [name, setName] = useState("")
    const [content, setContent] = useState("")
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const response = await fetch("/api/test/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, content })
            })

            if (!response.ok) throw new Error("Failed to create template")

            const newTemplate = await response.json()
            setTemplates([...templates, newTemplate])
            setName("")
            setContent("")

            toast({
                title: "Success",
                description: "Template created successfully"
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create template",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Input
                        placeholder="Template Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <Textarea
                        placeholder="Template Content (use {{parameter}} for variables)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={5}
                    />
                </div>
                <Button type="submit">Create Template</Button>
            </form>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Templates</h2>
                {templates.map((template) => (
                    <Card key={template.id} className="p-4">
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-gray-500">Version: {template.version}</p>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-sm">
                            {template.content}
                        </pre>
                    </Card>
                ))}
            </div>
        </div>
    )
} 