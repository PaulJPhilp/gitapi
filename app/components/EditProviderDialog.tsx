"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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

interface EditProviderDialogProps {
    provider: Provider
    open: boolean
    onOpenChange: (open: boolean) => void
    onProviderUpdated: (provider: Provider) => void
}

async function updateProvider(id: string, data: ProviderFormValues): Promise<Provider> {
    const response = await fetch(`${API_BASE_URL}/providers/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        throw new Error("Failed to update provider")
    }

    return response.json()
}

export function EditProviderDialog({ provider, open, onOpenChange, onProviderUpdated }: EditProviderDialogProps) {
    const [error, setError] = useState<string | null>(null)

    type SupportedFeatureKey = keyof ProviderFormValues["supportedFeatures"]

    const supportedFeatures = [
        { key: "chat" as SupportedFeatureKey, label: "Chat" },
        { key: "completion" as SupportedFeatureKey, label: "Completion" },
        { key: "embedding" as SupportedFeatureKey, label: "Embedding" },
        { key: "imageGeneration" as SupportedFeatureKey, label: "Image Generation" },
        { key: "imageAnalysis" as SupportedFeatureKey, label: "Image Analysis" },
        { key: "functionCalling" as SupportedFeatureKey, label: "Function Calling" },
        { key: "streaming" as SupportedFeatureKey, label: "Streaming" },
    ]

    const form = useForm<ProviderFormValues>({
        resolver: zodResolver(providerSchema),
        defaultValues: {
            name: provider.name,
            description: provider.description,
            website: provider.website,
            isEnabled: provider.isEnabled,
            apiKeyRequired: provider.apiKeyRequired,
            baseUrl: provider.baseUrl || "",
            supportedFeatures: provider.supportedFeatures,
        },
    })

    const onSubmit = async (data: ProviderFormValues) => {
        try {
            const updatedProvider = await updateProvider(provider.id, data)
            onProviderUpdated(updatedProvider)
            onOpenChange(false)
            form.reset()
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update provider")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Provider</DialogTitle>
                    <DialogDescription>
                        Update the provider details below.
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
                                        <FormDescription>The display name of the provider</FormDescription>
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
                                        <FormDescription>The provider's official website</FormDescription>
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="isEnabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Enabled</FormLabel>
                                            <FormDescription>
                                                Whether this provider is active
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
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">API Key Required</FormLabel>
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

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Supported Features</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {supportedFeatures.map(({ key, label }) => (
                                    <FormField
                                        key={key}
                                        control={form.control}
                                        name={`supportedFeatures.${key}`}
                                        render={({ field: { value, onChange, ...field } }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <FormLabel className="text-base">
                                                    {label}
                                                </FormLabel>
                                                <FormControl>
                                                    <Switch
                                                        checked={value as boolean}
                                                        onCheckedChange={onChange}
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm font-medium text-destructive">
                                {error}
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
} 