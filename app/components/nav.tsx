import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function MainNav() {
    return (
        <div className="border-b border-tfl-grey">
            <div className="flex h-16 items-center px-4 bg-white dark:bg-tfl-dark-grey">
                <div className="flex items-center space-x-4 flex-1">
                    <Link
                        href="/"
                        className="font-bold text-tfl-blue hover:text-tfl-red transition-colors"
                    >
                        Git API Explorer
                    </Link>
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
                    </nav>
                </div>
                <ThemeToggle />
            </div>
        </div>
    )
} 