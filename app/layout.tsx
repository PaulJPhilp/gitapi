import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"
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
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
} 