"use client"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LexicalEditor } from "@/components/ui/lexical-editor"
import type { Prompt } from "@/src/schemas/prompts"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    content: z.string().min(1, "Content is required"),
    modelId: z.string().min(1, "Model is required")
})

interface PromptsFormProps {
    onSuccess?: () => void
}

// Helper functions for localStorage
const getStoredPrompts = (): Prompt[] => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('prompts')
    return stored ? JSON.parse(stored) : []
}

const setStoredPrompts = (prompts: Prompt[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('prompts', JSON.stringify(prompts))
}

export default function PromptsForm({ onSuccess }: PromptsFormProps) {
    const [error, setError] = useState<string>()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            content: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const newPrompt: Prompt = {
                id: crypto.randomUUID(),
                name: values.name.trim(),
                content: values.content.trim(),
                isActive: false,
                modelId: values.modelId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            const prompts = getStoredPrompts()
            setStoredPrompts([...prompts, newPrompt])

            form.reset()
            onSuccess?.()
        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred")
        }
    }

    return (
        <div className="space-y-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter prompt name..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Content</FormLabel>
                                <FormControl>
                                    <LexicalEditor
                                        placeholder="Enter prompt content..."
                                        className="min-h-[200px]"
                                        defaultValue={field.value}
                                        onChange={(editorState) => {
                                            const json = editorState.toJSON()
                                            field.onChange(JSON.stringify(json))
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end space-x-2">
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Creating..." : "Create Prompt"}
                        </Button>
                    </div>
                </form>
            </Form>

            {error && (
                <div className="text-sm font-medium text-destructive">
                    {error}
                </div>
            )}
        </div>
    )
} 