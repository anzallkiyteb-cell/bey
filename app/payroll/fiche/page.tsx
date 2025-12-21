"use client"

import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, User, ChevronRight } from "lucide-react"
import { useState, useMemo } from "react"
import { gql, useQuery } from "@apollo/client"
import Link from "next/link"
import { NotificationBell } from "@/components/notification-bell"

const GET_USERS = gql`
  query GetUsers {
    personnelStatus {
      user {
        id
        username
        departement
        role
        status
        zktime_id
        photo
      }
    }
  }
`

export default function FicheDePaiePage() {
    const { data, loading, error } = useQuery(GET_USERS)
    const [searchTerm, setSearchTerm] = useState("")

    const users = useMemo(() => {
        if (!data?.personnelStatus) return []
        return data.personnelStatus
            .map((p: any) => p.user)
            .filter((u: any) => u.role !== "admin")
            .filter((u: any) =>
                u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.departement?.toLowerCase().includes(searchTerm.toLowerCase())
            )
    }, [data, searchTerm])

    if (error) return (
        <div className="flex h-screen bg-[#f8f6f1]">
            <Sidebar />
            <main className="flex-1 p-10 text-red-600 font-bold">
                Erreur de chargement: {error.message}
            </main>
        </div>
    )

    return (
        <div className="flex h-screen overflow-hidden flex-col bg-[#f8f6f1] lg:flex-row">
            <Sidebar />
            <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
                <div className="border-b border-[#c9b896] bg-white p-6 sm:p-8 lg:p-10 shadow-sm">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#8b5a2b]">
                                Fiches de Paie
                            </h1>
                            <p className="mt-2 text-base sm:text-lg lg:text-xl text-[#6b5744]">
                                Sélectionnez un employé pour voir sa fiche détaillée
                            </p>
                        </div>
                        <NotificationBell />
                    </div>
                </div>

                <div className="p-6 sm:p-8 lg:p-10">
                    <div className="mb-8 relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8b5a2b]/50" />
                        <Input
                            placeholder="Rechercher un employé..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 bg-white border-[#c9b896] focus:border-[#8b5a2b] h-12 text-lg rounded-xl shadow-sm"
                        />
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center p-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b5a2b]"></div>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {users.map((user: any) => (
                                <Link key={user.id} href={`/payroll/fiche/${user.id}`}>
                                    <Card className="group border-[#c9b896] bg-white p-6 shadow-md hover:shadow-xl transition-all cursor-pointer hover:border-[#8b5a2b] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="h-6 w-6 text-[#8b5a2b]" />
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#8b5a2b] to-[#a0522d] flex items-center justify-center text-white shadow-md overflow-hidden shrink-0 border border-[#c9b896]/30">
                                                {user.photo ? (
                                                    <img src={user.photo} alt={user.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="h-7 w-7" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-xl text-[#3d2c1e] truncate">{user.username}</h3>
                                                <p className="text-sm text-[#8b5a2b] font-medium">{user.departement || "Non assigné"}</p>
                                                <p className="text-xs text-[#6b5744] mt-1">ID: {user.zktime_id || user.id}</p>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}

                            {users.length === 0 && (
                                <div className="col-span-full py-20 text-center">
                                    <p className="text-xl text-[#6b5744]">Aucun employé trouvé</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
