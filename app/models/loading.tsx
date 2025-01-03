import { MainNav } from "../components/nav"

export default function Loading() {
    return (
        <div className="flex flex-col min-h-screen">
            <MainNav />
            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-8">AI Models</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-lg border bg-card p-6 shadow-sm space-y-4"
                        >
                            <div className="space-y-2">
                                <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    {Array.from({ length: 3 }).map((_, j) => (
                                        <div
                                            key={j}
                                            className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"
                                        />
                                    ))}
                                </div>
                                <div className="space-y-1">
                                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
} 