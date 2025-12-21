"use client"

import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Search,
    Calendar as CalendarIcon,
    Trash2,
    Filter,
    Users,
    CheckCircle,
    AlertCircle,
} from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { NotificationBell } from "@/components/notification-bell"
import { StatCard } from "@/components/stat-card"
import { gql, useQuery, useMutation } from "@apollo/client"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"

// GraphQL - Optimized query
const GET_ABSENTS_DATA = gql`
  query GetAbsentsPageData($date: String, $startDate: String, $endDate: String) {
    personnelStatus(date: $date) {
      user {
        id
        username
        role
        departement
        base_salary
        photo
        zktime_id
        is_blocked
        status
      }
    }
    getAbsents(date: $date, startDate: $startDate, endDate: $endDate) {
      id
      user_id
      username
      date
      type
      reason
    }
  }
`

const ADD_ABSENT = gql`
  mutation AddAbsent($user_id: ID!, $date: String!, $type: String!, $reason: String) {
    addAbsent(user_id: $user_id, date: $date, type: $type, reason: $reason) {
      id
      date
    }
  }
`

const DELETE_ABSENT = gql`
  mutation DeleteAbsent($id: ID!) {
    deleteAbsent(id: $id)
  }
`

const SYNC_ATTENDANCE = gql`
    mutation SyncAttendance($date: String) {
      syncAttendance(date: $date)
    }
`

export default function AbsentsPage() {
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

    const [syncAttendance] = useMutation(SYNC_ATTENDANCE);

    const [selectedDept, setSelectedDept] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedUser, setSelectedUser] = useState<any | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    // Form State
    const [formDate, setFormDate] = useState("")
    const [formTime, setFormTime] = useState("")
    const [reason, setReason] = useState("")
    const [type, setType] = useState("Non justifié")

    // Fetch Data - Same optimization as dashboard for instant load
    const { data, refetch } = useQuery(GET_ABSENTS_DATA, {
        variables: {
            date: range?.from ? format(range.from, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
            endDate: range?.to ? format(range.to, 'yyyy-MM-dd') : (range?.from ? format(range.from, 'yyyy-MM-dd') : null),
        },
        pollInterval: 30000,
        fetchPolicy: "cache-first", // Show cached data instantly
        nextFetchPolicy: "cache-and-network", // Then fetch fresh data in background
        notifyOnNetworkStatusChange: false,
    });

    const [addAbsent] = useMutation(ADD_ABSENT, { onCompleted: () => refetch() });
    const [deleteAbsent] = useMutation(DELETE_ABSENT, { onCompleted: () => refetch() });

    // Sync in background like dashboard - doesn't block UI
    useEffect(() => {
        const today = format(new Date(), 'yyyy-MM-dd');
        // Use setTimeout to ensure this doesn't block initial render
        const timer = setTimeout(() => {
            syncAttendance({ variables: { date: today } }).catch(e => console.error("Sync Error:", e));
        }, 100);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    const employees = useMemo(() => {
        if (!data?.personnelStatus) return [];
        return data.personnelStatus.map((p: any) => p.user);
    }, [data]);

    const departments = useMemo(() => {
        const depts = new Set(employees.map((e: any) => e.departement).filter(Boolean));
        return Array.from(depts) as string[];
    }, [employees]);

    const { filteredRecords, stats } = useMemo(() => {
        const abs = [...(data?.getAbsents || [])];

        const filtered = abs.filter((r: any) => {
            const user = employees.find((e: any) => String(e.id) === String(r.user_id));

            // IGNORE ADMINS AND BLOCKED FOR CONSISTENCY WITH DASHBOARD
            if (!user || user.role === 'admin' || user.is_blocked) return false;

            const deptMatch = selectedDept === "all" || user?.departement === selectedDept;
            const searchMatch = !searchQuery ||
                r.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.reason?.toLowerCase().includes(searchQuery.toLowerCase());
            return deptMatch && searchMatch;
        }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const total = filtered.length;
        const justified = filtered.filter((r: any) => r.type === 'Justifié').length;
        const unjustified = total - justified;

        return {
            filteredRecords: filtered,
            stats: { total, justified, unjustified }
        };
    }, [data, employees, selectedDept, searchQuery]);

    const handleAddClick = () => {
        setDialogOpen(true);
        setSelectedUser(null);
        setFormDate(range?.from ? format(range.from, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
        setFormTime("08:00");
        setReason("");
        setType("Non justifié");
    }

    const handleSave = async () => {
        if (!selectedUser || !formDate) return
        const dateTimeStr = `${formDate}T${formTime || "00:00"}:00`;

        try {
            await addAbsent({
                variables: {
                    user_id: selectedUser.id,
                    date: dateTimeStr,
                    type: type,
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
        if (!confirm(`Supprimer cette absence ?`)) return;
        try {
            await deleteAbsent({ variables: { id } });
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
                                Absences
                            </h1>
                            <p className="text-base sm:text-lg text-[#6b5744] flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 opacity-70" />
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

                <div className="p-6 sm:p-8 lg:p-10 space-y-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            title="Total Absences"
                            value={stats.total}
                            icon={Users}
                            color="bronze"
                            change="sur la période"
                        />
                        <StatCard
                            title="Justifiées"
                            value={stats.justified}
                            icon={CheckCircle}
                            color="copper"
                            change={`${stats.total > 0 ? Math.round((stats.justified / stats.total) * 100) : 0}% du total`}
                            trend="up"
                        />
                        <StatCard
                            title="Non Justifiées"
                            value={stats.unjustified}
                            icon={AlertCircle}
                            color="bronze"
                            change={`${stats.total > 0 ? Math.round((stats.unjustified / stats.total) * 100) : 0}% à traiter`}
                            trend="down"
                        />
                    </div>

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
                                                placeholder="Nom de l'employé..."
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
                                        Ajouter Absence
                                    </Button>
                                </div>
                            </Card>

                            {/* Results Table */}
                            <Card className="border-[#c9b896] bg-white shadow-xl rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#f8f6f1] border-b border-[#c9b896]">
                                                <th className="p-5 font-bold text-[#8b5a2b] text-sm uppercase tracking-widest">Date</th>
                                                <th className="p-5 font-bold text-[#8b5a2b] text-sm uppercase tracking-widest">Employé</th>
                                                <th className="p-5 font-bold text-[#8b5a2b] text-sm uppercase tracking-widest">Type</th>
                                                <th className="p-5 font-bold text-[#8b5a2b] text-sm uppercase tracking-widest">Motif</th>
                                                <th className="p-5 font-bold text-[#8b5a2b] text-sm uppercase tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRecords.map((record: any) => (
                                                <tr key={record.id} className="border-b border-[#c9b896]/30 hover:bg-[#f8f6f1]/50 transition-colors group">
                                                    <td className="p-5">
                                                        <div className="text-sm font-bold text-[#3d2c1e] bg-[#8b5a2b]/5 py-1 px-3 rounded-full inline-block">
                                                            {format(new Date(record.date), "dd/MM/yyyy")}
                                                        </div>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="font-bold text-[#3d2c1e] text-lg">{record.username}</div>
                                                        <div className="text-xs font-medium text-[#6b5744] uppercase tracking-tighter opacity-70">
                                                            {employees.find((e: any) => String(e.id) === String(record.user_id))?.departement}
                                                        </div>
                                                    </td>
                                                    <td className="p-5">
                                                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${record.type === 'Justifié'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-rose-50 text-rose-700 border-rose-200'
                                                            }`}>
                                                            {record.type}
                                                        </span>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="text-sm italic text-[#6b5744] max-w-[200px] truncate">
                                                            {record.reason || "—"}
                                                        </div>
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                                            onClick={() => handleDelete(record.id)}
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredRecords.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-20 text-center space-y-4">
                                                        <div className="flex flex-col items-center justify-center opacity-30">
                                                            <CalendarIcon className="h-16 w-16 mb-2" />
                                                            <p className="text-xl font-bold italic">Aucune absence trouvée</p>
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

                {/* Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="bg-white border-[#c9b896] max-w-lg rounded-3xl p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-[#8b5a2b]">Ajouter une absence</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-6">
                            <div className="space-y-2">
                                <Label className="text-[#8b5a2b] font-bold">Choisir l'employé</Label>
                                <select className="w-full h-12 p-3 border border-[#c9b896] rounded-xl bg-[#f8f6f1] outline-none focus:ring-2 focus:ring-[#8b5a2b]/20"
                                    onChange={(e) => setSelectedUser(employees.find((em: any) => em.id === e.target.value))}
                                    value={selectedUser?.id || ""}>
                                    <option value="">Sélectionner...</option>
                                    {employees.sort((a: any, b: any) => a.username.localeCompare(b.username)).map((emp: any) => (
                                        <option key={emp.id} value={emp.id}>{emp.username}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[#8b5a2b] font-bold">Date</Label>
                                    <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#8b5a2b] font-bold">Heure (Appox)</Label>
                                    <Input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} className="h-12 rounded-xl" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[#8b5a2b] font-bold">Statut de l'absence</Label>
                                <div className="flex gap-4 p-4 bg-[#f8f6f1] rounded-xl border border-[#c9b896]/30">
                                    <label className="flex items-center gap-3 cursor-pointer flex-1 justify-center py-2 rounded-lg hover:bg-white transition-all">
                                        <input type="radio" value="Non justifié" checked={type === "Non justifié"} onChange={() => setType("Non justifié")} className="accent-[#8b5a2b]" />
                                        <span className="text-sm font-bold text-rose-700">Non justifié</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer flex-1 justify-center py-2 rounded-lg hover:bg-white transition-all">
                                        <input type="radio" value="Justifié" checked={type === "Justifié"} onChange={() => setType("Justifié")} className="accent-[#8b5a2b]" />
                                        <span className="text-sm font-bold text-emerald-700">Justifié</span>
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[#8b5a2b] font-bold">Motif / Commentaire</Label>
                                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Indiquez la raison..." className="h-12 rounded-xl" />
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