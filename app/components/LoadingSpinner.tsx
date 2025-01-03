import { cn } from "@/lib/utils"
import { ReloadIcon } from "@radix-ui/react-icons"

interface LoadingSpinnerProps {
    className?: string
    size?: "sm" | "md" | "lg"
    text?: string
    minHeight?: string
    fullScreen?: boolean
}

const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
}

export function LoadingSpinner({
    className,
    size = "md",
    text = "Loading...",
    minHeight = "200px",
    fullScreen = false
}: LoadingSpinnerProps) {
    const containerClasses = cn(
        "flex flex-col items-center justify-center gap-3",
        fullScreen ? "fixed inset-0 bg-background/80 backdrop-blur-sm" : `min-h-[${minHeight}]`
    )

    return (
        <div className={containerClasses}>
            <ReloadIcon
                className={cn(
                    "animate-spin text-muted-foreground",
                    sizeClasses[size],
                    className
                )}
            />
            {text && (
                <p className="text-sm text-muted-foreground animate-pulse">
                    {text}
                </p>
            )}
        </div>
    )
} 