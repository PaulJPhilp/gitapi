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

interface DeleteModelDialogProps {
    isOpen: boolean
    modelName: string
    onConfirm: () => Promise<void>
    onCancel: () => void
}

export function Agent1Prompt({
    isOpen,
    modelName,
    onConfirm,
    onCancel,
}: DeleteModelDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onCancel}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                </AlertDialogHeader>
            </AlertDialogContent>
        </AlertDialog>
    )
}
