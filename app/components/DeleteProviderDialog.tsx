"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteProviderDialogProps {
    isOpen: boolean
    providerName: string
    onConfirm: () => void
    onCancel: () => void
}

export function DeleteProviderDialog({
    isOpen,
    providerName,
    onConfirm,
    onCancel,
}: DeleteProviderDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Provider</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete {providerName}? This action cannot be undone.
                        All models associated with this provider will also be deleted.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
} 