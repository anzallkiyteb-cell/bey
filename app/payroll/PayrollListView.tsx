
import React, { memo } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PayrollListViewProps {
    summary: any[]
    canSee: (cat: string, key: string) => boolean
    openEmployeePlanning: (user: any) => void
    handlePayUser: (id: string) => void
    payingUser: boolean
    unpayingUser: boolean
    setUnpayTargetId: (id: string) => void
    setUnpayConfirmOpen: (open: boolean) => void
}

export const PayrollListView = memo(function PayrollListView({
    summary,
    canSee,
    openEmployeePlanning,
    handlePayUser,
    payingUser,
    unpayingUser,
    setUnpayTargetId,
    setUnpayConfirmOpen
}: PayrollListViewProps) {
    return (
        <div className="border border-[#c9b896] bg-white shadow-md rounded-lg">
            <div className="overflow-x-auto hidden md:block">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-[#f8f6f1]">
                        <tr>
                            <th className="p-4 text-left font-semibold text-[#6b5744]">Employé</th>
                            {canSee('payroll', 'col_base') && <th className="p-4 text-left font-semibold text-[#6b5744]">Base</th>}
                            {canSee('payroll', 'col_abs_days') && <th className="p-4 text-left font-semibold text-[#6b5744]">Jours Abs</th>}
                            {canSee('payroll', 'col_primes') && <th className="p-4 text-left font-semibold text-[#6b5744]">Primes</th>}
                            {canSee('payroll', 'col_extra') && <th className="p-4 text-left font-semibold text-[#6b5744]">Extra</th>}
                            {canSee('payroll', 'col_doublage') && <th className="p-4 text-left font-semibold text-[#6b5744]">Doublage</th>}
                            {canSee('payroll', 'col_retenues') && <th className="p-4 text-left font-semibold text-[#6b5744]">Retenues</th>}
                            {canSee('payroll', 'col_avance') && <th className="p-4 text-left font-semibold text-[#6b5744]">Avance</th>}
                            {canSee('payroll', 'col_net') && <th className="p-4 text-left font-semibold text-[#6b5744]">Net</th>}
                            {canSee('payroll', 'col_action') && <th className="p-4 text-left font-semibold text-[#6b5744]">Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {summary.map((p: any) => (
                            <tr key={p.userId} id={`payroll-desktop-${p.userId}`} className={cn("border-b border-[#c9b896]/30 hover:bg-[#f8f6f1]/50", p.isPaid && "!bg-green-300 !border-green-500")}>
                                <td className="p-4">
                                    <button
                                        onClick={() => canSee('payroll', 'user_details_modal') && openEmployeePlanning(p)}
                                        className={`flex items-center gap-3 text-left ${!canSee('payroll', 'user_details_modal') ? 'cursor-default opacity-100' : ''}`}
                                        disabled={!canSee('payroll', 'user_details_modal')}
                                    >
                                        <div className="h-10 w-10 rounded-full bg-[#8b5a2b] flex items-center justify-center text-white font-bold overflow-hidden border border-[#c9b896]/30">
                                            {p.user.photo ? (
                                                <img src={p.user.photo} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                p.user.username?.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#3d2c1e]">{p.user.username}</p>
                                            <p className="text-xs text-[#6b5744]">{p.user.departement}</p>
                                        </div>
                                    </button>
                                </td>
                                {canSee('payroll', 'col_base') && <td className="p-4 font-medium text-[#3d2c1e]">{p.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>}
                                {canSee('payroll', 'col_abs_days') && <td className="p-4 text-red-600 font-bold">{p.absentDays}</td>}
                                {canSee('payroll', 'col_primes') && <td className="p-4 text-emerald-600">+{Math.round(p.totalPrimes)}</td>}
                                {canSee('payroll', 'col_extra') && <td className="p-4 text-emerald-600">+{Math.round(p.totalExtras)}</td>}
                                {canSee('payroll', 'col_doublage') && <td className="p-4 text-cyan-600">+{Math.round(p.totalDoublages)}</td>}
                                {canSee('payroll', 'col_retenues') && <td className="p-4 text-red-600">-{Math.round(p.totalInfractions)}</td>}
                                {canSee('payroll', 'col_avance') && <td className="p-4 text-amber-600">-{Math.round(p.totalAdvances)}</td>}
                                {canSee('payroll', 'col_net') && <td className="p-4 font-bold text-lg text-[#3d2c1e]">{p.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DT</td>}
                                {canSee('payroll', 'col_action') && (
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                className={cn(
                                                    "text-white transition-all shadow-sm",
                                                    p.isPaid
                                                        ? "bg-emerald-700/50 hover:bg-emerald-700/60 cursor-default"
                                                        : "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
                                                )}
                                                onClick={() => !p.isPaid && handlePayUser(p.userId)}
                                                disabled={payingUser || unpayingUser}
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" /> {p.isPaid ? "Payé" : "Payer"}
                                            </Button>
                                            {p.isPaid && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-9 w-9 p-0"
                                                    onClick={() => {
                                                        setUnpayTargetId(p.userId)
                                                        setUnpayConfirmOpen(true)
                                                    }}
                                                    disabled={payingUser || unpayingUser}
                                                    title="Annuler le paiement"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="md:hidden space-y-4 p-4">
                {summary.map((p: any) => (
                    <div key={p.userId} id={`payroll-mobile-${p.userId}`} className={cn("bg-white border border-[#c9b896] rounded-xl p-4 shadow-sm flex flex-col gap-3", p.isPaid && "!bg-green-300 !border-green-500")}>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => canSee('payroll', 'user_details_modal') && openEmployeePlanning(p)}
                                className={`flex items-center gap-3 text-left ${!canSee('payroll', 'user_details_modal') ? 'cursor-default' : ''}`}
                                disabled={!canSee('payroll', 'user_details_modal')}
                            >
                                <div className="h-10 w-10 rounded-full bg-[#8b5a2b] flex items-center justify-center text-white font-bold overflow-hidden border border-[#c9b896]/30">
                                    {p.user.photo ? (
                                        <img src={p.user.photo} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        p.user.username?.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-[#3d2c1e]">{p.user.username}</p>
                                    <p className="text-xs text-[#6b5744]">{p.user.departement}</p>
                                </div>
                            </button>
                            {canSee('payroll', 'col_net') && (
                                <div className="text-right">
                                    <p className="text-xs text-[#6b5744]">Net à Payer</p>
                                    <p className="font-bold text-lg text-[#3d2c1e]">{Math.round(p.netSalary)} DT</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs border-t border-[#c9b896]/30 pt-3">
                            <div className="text-center">
                                <p className="text-[#6b5744]">Présence</p>
                                <p className="font-bold text-[#3d2c1e]">{p.presentDays}j</p>
                            </div>
                            {canSee('payroll', 'col_abs_days') && (
                                <div className="text-center">
                                    <p className="text-[#6b5744]">Absence</p>
                                    <p className="font-bold text-red-600">{p.absentDays}j</p>
                                </div>
                            )}
                            <div className="text-center">
                                <p className="text-[#6b5744]">Retards</p>
                                <p className="font-bold text-amber-600">{p.formattedRetard}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {canSee('payroll', 'col_extra') && (
                                <div className="flex justify-between bg-emerald-50 p-2 rounded">
                                    <span className="text-emerald-700">Extra:</span>
                                    <span className="font-bold text-emerald-700">+{Math.round(p.totalExtras)}</span>
                                </div>
                            )}
                            {canSee('payroll', 'col_avance') && (
                                <div className="flex justify-between bg-amber-50 p-2 rounded">
                                    <span className="text-amber-700">Avance:</span>
                                    <span className="font-bold text-amber-700">-{Math.round(p.totalAdvances)}</span>
                                </div>
                            )}
                            {canSee('payroll', 'col_doublage') && (
                                <div className="flex justify-between bg-cyan-50 p-2 rounded">
                                    <span className="text-cyan-700">Doublage:</span>
                                    <span className="font-bold text-cyan-700">+{Math.round(p.totalDoublages)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {canSee('payroll', 'user_details_modal') && (
                                <Button onClick={() => openEmployeePlanning(p)} variant="outline" size="sm" className="flex-1 text-[#8b5a2b] border-[#8b5a2b]">
                                    Voir détails & Planning
                                </Button>
                            )}
                            {canSee('payroll', 'col_action') && (
                                <div className="flex gap-2 w-full">
                                    <Button
                                        size="sm"
                                        className={cn(
                                            "flex-1 text-white truncate",
                                            p.isPaid
                                                ? "bg-emerald-700/50 cursor-default"
                                                : "bg-emerald-600 hover:bg-emerald-700"
                                        )}
                                        onClick={() => !p.isPaid && handlePayUser(p.userId)}
                                        disabled={payingUser || unpayingUser}
                                    >
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> {p.isPaid ? "Payé" : "Payer"}
                                    </Button>
                                    {p.isPaid && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-9 p-0"
                                            onClick={() => {
                                                setUnpayTargetId(p.userId)
                                                setUnpayConfirmOpen(true)
                                            }}
                                            disabled={payingUser || unpayingUser}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
})
