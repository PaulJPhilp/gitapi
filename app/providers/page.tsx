"use client"

import { AddProviderDialog } from "@/app/components/AddProviderDialog"
import { EditProviderDialog } from "@/app/components/EditProviderDialog"
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
import type { Provider } from "@/src/domain/models"
import { Suspense, useCallback, useEffect, useState } from "react"

function ProvidersList() {
    const [providers, setProviders] = useState<Provider[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [editingProvider, setEditingProvider] = useState<Provider | null>(null)

    const fetchProviders = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            console.log("[Providers Page] Fetching providers...")

            const response = await fetch(`${API_BASE_URL}/providers`)
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(
                    errorData.message ||
                    `Failed to fetch providers: ${response.status} ${response.statusText}`
                )
            }

            const data = await response.json()
            console.log("[Providers Page] Successfully fetched providers:", data)
            setProviders(data.providers.map((provider: {
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
        } catch (err) {
            console.error("[Providers Page] Error fetching providers:", {
                error: err,
                name: err instanceof Error ? err.name : "Unknown",
                message: err instanceof Error ? err.message : "Unknown error",
                stack: err instanceof Error ? err.stack : "No stack trace",
            })
            setError(err instanceof Error ? err.message : "Failed to fetch providers")
            throw err // Let error boundary handle it
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchProviders()
    }, [fetchProviders])

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(id)
            console.log(`[Providers Page] Deleting provider ${id}...`)
            const response = await fetch(`${API_BASE_URL}/providers/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(
                    errorData.message ||
                    `Failed to delete provider: ${response.status} ${response.statusText}`
                )
            }

            console.log(`[Providers Page] Successfully deleted provider ${id}`)
            await fetchProviders()
        } catch (err) {
            console.error("[Providers Page] Error deleting provider:", {
                error: err,
                name: err instanceof Error ? err.name : "Unknown",
                message: err instanceof Error ? err.message : "Unknown error",
                stack: err instanceof Error ? err.stack : "No stack trace",
            })
            setError(err instanceof Error ? err.message : "Failed to delete provider")
            throw err // Let error boundary handle it
        } finally {
            setIsDeleting(null)
        }
    }

    const handleEdit = (provider: Provider) => {
        setEditingProvider(provider)
    }

    const handleProviderUpdated = (updatedProvider: Provider) => {
        setProviders(providers.map(p => p.id === updatedProvider.id ? updatedProvider : p))
    }

    const handleProviderAdded = () => {
        console.log("[Providers Page] Provider added, refreshing list...")
        fetchProviders()
    }

    if (isLoading) {
        return <LoadingSpinner text="Loading providers..." />
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Providers</h1>
                <AddProviderDialog onProviderAdded={handleProviderAdded} />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Base URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>API Key Required</TableHead>
                        <TableHead>Features</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {providers.map((provider) => (
                        <TableRow key={provider.id}>
                            <TableCell className="font-medium">{provider.name}</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={provider.description}>
                                {provider.description}
                            </TableCell>
                            <TableCell>
                                <a
                                    href={provider.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    {(() => {
                                        try {
                                            return new URL(provider.website).hostname
                                        } catch {
                                            return provider.website
                                        }
                                    })()}
                                </a>
                            </TableCell>
                            <TableCell>{provider.baseUrl || "Default"}</TableCell>
                            <TableCell>
                                <Badge variant={provider.isEnabled ? "default" : "secondary"}>
                                    {provider.isEnabled ? "Enabled" : "Disabled"}
                                </Badge>
                            </TableCell>
                            <TableCell>{provider.apiKeyRequired ? "Yes" : "No"}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {Object.entries(provider.supportedFeatures)
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
                                    onClick={() => handleEdit(provider)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(provider.id)}
                                    disabled={isDeleting === provider.id}
                                >
                                    {isDeleting === provider.id ? (
                                        <>
                                            <LoadingSpinner size="sm" className="mr-2" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete"
                                    )}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {editingProvider && (
                <EditProviderDialog
                    provider={editingProvider}
                    open={true}
                    onOpenChange={(open) => !open && setEditingProvider(null)}
                    onProviderUpdated={handleProviderUpdated}
                />
            )}
        </div>
    )
}

export default function ProvidersPage() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner text="Loading providers page..." fullScreen />}>
                <ProvidersList />
            </Suspense>
        </ErrorBoundary>
    )
} 