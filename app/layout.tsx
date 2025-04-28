import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/contexts/theme-context"
import { FontSizeProvider } from "@/contexts/font-size-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Investment Banking Dataset Viewer",
  description: "A dataset viewer for investment banking data",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <FontSizeProvider>{children}</FontSizeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
