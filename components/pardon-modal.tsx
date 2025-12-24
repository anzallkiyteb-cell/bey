"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Clock, ShieldAlert } from "lucide-react"

interface PardonModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    employee: {
        name: string
        delay: string | null
        infraction: number | null
        remarque: string | null
        clockIn: string
    } | null
}

export function PardonModal({ isOpen, onClose, onConfirm, employee }: PardonModalProps) {
    if (!employee) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] bg-white border-[#c9b896] p-0 overflow-hidden">
                <div className="bg-[#8b5a2b] p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-[family-name:var(--font-heading)] flex items-center gap-2">
                            Détails du Retard
                        </DialogTitle>
                        <DialogDescription className="text-amber-100/80">
                            Examen du retard de {employee.name}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-4">
                    {/* Delay Info */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <div className="bg-amber-100 p-2 rounded-lg text-amber-700">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-amber-800 uppercase tracking-wider">Temps de Retard</div>
                            <div className="text-2xl font-black text-amber-900">
                                {employee.delay || "0 min"}
                            </div>
                            <div className="text-xs text-amber-700/70 mt-1">Pointage enregistré à {employee.clockIn}</div>
                        </div>
                    </div>

                    {/* Infraction Info */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-rose-50 border border-rose-200">
                        <div className="bg-rose-100 p-2 rounded-lg text-rose-700">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-rose-800 uppercase tracking-wider">Infraction Appliquée</div>
                            <div className="text-2xl font-black text-rose-900">
                                {employee.infraction ? `-${employee.infraction} TND` : "0 TND"}
                            </div>
                        </div>
                    </div>

                    {/* Remarque */}
                    {employee.remarque && (
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Observation / Remarque</div>
                            <p className="text-sm text-gray-700 italic">"{employee.remarque}"</p>
                        </div>
                    )}

                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                            En pardonnant ce retard, le pointage d'entrée sera ajusté à l'heure réglementaire du shift et l'infraction sera annulée pour aujourd'hui.
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-gray-50 border-t border-gray-100 flex gap-2">
                    <Button variant="outline" onClick={onClose} className="flex-1 border-gray-300">
                        Annuler
                    </Button>
                    <Button
                        onClick={() => {
                            if (confirm(`Êtes-vous sûr de vouloir pardonner ${employee.name} ?`)) {
                                onConfirm();
                            }
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        PARDONNER
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
