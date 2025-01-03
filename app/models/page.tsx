"use client"

import { AddModelDialog } from "@/app/components/AddModelDialog"
import { ErrorBoundary } from "@/app/components/ErrorBoundary"
import { LoadingSpinner } from "@/app/components/LoadingSpinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { API_BASE_URL } from "@/src/config/api"
import type { Model, Provider } from "@/src/domain/models"
import { Suspense, useEffect, useState } from "react"

function ModelsList() {
    const [models, setModels] = useState<Model[]>([])
    const [providers, setProviders] = useState<Provider[]>([])
    const [error, setError] = useState<string>()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(undefined)

                const [modelsResponse, providersResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/models`),
                    fetch(`${API_BASE_URL}/providers`)
                ])

                if (!modelsResponse.ok || !providersResponse.ok) {
                    throw new Error("Failed to fetch data")
                }

                const [modelsData, providersData] = await Promise.all([
                    modelsResponse.json(),
                    providersResponse.json()
                ])

                setModels(modelsData.models.map((model: {
                    id: string
                    name: string
                    providerId: string
                    modelFamily: string
                    contextWindow: number
                    maxTokens: number | null
                    inputPricePerToken: number
                    outputPricePerToken: number
                    isEnabled: boolean
                    supported_features?: string
                    supportedFeatures?: Record<string, boolean>
                }) => ({
                    ...model,
                    supportedFeatures: typeof model.supported_features === 'string'
                        ? JSON.parse(model.supported_features)
                        : model.supportedFeatures
                })))

                setProviders(providersData.providers.map((provider: {
                    id: string
                    name: string
                    description: string
                    website: string
                    baseUrl: string | null
                    apiKeyRequired: boolean
                    isEnabled: boolean
                    supported_features?: string
                    supportedFeatures?: Record<string, boolean>
                }) => ({
                    ...provider,
                    supportedFeatures: typeof provider.supported_features === 'string'
                        ? JSON.parse(provider.supported_features)
                        : provider.supportedFeatures
                })))
            } catch (error) {
                setError(error instanceof Error ? error.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleModelAdded = () => {
        // Refetch models when a new one is added
        fetch(`${API_BASE_URL}/models`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch models")
                }
                return response.json()
            })
            .then(data => setModels(data.models.map((model: {
                id: string
                name: string
                providerId: string
                modelFamily: string
                contextWindow: number
                maxTokens: number | null
                inputPricePerToken: number
                outputPricePerToken: number
                isEnabled: boolean
                supported_features?: string
                supportedFeatures?: Record<string, boolean>
            }) => ({
                ...model,
                supportedFeatures: typeof model.supported_features === 'string'
                    ? JSON.parse(model.supported_features)
                    : model.supportedFeatures
            }))))
            .catch(error => setError(error instanceof Error ? error.message : "An error occurred"))
    }

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/models/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete model")
            }

            setModels(models.filter(model => model.id !== id))
        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred")
        }
    }

    const handleSetActive = async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/models/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    isEnabled: true,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to update model")
            }

            setModels(models.map(model => ({
                ...model,
                isEnabled: model.id === id ? true : model.isEnabled,
            })))
        } catch (error) {
            setError(error instanceof Error ? error.message : "An error occurred")
        }
    }

    if (loading) {
        return <LoadingSpinner text="Loading models..." />
    }

    if (error) {
        return <div className="text-destructive">{error}</div>
    }

    return (
        <div className="container py-8 space-y-8">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Models</h1>
                <AddModelDialog onModelAdded={handleModelAdded} providers={providers} />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Model Family</TableHead>
                        <TableHead>Context Window</TableHead>
                        <TableHead>Max Tokens</TableHead>
                        <TableHead>Input Price</TableHead>
                        <TableHead>Output Price</TableHead>
                        <TableHead>Features</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {models.map((model) => (
                        <TableRow key={model.id}>
                            <TableCell>
                                {model.isEnabled && (
                                    <Badge variant="secondary">Active</Badge>
                                )}
                            </TableCell>
                            <TableCell className="font-medium">{model.name}</TableCell>
                            <TableCell>
                                {providers.find(p => p.id === model.providerId)?.name}
                            </TableCell>
                            <TableCell className="capitalize">{model.modelFamily}</TableCell>
                            <TableCell>{model.contextWindow.toLocaleString()}</TableCell>
                            <TableCell>{model.maxTokens?.toLocaleString() ?? 'N/A'}</TableCell>
                            <TableCell>${Number(model.inputPricePerToken).toFixed(6)}</TableCell>
                            <TableCell>${Number(model.outputPricePerToken).toFixed(6)}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {Object.entries(model.supportedFeatures)
                                        .filter(([_, enabled]) => enabled)
                                        .map(([feature]) => (
                                            <Badge key={feature} variant="outline" className="capitalize">
                                                {feature.replace(/([A-Z])/g, ' $1').trim()}
                                            </Badge>
                                        ))
                                    }
                                </div>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetActive(model.id)}
                                    disabled={model.isEnabled}
                                >
                                    Set Active
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(model.id)}
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default function ModelsPage() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner text="Loading models page..." fullScreen />}>
                <ModelsList />
            </Suspense>
        </ErrorBoundary>
    )
} 