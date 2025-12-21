"use client"

import { useEffect, useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Loader2, Radio } from "lucide-react"

interface LiveFeedModalProps {
    isOpen: boolean
    onClose: () => void
    data: any[] // The full employee status list
    startTime: Date | null
}

export function LiveFeedModal({ isOpen, onClose, data, startTime }: LiveFeedModalProps) {
    const [events, setEvents] = useState<any[]>([])

    // Filter events based on startTime
    // We effectively "watch" the data prop for changes
    const liveEvents = useMemo(() => {
        if (!startTime || !data) return [];

        return data.filter(emp => {
            if (!emp.lastPunch) return false;
            const punchTime = new Date(emp.lastPunch);
            // Add a small buffer or strict comparison? >= likely fine.
            // We only want punches that happened AFTER the session started.
            return punchTime >= startTime;
        }).sort((a, b) => new Date(b.lastPunch).getTime() - new Date(a.lastPunch).getTime()); // Newest first
    }, [data, startTime]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-white border-[#c9b896] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-[#8b5a2b]">
                        <Radio className="h-6 w-6 animate-pulse text-red-600" />
                        <DialogTitle className="font-[family-name:var(--font-heading)] text-2xl">
                            Flux de Pointage en Direct
                        </DialogTitle>
                    </div>
                    <DialogDescription>
                        Affichage des entrées et sorties en temps réel depuis {startTime?.toLocaleTimeString('fr-FR')}.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto mt-4 pr-2">
                    {liveEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-[#6b5744] opacity-70">
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            <p>En attente de nouveaux pointages...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {liveEvents.map((emp) => {
                                // Determine if In or Out based on state (heuristic)
                                // If "Connecté", it was an Entry (likely). If "Terminé", it was an Exit (likely).
                                // Actually, lastPunch is the *latest* action.
                                // But we don't strictly know if that specific punch was IN or OUT from the aggregated status unless 
                                // we look at clockIn/clockOut pairing.
                                // Status "Connecté" -> Last action was IN.
                                // Status "Terminé" -> Last action was OUT.
                                // Status "Non Connecté" -> Should not happen if they have a new punch (unless they punched only once and logic failed?)

                                const isEntry = emp.status === "Connecté";
                                const punchTime = new Date(emp.lastPunch).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                                return (
                                    <div key={emp.id} className="flex items-center justify-between p-4 rounded-lg bg-[#faf8f5] border border-[#e8e0d5] animate-in slide-in-from-left-2 fade-in duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-2 w-2 rounded-full ${isEntry ? "bg-emerald-500" : "bg-blue-500"}`} />
                                            <div>
                                                <div className="font-bold text-[#3d2c1e] text-lg uppercase">{emp.name}</div>
                                                <div className="flex items-center gap-2 text-sm text-[#6b5744]">
                                                    <span>{emp.department}</span>
                                                    <span className="text-[#c9b896]">•</span>
                                                    <span className="font-medium text-[#8b5a2b]">{emp.shift}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-mono text-[#8b5a2b] font-bold">{punchTime}</div>
                                            <div className={`text-xs font-semibold uppercase tracking-wider ${isEntry ? "text-emerald-700" : "text-blue-700"}`}>
                                                {isEntry ? "Entrée" : "Sortie"}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
