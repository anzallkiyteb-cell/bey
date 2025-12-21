"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { gql, useLazyQuery } from "@apollo/client"
import { Loader2 } from "lucide-react"

const GET_USER_HISTORY = gql`
  query GetUserHistory($userId: ID!, $startDate: String!, $endDate: String!) {
    userAttendanceHistory(userId: $userId, startDate: $startDate, endDate: $endDate) {
      date
      clockIn
      clockOut
      raw_punches
      shift
    }
  }
`

interface AttendanceHistoryModalProps {
    userId: string | null
    userName: string
    isOpen: boolean
    onClose: () => void
}

export function AttendanceHistoryModal({ userId, userName, isOpen, onClose }: AttendanceHistoryModalProps) {
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    // Default to current month/week or recent range
    useEffect(() => {
        if (isOpen) {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 7); // Last 7 days by default
            setEndDate(end.toISOString().split("T")[0]);
            setStartDate(start.toISOString().split("T")[0]);
        }
    }, [isOpen]);

    const [getHistory, { data, loading, error }] = useLazyQuery(GET_USER_HISTORY, {
        fetchPolicy: "network-only"
    });

    useEffect(() => {
        if (userId && startDate && endDate && isOpen) {
            getHistory({ variables: { userId, startDate, endDate } });
        }
    }, [userId, startDate, endDate, isOpen, getHistory]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] bg-white border-[#c9b896]">
                <DialogHeader>
                    <DialogTitle className="text-[#8b5a2b] font-[family-name:var(--font-heading)] text-2xl">
                        Historique de {userName}
                    </DialogTitle>
                    <DialogDescription>
                        Consultez les pointages sur une période donnée (Journée logique 05h-05h).
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-4 items-end my-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="start">Du</Label>
                        <Input
                            type="date"
                            id="start"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-[#faf8f5] border-[#c9b896]"
                        />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="end">Au</Label>
                        <Input
                            type="date"
                            id="end"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-[#faf8f5] border-[#c9b896]"
                        />
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[#8b5a2b]" />
                    </div>
                )}

                {error && (
                    <div className="p-4 text-red-600 bg-red-50 rounded">
                        Erreur: {error.message}
                    </div>
                )}

                {!loading && data && (
                    <div className="border border-[#c9b896] rounded-md overflow-hidden max-h-[400px] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#f8f6f1] border-b border-[#c9b896]">
                                <tr>
                                    <th className="p-3 text-left font-medium text-[#6b5744]">Date</th>
                                    <th className="p-3 text-left font-medium text-[#6b5744]">Entrée</th>
                                    <th className="p-3 text-left font-medium text-[#6b5744]">Sortie</th>
                                    <th className="p-3 text-left font-medium text-[#6b5744]">Shift</th>
                                    <th className="p-3 text-left font-medium text-[#6b5744]">Détails (Raw)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e8e0d5]">
                                {data.userAttendanceHistory.map((record: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-[#fcfbf9]">
                                        <td className="p-3 text-[#3d2c1e]">{record.date}</td>
                                        <td className="p-3 font-medium text-emerald-700">{record.clockIn || "-"}</td>
                                        <td className="p-3 font-medium text-blue-700">{record.clockOut || "-"}</td>
                                        <td className="p-3 text-[#3d2c1e] font-semibold">{record.shift || "-"}</td>
                                        <td className="p-3 text-xs text-gray-500">
                                            {record.raw_punches?.join(', ') || ""}
                                        </td>
                                    </tr>
                                ))}
                                {data.userAttendanceHistory.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-gray-500">Aucune donnée sur cette période</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

            </DialogContent>
        </Dialog>
    )
}
