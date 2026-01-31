"use client"

import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Calendar as CalendarIcon,
    Users,
    Sun,
    Moon,
    ShieldAlert,
    Coffee,
    LayoutGrid,
    Table as TableIcon,
    ChevronRight,
    User as UserIcon,
    Layers,
    Search,
    ChevronDown,
    Clock,
    ArrowRight,
    Edit3,
    Book,
    Save,
    Loader2,
    Info,
    MoreVertical,
    Maximize2
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, useMemo, useRef, useEffect } from "react"
import { gql, useQuery, useMutation } from "@apollo/client"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import React from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const GET_ALL_SCHEDULES = gql`
  query GetAllSchedules {
    getAllSchedules {
      user_id
      username
      dim
      lun
      mar
      mer
      jeu
      ven
      sam
      departement
      photo
      is_coupure
      is_fixed
      p1_in
      p1_out
      p2_in
      p2_out
      fixed_in
      fixed_out
      dim_in
      dim_out
      lun_in
      lun_out
      mar_in
      mar_out
      mer_in
      mer_out
      jeu_in
      jeu_out
      ven_in
      ven_out
      sam_in
      sam_out
    }
  }
`

const UPDATE_USER_SCHEDULE = gql`
  mutation UpdateUserSchedule($userId: ID!, $schedule: ScheduleInput!) {
    updateUserSchedule(userId: $userId, schedule: $schedule) {
      user_id
      username
      dim
      lun
      mar
      mer
      jeu
      ven
      sam
      is_coupure
      is_fixed
      p1_in
      p1_out
      p2_in
      p2_out
      fixed_in
      fixed_out
      dim_in
      dim_out
      lun_in
      lun_out
      mar_in
      mar_out
      mer_in
      mer_out
      jeu_in
      jeu_out
      ven_in
      ven_out
      sam_in
      sam_out
    }
  }
`

const DAYS = [
    { key: "lun", label: "Lundi", short: "Lun" },
    { key: "mar", label: "Mardi", short: "Mar" },
    { key: "mer", label: "Mercredi", short: "Mer" },
    { key: "jeu", label: "Jeudi", short: "Jeu" },
    { key: "ven", label: "Vendredi", short: "Ven" },
    { key: "sam", label: "Samedi", short: "Sam" },
    { key: "dim", label: "Dimanche", short: "Dim" },
]

const SHIFT_OPTIONS = [
    { value: "Matin", label: "Matin", icon: Sun, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", iconBg: "bg-amber-100" },
    { value: "Soir", label: "Soir", icon: Moon, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", iconBg: "bg-blue-100" },
    { value: "Doublage", label: "Doublage", icon: ShieldAlert, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", iconBg: "bg-purple-100" },
    { value: "Repos", label: "Repos", icon: Coffee, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", iconBg: "bg-emerald-100" },
    { value: null, label: "Non configuré", icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", iconBg: "bg-red-100" },
]

export default function AllSchedulesPlacementPage() {
    const { data, loading, error, refetch } = useQuery(GET_ALL_SCHEDULES)
    const [updateSchedule] = useMutation(UPDATE_USER_SCHEDULE)

    const [searchQuery, setSearchQuery] = useState("")
    const searchParams = useSearchParams()
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [isCompact, setIsCompact] = useState(true)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [showDetailDialog, setShowDetailDialog] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
    const [highlightUserId, setHighlightUserId] = useState<string | null>(null)
    const [detailFormData, setDetailFormData] = useState<any>({
        is_coupure: false,
        is_fixed: false,
        fixed_in: "08:00",
        fixed_out: "17:00",
        p1_in: "08:00",
        p1_out: "12:00",
        p2_in: "14:00",
        p2_out: "18:00",
        dim_in: "08:00", dim_out: "17:00",
        lun_in: "08:00", lun_out: "17:00",
        mar_in: "08:00", mar_out: "17:00",
        mer_in: "08:00", mer_out: "17:00",
        jeu_in: "08:00", jeu_out: "17:00",
        ven_in: "08:00", ven_out: "17:00",
        sam_in: "08:00", sam_out: "17:00",
    })
    const longPressTimer = useRef<any>(null)

    const schedules = data?.getAllSchedules || []

    const filteredSchedules = useMemo(() => {
        if (!searchQuery) return schedules
        return schedules.filter((s: any) =>
            s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.departement || "").toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [schedules, searchQuery])

    const depts = useMemo(() => {
        const list = new Set(
            filteredSchedules
                .map((s: any) => s.departement || "Non assigné")
                .filter((d: string) => d.toLowerCase() !== "autre")
        )

        const ORDER = [
            "serveur",
            "comi_serveur",
            "bar",
            "chef_cuisine",
            "cuisine",
            "patisserie",
            "pizzaria",
            "chicha",
            "menage_matin",
            "menage_soir",
            "gestion_stock",
            "responsable",
            "securite",
            "non assigné"
        ];

        return Array.from(list).sort((a: any, b: any) => {
            const aIdx = ORDER.indexOf(a.toLowerCase());
            const bIdx = ORDER.indexOf(b.toLowerCase());

            if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
            if (aIdx !== -1) return -1;
            if (bIdx !== -1) return 1;

            return a.localeCompare(b);
        })
    }, [filteredSchedules])

    const autoOpenDone = useRef<string | null>(null);

    useEffect(() => {
        const uId = searchParams.get('userId');
        if (uId && schedules.length > 0 && autoOpenDone.current !== uId) {
            const emp = schedules.find((s: any) => s.user_id === uId);
            if (emp) {
                autoOpenDone.current = uId;
                handleEmployeeClick(emp);
                setHighlightUserId(uId);

                // Scroll to the user after a short delay to allow DOM to settle
                setTimeout(() => {
                    const el = document.getElementById(`user-${uId}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 500);

                const timer = setTimeout(() => {
                    setHighlightUserId(null);
                }, 10000);
                return () => clearTimeout(timer);
            }
        }
    }, [searchParams, schedules]);

    const handleEmployeeClick = (user: any) => {
        if (!user) return;
        setSelectedEmployee(user)

        // Ensure we preserve the existing shift assignments if they exist
        const shifts: any = {};
        DAYS.forEach(day => {
            shifts[day.key] = user[day.key] || "Repos";
        });

        setDetailFormData({
            ...shifts,
            is_coupure: user.is_coupure === true,
            is_fixed: user.is_fixed === true,
            fixed_in: user.fixed_in || "08:00",
            fixed_out: user.fixed_out || "17:00",
            p1_in: user.p1_in || "08:00",
            p1_out: user.p1_out || "12:00",
            p2_in: user.p2_in || "14:00",
            p2_out: user.p2_out || "18:00",
            dim_in: user.dim_in || "08:00", dim_out: user.dim_out || "17:00",
            lun_in: user.lun_in || "08:00", lun_out: user.lun_out || "17:00",
            mar_in: user.mar_in || "08:00", mar_out: user.mar_out || "17:00",
            mer_in: user.mer_in || "08:00", mer_out: user.mer_out || "17:00",
            jeu_in: user.jeu_in || "08:00", jeu_out: user.jeu_out || "17:00",
            ven_in: user.ven_in || "08:00", ven_out: user.ven_out || "17:00",
            sam_in: user.sam_in || "08:00", sam_out: user.sam_out || "17:00",
        })
        setShowDetailDialog(true)
    }

    const handleSaveDetail = async () => {
        if (!selectedEmployee) return
        setIsSaving(true)
        try {
            await updateSchedule({
                variables: {
                    userId: selectedEmployee.user_id,
                    schedule: {
                        dim: detailFormData.dim || "Repos",
                        lun: detailFormData.lun || "Repos",
                        mar: detailFormData.mar || "Repos",
                        mer: detailFormData.mer || "Repos",
                        jeu: detailFormData.jeu || "Repos",
                        ven: detailFormData.ven || "Repos",
                        sam: detailFormData.sam || "Repos",
                        is_coupure: detailFormData.is_coupure,
                        is_fixed: detailFormData.is_fixed,
                        p1_in: detailFormData.p1_in,
                        p1_out: detailFormData.p1_out,
                        p2_in: detailFormData.p2_in,
                        p2_out: detailFormData.p2_out,
                        fixed_in: detailFormData.fixed_in,
                        fixed_out: detailFormData.fixed_out,
                        dim_in: detailFormData.dim_in, dim_out: detailFormData.dim_out,
                        lun_in: detailFormData.lun_in, lun_out: detailFormData.lun_out,
                        mar_in: detailFormData.mar_in, mar_out: detailFormData.mar_out,
                        mer_in: detailFormData.mer_in, mer_out: detailFormData.mer_out,
                        jeu_in: detailFormData.jeu_in, jeu_out: detailFormData.jeu_out,
                        ven_in: detailFormData.ven_in, ven_out: detailFormData.ven_out,
                        sam_in: detailFormData.sam_in, sam_out: detailFormData.sam_out,
                    }
                }
            })
            await refetch()
            setShowDetailDialog(false)
        } catch (e) {
            console.error("Update failed", e)
        } finally {
            setIsSaving(false)
        }
    }

    const handleUpdateShift = async (user: any, dayKey: string, newShift: string) => {
        const userId = user.user_id
        setUpdatingId(`${userId}-${dayKey}`)
        setOpenMenuId(null) // Close menu after selection

        const currentSchedule = {
            dim: user.dim,
            lun: user.lun,
            mar: user.mar,
            mer: user.mer,
            jeu: user.jeu,
            ven: user.ven,
            sam: user.sam,
            [dayKey]: newShift
        }

        try {
            await updateSchedule({
                variables: {
                    userId,
                    schedule: currentSchedule
                }
            })
            await refetch()
        } catch (e) {
            console.error("Update failed", e)
        } finally {
            setUpdatingId(null)
        }
    }

    const onLongPressStart = (id: string) => {
        longPressTimer.current = setTimeout(() => {
            setOpenMenuId(id)
            if (navigator && (navigator as any).vibrate) {
                (navigator as any).vibrate(50)
            }
        }, 600)
    }

    const onLongPressEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current)
            longPressTimer.current = null
        }
    }

    if (loading) return (
        <div className="flex h-screen flex-col items-center justify-center bg-[#fbfbfb] gap-4 text-[#8b5a2b]">
            <Loader2 className="h-10 w-10 animate-spin" />
            <span className="font-black animate-pulse uppercase text-[10px] tracking-widest">Initialisation Bey...</span>
        </div>
    )

    return (
        <div className="flex h-screen overflow-hidden flex-col bg-[#fbf9f6] lg:flex-row font-sans">
            <Sidebar />

            <main className="flex-1 overflow-hidden h-full flex flex-col pt-16 lg:pt-0">
                {/* --- ULTRA COMPACT INTELLIGENT HEADER --- */}
                <div className="bg-white border-b border-[#e8dfcf] px-3 py-3 lg:px-6 lg:py-4 shadow-sm relative z-50">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 lg:h-12 lg:w-12 rounded-lg lg:rounded-2xl bg-[#3d2c1e] items-center justify-center shadow-lg shrink-0">
                                <Maximize2 className="h-4 w-4 lg:h-6 lg:w-6 text-[#8b5a2b]" />
                            </div>
                            <div className="flex flex-col tracking-tighter">
                                <h1 className="text-sm lg:text-2xl font-black text-[#3d2c1e] leading-none">
                                    Maître <span className="text-[#8b5a2b]">Placement</span>
                                </h1>
                                <p className="text-[8px] lg:text-[10px] font-bold text-[#8b5a2b]/60 uppercase tracking-widest mt-0.5">
                                    Vue Totale Hebdomadaire
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 lg:gap-4 justify-between md:justify-end">
                            <div className="flex p-0.5 bg-[#f1e9db] rounded-lg border border-[#c9b896]/20 shadow-inner overflow-hidden shrink-0">
                                <Link href="/calendar/all" className="px-2 lg:px-4 py-1.5 rounded-md text-[9px] lg:text-xs font-black transition-all bg-[#8b5a2b] text-white shadow-sm">Touts</Link>
                                <Link href="/schedule" className="px-2 lg:px-4 py-1.5 rounded-md text-[9px] lg:text-xs font-black transition-all text-[#8b5a2b]/40 hover:text-[#8b5a2b]">Créer</Link>
                            </div>

                            <div className="relative group shrink-0">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-[#8b5a2b]/40" />
                                <input
                                    type="text"
                                    placeholder="Nom..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-24 sm:w-48 lg:w-64 h-8 lg:h-10 pl-8 pr-3 rounded-lg bg-[#fbf9f6] border border-[#c9b896]/30 focus:border-[#8b5a2b] outline-none font-bold text-[#3d2c1e] text-[10px] lg:text-xs transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- INTELLIGENT SCROLLABLE VIEW: ALL DAYS IN ONE --- */}
                <div className="flex-1 overflow-auto bg-[#fdfbf9] relative scrollbar-hide select-none transition-all">
                    <table className="w-full border-separate border-spacing-0 table-fixed">
                        <thead className="sticky top-0 z-50">
                            <tr className="bg-[#2d1e12] text-white">
                                <th className="p-1 px-2 lg:p-4 text-left sticky left-0 z-50 bg-[#2d1e12] border-r border-white/10 w-[80px] lg:w-[15%]">
                                    <div className="flex items-center gap-1 lg:gap-2">
                                        <LayoutGrid className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-[#8b5a2b]" />
                                        <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest leading-none">Shift</span>
                                    </div>
                                </th>
                                {DAYS.map(day => (
                                    <th key={day.key} className="p-1 lg:p-4 text-center border-r border-white/5 w-[calc((100%-80px)/7)] lg:w-[12%]">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[8px] lg:text-[11px] font-black uppercase tracking-tighter whitespace-nowrap">{day.label}</span>
                                            <span className="text-[7px] font-bold opacity-30 mt-0.5">{day.short}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {depts.map((dept: any) => (
                                <React.Fragment key={dept}>
                                    <tr className="bg-[#f3ead8] relative z-40">
                                        <td colSpan={8} className="p-2 lg:p-3 sticky left-0 z-40 bg-[#f3ead8] border-b border-[#d4c5a9]">
                                            <div className="flex items-center gap-2">
                                                <Layers className="h-3 w-3 text-[#8b5a2b]" />
                                                <span className="text-[10px] lg:text-xs font-black text-[#3d2c1e] uppercase tracking-tighter truncate">{dept}</span>
                                            </div>
                                        </td>
                                    </tr>
                                    {SHIFT_OPTIONS.filter(o => o.value !== "Doublage").map(shiftOpt => (
                                        <tr key={`${dept}-${shiftOpt.value}`} className={cn("group transition-colors", shiftOpt.bg, "hover:brightness-[0.98]")}>
                                            {/* Left Header for Shift Name */}
                                            <td className={cn(
                                                "p-1.5 lg:p-3 sticky left-0 z-30 border-r transition-colors shadow-sm",
                                                shiftOpt.bg, shiftOpt.border, "border-b-[3px] border-[#618774]"
                                            )}>
                                                <div className={cn("flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2", shiftOpt.color)}>
                                                    <shiftOpt.icon className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                                                    <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-tighter leading-none">{shiftOpt.label}</span>
                                                </div>
                                            </td>

                                            {/* Cells for Days */}
                                            {DAYS.map(day => {
                                                const emps = filteredSchedules.filter((s: any) => {
                                                    const employeeShift = s[day.key];
                                                    const deptMatch = (s.departement || "Autre") === dept;

                                                    if (!deptMatch) return false;

                                                    if (shiftOpt.value === "Matin") {
                                                        return employeeShift === "Matin" || employeeShift === "Doublage";
                                                    }
                                                    if (shiftOpt.value === "Soir") {
                                                        return employeeShift === "Soir" || employeeShift === "Doublage";
                                                    }

                                                    // Default behavior for Repos, etc.
                                                    if (shiftOpt.value === null) return !employeeShift;
                                                    return employeeShift === shiftOpt.value;
                                                })

                                                return (
                                                    <td key={day.key} className={cn("p-0.5 lg:p-2 border-r align-top transition-colors", shiftOpt.border, "border-b-[3px] border-[#618774]")}>
                                                        <div className="flex flex-col gap-0.5 lg:gap-1 min-h-[30px] lg:min-h-[50px]">
                                                            {emps.map((emp: any) => {
                                                                const isUpdating = updatingId?.startsWith(`${emp.user_id}-${day.key}`)
                                                                const actualShift = emp[day.key];
                                                                const isDoublage = actualShift === "Doublage";
                                                                const displayStyle = isDoublage
                                                                    ? SHIFT_OPTIONS.find(o => o.value === "Doublage") || shiftOpt
                                                                    : shiftOpt;

                                                                return (
                                                                    <DropdownMenu
                                                                        key={emp.user_id}
                                                                        open={openMenuId === `${emp.user_id}-${day.key}`}
                                                                        onOpenChange={(open) => {
                                                                            if (!open) setOpenMenuId(null)
                                                                        }}
                                                                    >
                                                                        <DropdownMenuTrigger asChild>
                                                                            <button
                                                                                id={`user-${emp.user_id}`}
                                                                                disabled={isUpdating}
                                                                                onClick={() => handleEmployeeClick(emp)}
                                                                                onPointerDown={() => onLongPressStart(`${emp.user_id}-${day.key}`)}
                                                                                onPointerUp={onLongPressEnd}
                                                                                onPointerLeave={onLongPressEnd}
                                                                                className={cn(
                                                                                    "flex items-center gap-1 lg:gap-2 px-1 lg:px-1.5 py-1 lg:py-1.5 rounded-md lg:rounded-lg transition-all active:scale-95 text-left w-full overflow-hidden border shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
                                                                                    highlightUserId === emp.user_id ? "bg-amber-200 border-amber-500 scale-105 shadow-xl ring-2 ring-amber-400 z-10 animate-pulse" : displayStyle.iconBg,
                                                                                    "hover:shadow-md",
                                                                                    highlightUserId === emp.user_id ? "border-amber-500" : displayStyle.border,
                                                                                    isUpdating && "opacity-50 grayscale cursor-not-allowed"
                                                                                )}
                                                                            >
                                                                                {/* Photo/Avatar */}
                                                                                <div className="h-4 w-4 lg:h-6 lg:w-6 rounded-full bg-white border border-[#c9b896]/30 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                                                                    {emp.photo ? (
                                                                                        <img src={emp.photo} className="h-full w-full object-cover" />
                                                                                    ) : (
                                                                                        <span className="text-[7px] lg:text-[10px] font-black text-[#8b5a2b]">{emp.username.charAt(0)}</span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex flex-col min-w-0">
                                                                                    <span className="text-[7px] lg:text-[10px] font-black text-[#3d2c1e] truncate uppercase tracking-tight leading-none mb-0.5">
                                                                                        {emp.username}
                                                                                    </span>
                                                                                    <span className="hidden lg:block text-[7px] font-bold text-[#8b5a2b]/50 uppercase tracking-widest leading-none">
                                                                                        {emp.departement || "Staff"}
                                                                                    </span>
                                                                                </div>
                                                                                {isUpdating && <Loader2 className="h-2 w-2 lg:h-3 lg:w-3 animate-spin text-[#8b5a2b] ml-auto shrink-0" />}
                                                                            </button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="start" className="rounded-xl border border-[#c9b896]/30 p-1 bg-white shadow-2xl z-[100] w-[140px]">
                                                                            <div className="px-2 py-1 mb-1 bg-[#8b5a2b]/5 rounded-t-lg">
                                                                                <p className="text-[7px] font-black text-[#8b5a2b]/40 uppercase">{day.label}</p>
                                                                                <p className="text-[9px] font-black text-[#3d2c1e] truncate tracking-tight">{emp.username}</p>
                                                                            </div>
                                                                            {SHIFT_OPTIONS.filter(o => o.value !== null).map((opt) => (
                                                                                <DropdownMenuItem
                                                                                    key={opt.value}
                                                                                    onClick={() => handleUpdateShift(emp, day.key, opt.value!)}
                                                                                    className={cn(
                                                                                        "flex items-center gap-2 p-1.5 rounded-lg cursor-pointer font-black text-[9px] uppercase mb-0.5 last:mb-0 transition-all",
                                                                                        opt.iconBg, opt.color, opt.value === shiftOpt.value ? "ring-1 ring-[#8b5a2b] bg-white ring-offset-0 scale-100" : "hover:scale-[1.02] opacity-80 hover:opacity-100"
                                                                                    )}
                                                                                >
                                                                                    <opt.icon className="h-3.5 w-3.5" />
                                                                                    {opt.label}
                                                                                </DropdownMenuItem>
                                                                            ))}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                )
                                                            })}
                                                        </div>
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

            </main>

            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-2xl bg-[#fbf9f6] border-[#c9b896]/30">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-[#3d2c1e] flex items-center gap-3">
                            <Clock className="h-6 w-6 text-[#8b5a2b]" />
                            Configuration Planning: {selectedEmployee?.username}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#8b5a2b]/20">
                        {/* Mode Selection */}
                        <div className="grid grid-cols-3 gap-3">
                            <Button
                                variant={(!detailFormData.is_fixed && !detailFormData.is_coupure) ? "default" : "outline"}
                                onClick={() => setDetailFormData({ ...detailFormData, is_fixed: false, is_coupure: false })}
                                className={cn("h-12 font-bold", (!detailFormData.is_fixed && !detailFormData.is_coupure) && "bg-[#8b5a2b] text-white hover:bg-[#6b4521]")}
                            >
                                Normal
                            </Button>
                            <Button
                                variant={detailFormData.is_coupure ? "default" : "outline"}
                                onClick={() => setDetailFormData({ ...detailFormData, is_coupure: true, is_fixed: false })}
                                className={cn("h-12 font-bold", detailFormData.is_coupure && "bg-[#8b5a2b] text-white hover:bg-[#6b4521]")}
                            >
                                Coupure
                            </Button>
                            <Button
                                variant={detailFormData.is_fixed ? "default" : "outline"}
                                onClick={() => setDetailFormData({ ...detailFormData, is_fixed: true, is_coupure: false })}
                                className={cn("h-12 font-bold", detailFormData.is_fixed && "bg-[#8b5a2b] text-white hover:bg-[#6b4521]")}
                            >
                                Fixe
                            </Button>
                        </div>

                        {/* Mode Coupure Details */}
                        {detailFormData.is_coupure && (
                            <div className="p-4 bg-white rounded-xl border border-[#c9b896]/20 grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase font-bold text-[#8b5a2b]">Début P1</Label>
                                    <Input type="time" value={detailFormData.p1_in} onChange={e => setDetailFormData({ ...detailFormData, p1_in: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase font-bold text-[#8b5a2b]">Fin P1</Label>
                                    <Input type="time" value={detailFormData.p1_out} onChange={e => setDetailFormData({ ...detailFormData, p1_out: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase font-bold text-[#8b5a2b]">Début P2</Label>
                                    <Input type="time" value={detailFormData.p2_in} onChange={e => setDetailFormData({ ...detailFormData, p2_in: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase font-bold text-[#8b5a2b]">Fin P2</Label>
                                    <Input type="time" value={detailFormData.p2_out} onChange={e => setDetailFormData({ ...detailFormData, p2_out: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {/* Mode Fixe Details */}
                        {detailFormData.is_fixed && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="font-bold text-[#3d2c1e]">Planning Hebdomadaire</Label>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        type="button"
                                        className="text-[10px] h-7 bg-[#8b5a2b]/10 text-[#8b5a2b] hover:bg-[#8b5a2b]/20"
                                        onClick={() => {
                                            const firstIn = detailFormData.lun_in || "08:00"
                                            const firstOut = detailFormData.lun_out || "17:00"
                                            setDetailFormData({
                                                ...detailFormData,
                                                dim_in: firstIn, dim_out: firstOut,
                                                lun_in: firstIn, lun_out: firstOut,
                                                mar_in: firstIn, mar_out: firstOut,
                                                mer_in: firstIn, mer_out: firstOut,
                                                jeu_in: firstIn, jeu_out: firstOut,
                                                ven_in: firstIn, ven_out: firstOut,
                                                sam_in: firstIn, sam_out: firstOut,
                                            })
                                        }}
                                    >
                                        Appliquer lundi à tous
                                    </Button>
                                </div>
                                <div className="grid gap-2">
                                    {DAYS.map(day => (
                                        <div key={day.key} className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#c9b896]/10">
                                            <span className="text-xs font-bold w-20">{day.label}</span>
                                            <div className="flex items-center gap-2">
                                                <Input className="h-8 text-xs w-24" type="time" value={detailFormData[`${day.key}_in`]} onChange={e => setDetailFormData({ ...detailFormData, [`${day.key}_in`]: e.target.value })} />
                                                <span className="text-[10px] font-bold text-[#8b5a2b]">à</span>
                                                <Input className="h-8 text-xs w-24" type="time" value={detailFormData[`${day.key}_out`]} onChange={e => setDetailFormData({ ...detailFormData, [`${day.key}_out`]: e.target.value })} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Summary of shift status & Quick Shift Edit */}
                        <div className="p-6 bg-[#fdfaf3] rounded-[32px] border border-[#e8dfcf] shadow-inner relative overflow-hidden">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5a2b]/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 rounded-2xl bg-[#3d2c1e] flex items-center justify-center shadow-2xl shadow-[#3d2c1e]/20 border border-white/10">
                                    <Clock className="h-6 w-6 text-[#8b5a2b]" />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-[15px] font-black uppercase text-[#3d2c1e] tracking-tight leading-none">Matrice des Horaires</h4>
                                    <p className="text-[9px] font-extrabold text-[#8b5a2b]/50 uppercase tracking-[0.3em] mt-1.5">Weekly Shift Orchestrator</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {DAYS.map(day => (
                                    <div key={day.key} className="bg-white/80 backdrop-blur-sm rounded-[24px] border border-[#c9b896]/30 p-1 flex items-center justify-between shadow-sm transition-all hover:border-[#8b5a2b]/50 hover:shadow-[0_8px_24px_rgba(139,90,43,0.08)] group">
                                        <div className="flex items-center gap-3 pl-4">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-[#3d2c1e] uppercase tracking-tighter leading-none">{day.label}</span>
                                                <span className="text-[8px] font-black text-[#8b5a2b]/40 uppercase tracking-[0.2em] mt-1">{day.short}</span>
                                            </div>
                                        </div>

                                        <div className="w-[140px]">
                                            <Select
                                                value={detailFormData[day.key] || "Repos"}
                                                onValueChange={(val) => setDetailFormData({ ...detailFormData, [day.key]: val })}
                                            >
                                                <SelectTrigger className="h-11 text-[11px] font-black bg-[#fbf9f6] border-[#c9b896]/20 focus:ring-0 focus:ring-offset-0 rounded-[20px] px-4 hover:bg-white hover:border-[#8b5a2b]/30 transition-all">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        {(() => {
                                                            const currentShift = SHIFT_OPTIONS.find(o => o.value === (detailFormData[day.key] || "Repos"));
                                                            return currentShift ? (
                                                                <>
                                                                    <div className={cn("p-1 rounded-lg", currentShift.bg)}>
                                                                        <currentShift.icon className={cn("h-3.5 w-3.5 shrink-0", currentShift.color)} />
                                                                    </div>
                                                                    <span className="truncate tracking-tight">{currentShift.label}</span>
                                                                </>
                                                            ) : <SelectValue />;
                                                        })()}
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className="rounded-[24px] border-[#c9b896]/40 shadow-2xl p-2 bg-[#fdfaf3]">
                                                    {SHIFT_OPTIONS.filter(o => o.value !== null).map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value!} className="text-[11px] font-black py-3 rounded-[18px] transition-all cursor-pointer focus:bg-[#8b5a2b] focus:text-white group">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn("p-2 rounded-xl border border-black/5 transition-colors", opt.bg, "group-focus:bg-white/20 group-focus:border-transparent")}>
                                                                    <opt.icon className={cn("h-4 w-4", opt.color, "group-focus:text-white")} />
                                                                </div>
                                                                <span className="tracking-tight uppercase">{opt.label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="bg-white/50 p-4 -mx-6 -mb-6 rounded-b-lg border-t border-[#c9b896]/20">
                        <Button variant="outline" onClick={() => setShowDetailDialog(false)} className="font-bold border-[#c9b896]/50">
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSaveDetail}
                            disabled={isSaving}
                            className="bg-[#8b5a2b] hover:bg-[#6b4521] text-white font-bold min-w-[120px]"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer les modifications"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- INJECTED GLOBAL STYLES FOR TABLE PERFORMANCE --- */}
            <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        table { border-collapse: separate; border-spacing: 0; }
        tbody tr:last-child td { border-bottom: none; }
      `}</style>
        </div>
    )
}
