import type React from "react"
import type { Metadata, Viewport } from "next"
// Use system fonts locally to avoid external font requests during dev
import "./globals.css"

// Intentionally not using `next/font/google` in dev to prevent external
// font requests (fonts.gstatic.com) which can fail in restricted networks.
// The app uses CSS variables and Tailwind's `font-sans` as a safe fallback.

export const metadata: Metadata = {
  title: "Business Bey l'aouina - Gestion des Employés",
  description: "Restaurant & Café de Luxe - Plateforme de Gestion des Employés",
  generator: "v0.app",
  icons: {
    icon: "/images/logo.jpeg",
    apple: "/images/logo.jpeg",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#8b5a2b",
}

import { Providers } from "@/components/providers"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
