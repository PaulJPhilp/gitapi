import type { Model } from "@/app/services/providers"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
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
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
    modelId: z.string().min(1, "Model ID is required"),
    prompt: z.string().min(1, "Prompt is required"),
    temperature: z.number().min(0).max(1).optional(),
    maxTokens: z.number().min(1).optional(),
})

export interface PromptRunnerProps {
    models: Model[]
    content: string
    onSubmit: (values: PromptRunnerFormData) => Promise<void>
    loading: boolean
    error: string | null
}

export interface PromptRunnerFormData {
    modelId: string
    prompt: string
    temperature?: number
    maxTokens?: number
}

export function PromptRunner({ content, models, loading, onSubmit, error }: PromptRunnerProps) {
    const form = useForm<PromptRunnerFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            modelId: "",
            prompt: content,
            temperature: undefined,
            maxTokens: undefined,
        },
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle>Generate Completion</CardTitle>
                <CardDescription>
                    Select a model and customize parameters to generate a completion
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                                        Choose the AI model to use for completion
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prompt</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter your prompt"
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="temperature"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Temperature</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="1"
                                                placeholder="0.7"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Controls randomness (0-1)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="maxTokens"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Max Tokens</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                placeholder="2048"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Maximum length of response
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" disabled={loading}>
                            {loading ? "Generating..." : "Generate"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
} 