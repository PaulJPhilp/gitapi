import { MainNav } from "./components/nav"

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <MainNav />
            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-8">Welcome to Git API Explorer</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-6 border rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Releases</h2>
                        <p className="text-gray-600 mb-4">
                            Explore and track major releases of your favorite repositories
                        </p>
                    </div>
                    <div className="p-6 border rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Models</h2>
                        <p className="text-gray-600 mb-4">
                            Browse available AI models and their capabilities
                        </p>
                    </div>
                    <div className="p-6 border rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Providers</h2>
                        <p className="text-gray-600 mb-4">
                            Manage your AI provider connections and settings
                        </p>
                    </div>
                    <div className="p-6 border rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Prompts</h2>
                        <p className="text-gray-600 mb-4">
                            Create and manage your AI prompts for consistent interactions
                        </p>
                    </div>
                    <div className="p-6 border rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Prompt Runs</h2>
                        <p className="text-gray-600 mb-4">
                            View and analyze the history of your prompt executions
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
} 