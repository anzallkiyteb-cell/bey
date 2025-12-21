"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getCurrentUser } from "@/lib/mock-data"

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAuth = () => {
            const user = getCurrentUser()
            const isLoginPage = pathname === "/login"

            if (isLoginPage) {
                if (user) {
                    // Already logged in, redirect to dashboard
                    router.replace("/")
                } else {
                    // Not logged in, allowed to see login page
                    setIsAuthorized(true)
                }
            } else {
                if (!user) {
                    // Not logged in, redirect to login
                    router.replace("/login")
                    setIsAuthorized(false)
                } else {
                    // Logged in, allowed to see page
                    // (Can add role-based checks here later if specific pages need protection)
                    setIsAuthorized(true)
                }
            }
            setIsLoading(false)
        }

        checkAuth()

        const handleUserChange = () => {
            checkAuth()
        }

        window.addEventListener("userChanged", handleUserChange)
        return () => window.removeEventListener("userChanged", handleUserChange)
    }, [pathname, router])

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#f8f6f1]">
                {/* Simple Loading Spinner matching theme */}
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#c9b896] border-t-[#8b5a2b]"></div>
            </div>
        )
    }

    // If we are not authorized and strictly not on login page (double check), don't render
    if (!isAuthorized && pathname !== "/login") return null

    return <>{children}</>
}
