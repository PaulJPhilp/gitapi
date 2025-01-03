import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import Link from "next/link"

export function Header() {
    return (
        <header className="border-b">
            <div className="container flex h-14 items-center justify-between px-4">
                <Link href="/" passHref>
                    <Button variant="ghost" size="icon" className="mr-2">
                        <Home className="h-5 w-5" />
                    </Button>
                </Link>
                <ThemeToggle />
            </div>
        </header>
    )
} 