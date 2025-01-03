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
import { Switch } from "@/components/ui/switch"
import { API_BASE_URL } from "@/src/config/api"
import type { Provider } from "@/src/domain/models"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

const providerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    website: z.string().url("Must be a valid URL"),
    isEnabled: z.boolean().default(true),
    apiKeyRequired: z.boolean().default(true),
    baseUrl: z.string().optional(),
    supportedFeatures: z.object({
        chat: z.boolean().default(false),
        completion: z.boolean().default(false),
        embedding: z.boolean().default(false),
        imageGeneration: z.boolean().default(false),
        imageAnalysis: z.boolean().default(false),
        functionCalling: z.boolean().default(false),
        streaming: z.boolean().default(false),
    }),
})

type ProviderFormValues = z.infer<typeof providerSchema>

interface AddProviderDialogProps {
    onProviderAdded: (provider: Provider) => void
}

async function createProvider(data: ProviderFormValues): Promise<Provider> {
    const response = await fetch(`${API_BASE_URL}/providers`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        throw new Error("Failed to create provider")
    }

    return response.json()
}

export function AddProviderDialog({ onProviderAdded }: AddProviderDialogProps) {
    const [open, setOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<ProviderFormValues>({
        resolver: zodResolver(providerSchema),
        defaultValues: {
            isEnabled: true,
            apiKeyRequired: true,
            supportedFeatures: {
                chat: false,
                completion: false,
                embedding: false,
                imageGeneration: false,
                imageAnalysis: false,
                functionCalling: false,
                streaming: false,
            },
        },
    })

    const onSubmit = async (data: ProviderFormValues) => {
        try {
            const provider = await createProvider(data)
            onProviderAdded(provider)
            setOpen(false)
            form.reset()
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create provider")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Add New Provider
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Provider</DialogTitle>
                    <DialogDescription>
                        Create a new AI provider. Fill in the details below.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="OpenAI" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://openai.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Leading AI research company..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="baseUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Base URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://api.openai.com/v1" {...field} />
                                    </FormControl>
                                    <FormDescription>Optional API base URL</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Supported Features</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="supportedFeatures.chat"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Chat</FormLabel>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value as boolean}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="supportedFeatures.completion"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Completion</FormLabel>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value as boolean}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="supportedFeatures.embedding"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Embedding</FormLabel>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value as boolean}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="supportedFeatures.imageGeneration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image Generation</FormLabel>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value as boolean}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="supportedFeatures.imageAnalysis"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image Analysis</FormLabel>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value as boolean}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="supportedFeatures.functionCalling"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Function Calling</FormLabel>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value as boolean}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="supportedFeatures.streaming"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Streaming</FormLabel>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value as boolean}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="isEnabled"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel>Enabled</FormLabel>
                                            <FormDescription>
                                                Whether this provider is available for use
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="apiKeyRequired"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel>API Key Required</FormLabel>
                                            <FormDescription>
                                                Whether this provider requires an API key
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="submit">Create Provider</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
} 