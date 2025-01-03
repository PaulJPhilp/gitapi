import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function MainNav() {
    return (
        <div className="border-b border-tfl-grey">
            <div className="flex h-16 items-center px-4 bg-white dark:bg-tfl-dark-grey">
                <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                        <Link
                            href="/"
                            className="font-bold text-tfl-blue hover:text-tfl-red transition-colors"
                        >
                            Git API Explorer
                        </Link>
                        <ThemeToggle />
                    </div>
                    <nav className="flex items-center space-x-6">
                        <Link href="/releases">
                            <Button variant="nav">Releases</Button>
                        </Link>
                        <Link href="/models">
                            <Button variant="nav">Models</Button>
                        </Link>
                        <Link href="/providers">
                            <Button variant="nav">Providers</Button>
                        </Link>
                        <Link href="/prompts">
                            <Button variant="nav">Prompts</Button>
                        </Link>
                        <Link href="/prompt-runs">
                            <Button variant="nav">Prompt Runs</Button>
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    )
} 