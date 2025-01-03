import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"
import { Header } from "./components/Header"
import "./globals.css"

export const metadata: Metadata = {
    title: "AI Models & Providers",
    description: "Browse and compare AI models and providers",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen bg-background font-sans antialiased">
                <ThemeProvider defaultTheme="system">
                    <Header />
                    <main className="container py-6 px-4">
                        {children}
                    </main>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    )
} 