import { cn } from "@/components/ui/utils";
import type * as React from "react";

interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> { }

export function ErrorMessage({ className, ...props }: ErrorMessageProps) {
    return (
        <div
            className={cn("text-sm font-medium text-destructive", className)}
            {...props}
        />
    );
}
