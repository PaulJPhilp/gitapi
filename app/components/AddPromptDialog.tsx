"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { API_BASE_URL } from "@/src/config/api"
import type { Model } from "@/src/schemas/models"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    modelId: z.string().min(1, "Model is required"),
    content: z.string().min(1, "Content is required"),
    isActive: z.boolean().default(true),
})

type FormData = z.infer<typeof formSchema>

interface AddPromptDialogProps {
    onPromptAdded?: () => void
}

export function AddPromptDialog({ onPromptAdded }: AddPromptDialogProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [models, setModels] = useState<Model[]>([])

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            modelId: "",
            content: "",
            isActive: true,
        },
    })

    useEffect(() => {
        const fetchModels = async () => {
            try {
                console.log("[AddPromptDialog] Fetching models...")
                const response = await fetch(`${API_BASE_URL}/models`)
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    throw new Error(
                        errorData.message ||
                        `Failed to fetch models: ${response.status} ${response.statusText}`
                    )
                }

                const data = await response.json()
                console.log("[AddPromptDialog] Successfully fetched models:", data)
                setModels(data.models)
            } catch (err) {
                console.error("[AddPromptDialog] Error fetching models:", {
                    error: err,
                    name: err instanceof Error ? err.name : "Unknown",
                    message: err instanceof Error ? err.message : "Unknown error",
                    stack: err instanceof Error ? err.stack : "No stack trace",
                })
                setError(err instanceof Error ? err.message : "Failed to fetch models")
            }
        }

        if (open) {
            fetchModels()
        }
    }, [open])

    const onSubmit = async (values: FormData) => {
        try {
            setIsSubmitting(true)
            setError(null)
            console.log("[AddPromptDialog] Creating prompt:", values)

            const response = await fetch(`${API_BASE_URL}/prompts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(
                    errorData.message ||
                    `Failed to create prompt: ${response.status} ${response.statusText}`
                )
            }

            console.log("[AddPromptDialog] Successfully created prompt")
            setOpen(false)
            form.reset()
            onPromptAdded?.()
        } catch (err) {
            console.error("[AddPromptDialog] Error creating prompt:", {
                error: err,
                name: err instanceof Error ? err.name : "Unknown",
                message: err instanceof Error ? err.message : "Unknown error",
                stack: err instanceof Error ? err.stack : "No stack trace",
            })
            setError(err instanceof Error ? err.message : "Failed to create prompt")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Prompt</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Prompt</DialogTitle>
                    <DialogDescription>
                        Create a new prompt template for generating completions
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter prompt name" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        A descriptive name for the prompt
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="modelId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Model</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a model" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {models.map((model) => (
                                                <SelectItem key={model.id} value={model.id}>
                                                    {model.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        The model to use for this prompt
                                    </FormDescription>
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
                                        <Textarea
                                            placeholder="Enter prompt content"
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The prompt template content
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Creating..." : "Create"}
                            </Button>
                        </DialogFooter>

                        {error && (
                            <div className="text-sm text-destructive mt-2">
                                {error}
                            </div>
                        )}
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
} 