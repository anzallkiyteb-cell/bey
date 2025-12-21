"use client"

import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Clock,
    Search,
    Calendar as CalendarIcon,
    Trash2,
    Filter,
} from "lucide-react"
import { useState, useMemo, useEffect, Suspense } from "react"
import { NotificationBell } from "@/components/notification-bell"
import { gql, useQuery, useMutation } from "@apollo/client"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import { useSearchParams } from "next/navigation"

// GraphQL
const GET_RETARDS_DATA = gql`
  query GetRetardsPageData($date: String, $startDate: String, $endDate: String) {
    personnelStatus {
      user {
        id
        username
        role
        departement
        photo
      }
    }
    getRetards(date: $date, startDate: $startDate, endDate: $endDate) {
      id
      user_id
      username
      date
      reason
    }
  }
`

const ADD_RETARD = gql`
  mutation AddRetard($user_id: ID!, $date: String!, $reason: String) {
    addRetard(user_id: $user_id, date: $date, reason: $reason) {
      id
      date
    }
  }
`

const DELETE_RETARD = gql`
  mutation DeleteRetard($id: ID!) {
    deleteRetard(id: $id)
  }
`

function RetardsPageContent() {
    // Range Selection
    // Range Selection (Logical Today)
    const getLogicalNow = () => {
        const d = new Date();
        if (d.getHours() < 4) {
            d.setDate(d.getDate() - 1);
        }
        return d;
    };
    const logicalNow = getLogicalNow();

    const [range, setRange] = useState<DateRange | undefined>({
        from: logicalNow,
        to: logicalNow,
    })

    const searchParams = useSearchParams()
    const [selectedDept, setSelectedDept] = useState("all")
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")

    useEffect(() => {
        const s = searchParams.get("search")
        if (s) setSearchQuery(s)
    }, [searchParams])
    const [selectedUser, setSelectedUser] = useState<any | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    // Form State
    const [formDate, setFormDate] = useState("")
    const [formTime, setFormTime] = useState("")
    const [reason, setReason] = useState("")

    const { data, loading, error, refetch } = useQuery(GET_RETARDS_DATA, {
        variables: {
            startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
            endDate: range?.to ? format(range.to, 'yyyy-MM-dd') : (range?.from ? format(range.from, 'yyyy-MM-dd') : null),
        },
        // pollInterval removed
        fetchPolicy: "cache-and-network"
    });

    const [addRetard] = useMutation(ADD_RETARD, { onCompleted: () => refetch() });
    const [deleteRetard] = useMutation(DELETE_RETARD, { onCompleted: () => refetch() });

    const employees = useMemo(() => {
        if (!data?.personnelStatus) return [];
        return data.personnelStatus.map((p: any) => p.user);
    }, [data]);

    const departments = useMemo(() => {
        const depts = new Set(employees.map((e: any) => e.departement).filter(Boolean));
        return Array.from(depts) as string[];
    }, [employees]);

    const filteredRecords = useMemo(() => {
        let records = data?.getRetards || [];

        return records.filter((r: any) => {
            const user = employees.find((e: any) => String(e.id) === String(r.user_id));
            const deptMatch = selectedDept === "all" || user?.departement === selectedDept;
            const searchMatch = !searchQuery ||
                r.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.reason?.toLowerCase().includes(searchQuery.toLowerCase());
            return deptMatch && searchMatch;
        }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [data, employees, selectedDept, searchQuery]);

    const handleAddClick = () => {
        setDialogOpen(true);
        setSelectedUser(null);
        setFormDate(range?.from ? format(range.from, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
        setFormTime(format(new Date(), 'HH:mm'));
        setReason("");
    }

    const handleSave = async () => {
        if (!selectedUser || !formDate || !formTime) return
        const dateTimeStr = `${formDate}T${formTime}:00`;

        try {
            await addRetard({
                variables: {
                    user_id: selectedUser.id,
                    date: dateTimeStr,
                    reason: reason
                }
            });
            setDialogOpen(false);
        } catch (e) {
            console.error(e);
            alert("Erreur");
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer ce retard ?")) return;
        try {
            await deleteRetard({ variables: { id } });
        } catch (e) { console.error(e); }
    }

    return (
        <div className="flex h-screen overflow-hidden flex-col bg-[#f8f6f1] lg:flex-row">
            <Sidebar />
            <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 h-full">
                {/* Header */}
                <div className="border-b border-[#c9b896] bg-white p-6 sm:p-8 lg:p-10 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#8b5a2b]">
                                Retards
                            </h1>
                            <p className="text-base sm:text-lg text-[#6b5744] flex items-center gap-2">
                                <Clock className="h-5 w-5 opacity-70" />
                                {range?.from ? (
                                    range.to ? (
                                        <>Du <span className="font-bold">{format(range.from, "d MMMM", { locale: fr })}</span> au <span className="font-bold">{format(range.to, "d MMMM yyyy", { locale: fr })}</span></>
                                    ) : (
                                        <>Le <span className="font-bold">{format(range.from, "d MMMM yyyy", { locale: fr })}</span></>
                                    )
                                ) : "Sélectionnez une période"}
                            </p>
                        </div>
                        <NotificationBell />
                    </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-10 space-y-8">

                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
                        {/* LEFT: Beautiful Calendar Card */}
                        <Card className="border-[#c9b896] bg-white p-4 shadow-xl xl:col-span-1 rounded-2xl">
                            <div className="flex flex-col items-center">
                                <Calendar
                                    mode="range"
                                    selected={range}
                                    onSelect={setRange}
                                    locale={fr}
                                    className="scale-105"
                                />
                                <div className="mt-4 w-full pt-4 border-t border-[#c9b896]/30 flex justify-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-[#8b5a2b] hover:bg-[#8b5a2b]/10 font-bold"
                                        onClick={() => setRange({ from: new Date(), to: new Date() })}
                                    >
                                        Aujourd'hui
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* RIGHT: Filters and Actions */}
                        <div className="xl:col-span-3 space-y-6">
                            <Card className="border-[#c9b896] bg-white p-6 lg:p-8 shadow-md rounded-2xl">
                                <div className="flex flex-col md:flex-row gap-6 items-end">
                                    <div className="flex-1 space-y-2 w-full">
                                        <Label className="text-[#8b5a2b] font-bold text-sm tracking-wider uppercase flex items-center gap-2">
                                            <Filter className="h-4 w-4" /> Département
                                        </Label>
                                        <select
                                            className="w-full h-12 px-4 rounded-xl border border-[#c9b896] bg-[#f8f6f1] text-[#3d2c1e] text-base focus:ring-2 focus:ring-[#8b5a2b]/20 transition-all outline-none"
                                            value={selectedDept}
                                            onChange={(e) => setSelectedDept(e.target.value)}
                                        >
                                            <option value="all">Tous les départements</option>
                                            {departments.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1 space-y-2 w-full">
                                        <Label className="text-[#8b5a2b] font-bold text-sm tracking-wider uppercase flex items-center gap-2">
                                            <Search className="h-4 w-4" /> Recherche
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Employé ou durée..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="h-12 pl-12 rounded-xl border-[#c9b896] bg-[#f8f6f1] text-base"
                                            />
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8b5a2b] opacity-50" />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleAddClick}
                                        className="h-12 px-8 bg-[#8b5a2b] hover:bg-[#6b4521] text-white rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto"
                                    >
                                        Ajouter Retard
                                    </Button>
                                </div>
                            </Card>

                            {/* Results Table */}
                            <Card className="border-[#c9b896] bg-white shadow-xl rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse table-auto">
                                        <thead>
                                            <tr className="bg-[#f8f6f1] border-b border-[#c9b896]">
                                                <th className="p-3 sm:p-5 font-bold text-[#8b5a2b] text-[10px] sm:text-sm uppercase tracking-widest">Date & Heure</th>
                                                <th className="p-3 sm:p-5 font-bold text-[#8b5a2b] text-[10px] sm:text-sm uppercase tracking-widest">Employé</th>
                                                <th className="p-3 sm:p-5 font-bold text-[#8b5a2b] text-[10px] sm:text-sm uppercase tracking-widest">Durée / Motif</th>
                                                <th className="p-3 sm:p-5 font-bold text-[#8b5a2b] text-[10px] sm:text-sm uppercase tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRecords.map((record: any) => {
                                                const employee = employees.find((e: any) => String(e.id) === String(record.user_id));
                                                return (
                                                    <tr key={record.id} className="border-b border-[#c9b896]/30 hover:bg-[#f8f6f1]/50 transition-colors group">
                                                        <td className="p-2 sm:p-5">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="text-[10px] sm:text-sm font-bold text-[#3d2c1e] bg-[#8b5a2b]/5 py-0.5 px-2 sm:px-3 rounded-full inline-block w-fit border border-[#8b5a2b]/10 whitespace-nowrap">
                                                                    {format(new Date(record.date), "dd/MM/yyyy")}
                                                                </div>
                                                                <div className="text-[9px] sm:text-xs font-medium text-[#6b5744] flex items-center gap-1 mt-0.5 ml-1">
                                                                    <Clock className="h-3 w-3 opacity-60" />
                                                                    {format(new Date(record.date), "HH:mm")}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-2 sm:p-5">
                                                            <div className="flex items-center gap-2 sm:gap-3">
                                                                <div className="h-8 w-8 sm:h-12 sm:w-12 shrink-0 rounded-full border border-[#c9b896]/30 overflow-hidden bg-[#f8f6f1] flex items-center justify-center shadow-inner">
                                                                    {employee?.photo ? (
                                                                        <img src={employee.photo} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="text-[#8b5a2b] font-bold text-[10px] sm:text-sm">{record.username?.charAt(0)}</span>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-bold text-[#3d2c1e] text-xs sm:text-lg truncate tracking-tight uppercase">{record.username}</div>
                                                                    <div className="text-[8px] sm:text-xs font-bold text-[#8b5a2b] uppercase tracking-tighter opacity-60 truncate">
                                                                        {employee?.departement || "..."}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-2 sm:p-5">
                                                            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 sm:px-4 py-1 rounded-full text-[9px] sm:text-[11px] font-black uppercase tracking-widest shadow-sm inline-block">
                                                                {record.reason || "Retard"}
                                                            </span>
                                                        </td>
                                                        <td className="p-2 sm:p-5 text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all h-8 w-8 sm:h-10 sm:w-10"
                                                                onClick={() => handleDelete(record.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {filteredRecords.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-20 text-center space-y-4">
                                                        <div className="flex flex-col items-center justify-center opacity-30">
                                                            <Clock className="h-16 w-16 mb-2" />
                                                            <p className="text-xl font-bold italic">Aucun retard trouvé</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="bg-white border-[#c9b896] max-w-lg rounded-3xl p-8">
                        <DialogHeader><DialogTitle className="text-2xl font-bold text-[#8b5a2b]">Ajouter un retard</DialogTitle></DialogHeader>
                        <div className="space-y-6 py-6">
                            <div className="space-y-4">
                                <Label className="text-[#8b5a2b] font-bold">Choisir l'employé</Label>
                                <div className="flex items-center gap-4 p-3 bg-[#f8f6f1] rounded-2xl border border-[#c9b896]/30">
                                    <div className="h-12 w-12 rounded-xl bg-[#8b5a2b] flex items-center justify-center text-white font-black overflow-hidden shadow-md">
                                        {selectedUser?.photo ? <img src={selectedUser.photo} className="h-full w-full object-cover" /> : selectedUser?.username?.charAt(0) || "?"}
                                    </div>
                                    <select className="flex-1 h-12 bg-transparent outline-none text-[#3d2c1e] font-bold"
                                        onChange={(e) => setSelectedUser(employees.find((em: any) => em.id === e.target.value))}
                                        value={selectedUser?.id || ""}>
                                        <option value="">Sélectionner un employé...</option>
                                        {employees.sort((a: any, b: any) => a.username.localeCompare(b.username)).map((emp: any) => (
                                            <option key={emp.id} value={emp.id}>{emp.username}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[#8b5a2b] font-bold">Date</Label>
                                    <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#8b5a2b] font-bold">Heure</Label>
                                    <Input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} className="h-12 rounded-xl" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[#8b5a2b] font-bold">Durée / Motif (Ex: 30 min)</Label>
                                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex: 45 min" className="h-12 rounded-xl" />
                            </div>
                            <Button onClick={handleSave} className="w-full h-14 bg-[#8b5a2b] hover:bg-[#6b4521] text-white py-6 rounded-2xl text-lg font-bold shadow-xl transition-all hover:scale-[1.02]">
                                Enregistrer
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}

export default function RetardsPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#f8f6f1]">Chargement...</div>}>
            <RetardsPageContent />
        </Suspense>
    )
}
