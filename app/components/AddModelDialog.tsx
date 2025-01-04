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
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { Model, Provider } from "@/domain"
import { API_BASE_URL } from "@/src/config/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

const modelSchema = z.object({
    name: z.string().min(1, "Name is required"),
    providerId: z.string().min(1, "Provider is required"),
    modelFamily: z.string().min(1, "Model family is required"),
    isEnabled: z.boolean().default(true),
    contextWindow: z.number().min(1, "Context window must be at least 1"),
    maxTokens: z.number().min(1, "Max tokens must be at least 1"),
    inputPricePerToken: z.string().min(1, "Input price is required"),
    outputPricePerToken: z.string().min(1, "Output price is required"),
    type: z.enum(['proprietary', 'open source']).default('proprietary'),
    reasoning: z.boolean().default(false),
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

type ModelFormValues = z.infer<typeof modelSchema>

interface AddModelDialogProps {
    providers: Provider[]
    onModelAdded: (model: Model) => void
}

async function createModel(data: ModelFormValues): Promise<Model> {
    const response = await fetch(`${API_BASE_URL}/models`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ...data,
            inputPricePerToken: Number(data.inputPricePerToken),
            outputPricePerToken: Number(data.outputPricePerToken),
        }),
    })

    if (!response.ok) {
        throw new Error("Failed to create model")
    }

    return response.json()
}

export function AddModelDialog({ providers, onModelAdded }: AddModelDialogProps) {
    const [open, setOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<ModelFormValues>({
        resolver: zodResolver(modelSchema),
        defaultValues: {
            isEnabled: true,
            type: 'proprietary',
            reasoning: false,
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

    const onSubmit = async (data: ModelFormValues) => {
        try {
            const model = await createModel(data)
            onModelAdded(model)
            setOpen(false)
            form.reset()
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create model")
        }
    }

    type SupportedFeatureKey = keyof ModelFormValues["supportedFeatures"]

    const supportedFeatures = [
        { key: "chat" as SupportedFeatureKey, label: "Chat" },
        { key: "completion" as SupportedFeatureKey, label: "Completion" },
        { key: "embedding" as SupportedFeatureKey, label: "Embedding" },
        { key: "imageGeneration" as SupportedFeatureKey, label: "Image Generation" },
        { key: "imageAnalysis" as SupportedFeatureKey, label: "Image Analysis" },
        { key: "functionCalling" as SupportedFeatureKey, label: "Function Calling" },
        { key: "streaming" as SupportedFeatureKey, label: "Streaming" },
    ]

    const modelFamilies = [
        { value: "gpt", label: "GPT" },
        { value: "llama", label: "LLaMA" },
        { value: "palm", label: "PaLM" },
        { value: "claude", label: "Claude" },
        { value: "mistral", label: "Mistral" },
        { value: "gemini", label: "Gemini" },
        { value: "other", label: "Other" },
    ] as const

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Add New Model
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Model</DialogTitle>
                    <DialogDescription>
                        Create a new AI model. Fill in the details below.
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
                                            <Input placeholder="GPT-4" {...field} />
                                        </FormControl>
                                        <FormDescription>The display name of the model</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="providerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Provider</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a provider" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {providers.map((provider) => (
                                                    <SelectItem key={provider.id} value={provider.id}>
                                                        {provider.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>The AI provider this model belongs to</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="modelFamily"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Model Family</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a model family" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {modelFamilies.map(({ value, label }) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>The model architecture family</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isEnabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Enabled</FormLabel>
                                            <FormDescription>
                                                Whether this model is active
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="contextWindow"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Context Window</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="4096"
                                                onChange={e => field.onChange(Number(e.target.value))}
                                                value={field.value}
                                            />
                                        </FormControl>
                                        <FormDescription>Maximum number of tokens in context</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="maxTokens"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Tokens</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="4096"
                                                onChange={e => field.onChange(Number(e.target.value))}
                                                value={field.value}
                                            />
                                        </FormControl>
                                        <FormDescription>Maximum tokens in a single response</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="inputPricePerToken"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Input Price Per Token</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.000001"
                                                min="0"
                                                max="1"
                                                placeholder="0.000001"
                                                onChange={e => field.onChange(e.target.value)}
                                                value={field.value}
                                            />
                                        </FormControl>
                                        <FormDescription>Price per input token in USD</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="outputPricePerToken"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Output Price Per Token</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.000001"
                                                min="0"
                                                max="1"
                                                placeholder="0.000001"
                                                onChange={e => field.onChange(e.target.value)}
                                                value={field.value}
                                            />
                                        </FormControl>
                                        <FormDescription>Price per output token in USD</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select model type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="proprietary">Proprietary</SelectItem>
                                                <SelectItem value="open source">Open Source</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Whether the model is proprietary or open source
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reasoning"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel>Reasoning Capability</FormLabel>
                                            <FormDescription>
                                                Whether the model has advanced reasoning capabilities
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
                            <Button type="submit">Create Model</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
} 