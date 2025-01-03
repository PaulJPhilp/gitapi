"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { API_BASE_URL } from "@/src/config/api"
import type { Model } from "@/src/schemas/models"
import { TrashIcon } from "@radix-ui/react-icons"
import { useCallback, useMemo, useState } from "react"
import { DeleteProviderDialog } from "./DeleteProviderDialog"
import { ProviderIcon } from "./ProviderIcon"

interface ModelFiltersProps {
    models: Model[]
    onFiltersChange: (filteredModels: Model[]) => void
    onProviderDeleted: (providerId: string) => void
}

async function deleteProvider(providerId: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/providers/${providerId}`, {
            method: 'DELETE',
        })
        if (!response.ok) {
            throw new Error(`Failed to delete provider: ${response.statusText}`)
        }
        return true
    } catch (error) {
        console.error("Failed to delete provider:", error)
        return false
    }
}

export function ModelFilters({ models, onFiltersChange, onProviderDeleted }: ModelFiltersProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedProvider, setSelectedProvider] = useState<string>("all")
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
    const [showDisabled, setShowDisabled] = useState(false)
    const [providerToDelete, setProviderToDelete] = useState<{ id: string, name: string } | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Get unique providers from models
    const providers = useMemo(() => {
        const uniqueProviders = new Set(models.map(model => model.providerId))
        return Array.from(uniqueProviders)
    }, [models])

    // Get all possible features from models
    const allFeatures = useMemo(() => {
        const features = new Set<string>()
        for (const model of models) {
            for (const [feature, isSupported] of Object.entries(model.supportedFeatures)) {
                if (isSupported) {
                    features.add(feature)
                }
            }
        }
        return Array.from(features).sort()
    }, [models])

    const applyFilters = useCallback(() => {
        let filteredModels = models

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filteredModels = filteredModels.filter(model =>
                model.name.toLowerCase().includes(query) ||
                model.modelFamily?.toLowerCase().includes(query) ||
                model.providerId.toLowerCase().includes(query)
            )
        }

        // Filter by provider
        if (selectedProvider !== "all") {
            filteredModels = filteredModels.filter(model =>
                model.providerId === selectedProvider
            )
        }

        // Filter by features
        if (selectedFeatures.length > 0) {
            filteredModels = filteredModels.filter(model =>
                selectedFeatures.every(feature =>
                    model.supportedFeatures[feature as keyof typeof model.supportedFeatures]
                )
            )
        }

        // Filter by enabled status
        if (!showDisabled) {
            filteredModels = filteredModels.filter(model => model.isEnabled)
        }

        onFiltersChange(filteredModels)
    }, [models, searchQuery, selectedProvider, selectedFeatures, showDisabled, onFiltersChange])

    // Update filters when any filter changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        applyFilters()
    }

    const handleProviderChange = (value: string) => {
        setSelectedProvider(value)
        applyFilters()
    }

    const handleFeatureToggle = (feature: string) => {
        setSelectedFeatures(prev => {
            const newFeatures = prev.includes(feature)
                ? prev.filter(f => f !== feature)
                : [...prev, feature]
            return newFeatures
        })
        applyFilters()
    }

    const handleShowDisabledChange = () => {
        setShowDisabled(prev => !prev)
        applyFilters()
    }

    const handleDeleteClick = (providerId: string) => {
        const providerName = models.find(m => m.providerId === providerId)?.providerId || providerId
        setProviderToDelete({ id: providerId, name: providerName })
    }

    const handleDeleteCancel = () => {
        setProviderToDelete(null)
        setError(null)
    }

    const handleDeleteConfirm = async () => {
        if (!providerToDelete) return

        const success = await deleteProvider(providerToDelete.id)
        if (success) {
            onProviderDeleted(providerToDelete.id)
            setProviderToDelete(null)
            setError(null)
            // Reset provider selection if the deleted provider was selected
            if (selectedProvider === providerToDelete.id) {
                setSelectedProvider("all")
            }
        } else {
            setError("Failed to delete provider")
        }
    }

    return (
        <div className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
                <Input
                    placeholder="Search models..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="flex-1"
                />
                <Select
                    value={selectedProvider}
                    onValueChange={handleProviderChange}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Providers</SelectItem>
                        {providers.map(provider => (
                            <SelectItem key={provider} value={provider} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ProviderIcon providerId={provider} />
                                    <span>{provider}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-100"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteClick(provider)
                                    }}
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </Button>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    variant={showDisabled ? "default" : "outline"}
                    onClick={handleShowDisabledChange}
                >
                    {showDisabled ? "Hide Disabled" : "Show Disabled"}
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {allFeatures.map(feature => (
                    <Badge
                        key={feature}
                        variant={selectedFeatures.includes(feature) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleFeatureToggle(feature)}
                    >
                        {feature.replace(/([A-Z])/g, " $1").toLowerCase()}
                    </Badge>
                ))}
            </div>
            {error && (
                <div className="text-sm text-red-600 mt-2">
                    {error}
                </div>
            )}
            {providerToDelete && (
                <DeleteProviderDialog
                    isOpen={true}
                    providerName={providerToDelete.name}
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                />
            )}
        </div>
    )
} 