"use client"

import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  BookOpen,
  AlertTriangle,
  Gift,
  Award,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Calendar as CalendarIcon,
  Plus,
  ArrowLeft,
  Save,
  Trash2,
  Filter,
  History,
  Pencil,
  UserCheck,
  Loader2,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useState, useMemo, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { NotificationBell } from "@/components/notification-bell"
import { gql, useQuery, useMutation } from "@apollo/client"
import { startOfMonth, endOfMonth, format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { getCurrentUser } from "@/lib/mock-data"

// GraphQL Queries & Mutations
const GET_NOTEBOOK_DATA = gql`
  query GetNotebookData($startDate: String, $endDate: String) {
    personnelStatus {
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
      clockIn
      clockOut
      state
      shift
      lastPunch
    }
    getRetards(startDate: $startDate, endDate: $endDate) {
      id
      user_id
      username
      date
      reason
    }
    getAbsents(startDate: $startDate, endDate: $endDate) {
      id
      user_id
      username
      date
      type
      reason
    }
    getExtras(startDate: $startDate, endDate: $endDate) {
      id
      user_id
      username
      montant
      date_extra
      motif
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

const ADD_EXTRA = gql`
  mutation AddExtra($user_id: ID!, $montant: Float!, $date_extra: String!, $motif: String) {
    addExtra(user_id: $user_id, montant: $montant, date_extra: $date_extra, motif: $motif) {
      id
      date_extra
    }
  }
`

const DELETE_EXTRA = gql`
  mutation DeleteExtra($id: ID!) {
    deleteExtra(id: $id)
  }
`

const UPDATE_RETARD = gql`
  mutation UpdateRetard($id: ID!, $reason: String!) {
    updateRetard(id: $id, reason: $reason) {
      id
      reason
    }
  }
`

const UPDATE_ABSENT = gql`
  mutation UpdateAbsent($id: ID!, $type: String, $reason: String) {
    updateAbsent(id: $id, type: $type, reason: $reason) {
      id
      type
      reason
    }
  }
`

const UPDATE_EXTRA = gql`
  mutation UpdateExtra($id: ID!, $montant: Float, $motif: String) {
    updateExtra(id: $id, montant: $montant, motif: $motif) {
      id
      montant
      motif
    }
  }
`

type NoteType = "infraction" | "extra" | "prime" | "mise_a_pied" | "absent_justifie" | "absent_non_justifie" | "retard" | "present"

interface NotebookEntry {
  id: string
  userId: string
  type: NoteType
  date: string
  time: string
  price?: number
  createdAt: string
  notes?: string
  isPersisted?: boolean
}

interface User {
  id: string
  name: string
  role: string
  department: string
  zktecoId: string
  email: string
  phone: string
  cin: string
  status: string
  photo: string
}

const noteTypes: { type: NoteType; label: string; icon: typeof AlertTriangle; color: string; bgColor: string }[] = [
  { type: "infraction", label: "Infraction", icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50 border-red-200 hover:bg-red-100" },
  { type: "extra", label: "Extra", icon: Gift, color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
  { type: "prime", label: "Prime", icon: Award, color: "text-amber-600", bgColor: "bg-amber-50 border-amber-200 hover:bg-amber-100" },
  { type: "mise_a_pied", label: "Mise à pied", icon: Ban, color: "text-gray-700", bgColor: "bg-gray-100 border-gray-300 hover:bg-gray-200" },
  { type: "absent_justifie", label: "Absent justifié", icon: CheckCircle, color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200 hover:bg-blue-100" },
  { type: "absent_non_justifie", label: "Absent non justifié", icon: XCircle, color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200 hover:bg-orange-100" },
  { type: "retard", label: "Retard", icon: Clock, color: "text-purple-600", bgColor: "bg-purple-50 border-purple-200 hover:bg-purple-100" },
  { type: "present", label: "Présent (Manuel)", icon: UserCheck, color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
]

export default function NotebookPage() {
  return (
    <Suspense fallback={<div className="p-10 text-[#8b5a2b]">Chargement...</div>}>
      <NotebookContent />
    </Suspense>
  )
}

function NotebookContent() {
  const currentUser = getCurrentUser()
  const isAdmin = currentUser?.role === 'admin'
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDept, setSelectedDept] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [selectedNoteType, setSelectedNoteType] = useState<NoteType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState("")
  const [price, setPrice] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [localEntries, setLocalEntries] = useState<NotebookEntry[]>([])
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ price: "", notes: "", type: "" })
  const [isSaving, setIsSaving] = useState(false)
  const searchParams = useSearchParams()
  const userIdParam = searchParams.get("userId")
  const showHistoryParam = searchParams.get("showHistory")

  // Smart Filtering by Month
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());

  const { data, loading, error, refetch } = useQuery(GET_NOTEBOOK_DATA, {
    variables: {
      startDate: format(currentMonthStart, "yyyy-MM-dd"),
      endDate: format(currentMonthEnd, "yyyy-MM-dd"),
    },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-and-network"
  });

  const [addRetard] = useMutation(ADD_RETARD, { onCompleted: () => refetch() });
  const [deleteRetard] = useMutation(DELETE_RETARD, { onCompleted: () => refetch() });
  const [addAbsent] = useMutation(ADD_ABSENT, { onCompleted: () => refetch() });
  const [deleteAbsent] = useMutation(DELETE_ABSENT, { onCompleted: () => refetch() });
  const [addExtra] = useMutation(ADD_EXTRA, { onCompleted: () => refetch() });
  const [deleteExtra] = useMutation(DELETE_EXTRA, { onCompleted: () => refetch() });
  const [updateRetardMutation] = useMutation(UPDATE_RETARD, { onCompleted: () => { refetch(); setEditingEntryId(null); } });
  const [updateAbsentMutation] = useMutation(UPDATE_ABSENT, { onCompleted: () => { refetch(); setEditingEntryId(null); } });
  const [updateExtraMutation] = useMutation(UPDATE_EXTRA, { onCompleted: () => { refetch(); setEditingEntryId(null); } });

  const employees: User[] = useMemo(() => {
    if (!data?.personnelStatus) return [];
    return data.personnelStatus.map((p: any) => ({
      id: p.user.id,
      name: p.user.username,
      role: p.user.role || "user",
      department: p.user.departement || "Non assigné",
      zktecoId: p.user.zktime_id?.toString() || "",
      email: p.user.email || "",
      phone: p.user.phone || "",
      cin: p.user.cin || "",
      status: p.user.status || "active",
      photo: p.user.photo || ""
    }));
  }, [data]);

  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department).filter(Boolean));
    return Array.from(depts) as string[];
  }, [employees]);

  useEffect(() => {
    if (userIdParam && employees.length > 0) {
      const user = employees.find(e => e.id === userIdParam)
      if (user) {
        setSelectedUser(user)
        setDialogOpen(true)
        if (showHistoryParam === "true" && isAdmin) {
          setStep(3)
        }
      }
    }
  }, [userIdParam, showHistoryParam, employees])

  const allEntries: NotebookEntry[] = useMemo(() => {
    const dbEntries: NotebookEntry[] = [];
    if (data?.getRetards) {
      data.getRetards.forEach((r: any) => {
        const dateObj = new Date(r.date);
        dbEntries.push({
          id: `retard-${r.id}`, userId: r.user_id, type: "retard",
          date: dateObj.toISOString().split('T')[0],
          time: dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          createdAt: r.date, notes: r.reason, isPersisted: true
        });
      });
    }
    if (data?.getAbsents) {
      data.getAbsents.forEach((a: any) => {
        const dateObj = new Date(a.date);
        let type: NoteType = "absent_non_justifie";
        if (a.type === 'Justifié') type = 'absent_justifie';
        if (a.type === 'Mise à pied') type = 'mise_a_pied';
        if (a.type === 'Présent') type = 'present';

        dbEntries.push({
          id: `absent-${a.id}`, userId: a.user_id,
          type: type,
          date: format(dateObj, 'yyyy-MM-dd'),
          time: dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          createdAt: a.date, notes: a.reason, isPersisted: true
        });
      });
    }
    if (data?.getExtras) {
      data.getExtras.forEach((e: any) => {
        const dateObj = new Date(e.date_extra);
        const motifLower = e.motif?.toLowerCase() || "";
        let type: NoteType = "extra";
        if (motifLower.includes("infraction")) type = "infraction";
        else if (motifLower.includes("prime")) type = "prime";

        dbEntries.push({
          id: `extra-${e.id}`, userId: e.user_id, type: type,
          date: dateObj.toISOString().split('T')[0],
          time: dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          createdAt: e.date_extra, notes: e.motif, isPersisted: true,
          price: e.montant
        });
      });
    }
    return dbEntries
      .filter(e => isAdmin || e.type === "infraction")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data]);

  // Filtered lists for the main page
  const filteredEmployees = useMemo(() => {
    let filtered = employees;
    if (selectedDept !== "all") filtered = filtered.filter(emp => emp.department === selectedDept);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => e.name.toLowerCase().includes(query) || e.department.toLowerCase().includes(query));
    }
    return filtered;
  }, [employees, searchQuery, selectedDept]);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
    setStep(0);
    setSelectedNoteType(null);
    setSelectedDate(new Date());
    setSelectedTime(new Date().toTimeString().slice(0, 5));
    setPrice("");
    setNotes("");
  }

  const handleNoteTypeClick = (type: NoteType) => {
    setSelectedNoteType(type);
    setStep(2);
  }

  const handleSave = async () => {
    if (!selectedUser || !selectedNoteType || !selectedDate || !selectedTime || isSaving) return
    setIsSaving(true)
    const dateTimeStr = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`;
    try {
      if (selectedNoteType === 'retard') {
        await addRetard({ variables: { user_id: selectedUser.id, date: dateTimeStr, reason: notes } });
      } else if (selectedNoteType === 'absent_justifie' || selectedNoteType === 'absent_non_justifie' || selectedNoteType === 'mise_a_pied' || selectedNoteType === 'present') {
        let type = 'Non justifié';
        if (selectedNoteType === 'absent_justifie') type = 'Justifié';
        if (selectedNoteType === 'mise_a_pied') type = 'Mise à pied';
        if (selectedNoteType === 'present') type = 'Présent';

        await addAbsent({ variables: { user_id: selectedUser.id, date: dateTimeStr, type: type, reason: notes || (selectedNoteType === 'present' ? 'Présent (Manuel)' : `${price} jours`) } });
      } else if (selectedNoteType === 'infraction' || selectedNoteType === 'extra' || selectedNoteType === 'prime') {
        let amt = parseFloat(price || "0");
        let label = "Extra";
        if (selectedNoteType === 'infraction') label = "Infraction";
        if (selectedNoteType === 'prime') label = "Prime";

        await addExtra({
          variables: {
            user_id: selectedUser.id,
            montant: amt,
            date_extra: dateTimeStr,
            motif: notes ? `${label}: ${notes}` : label
          }
        });
      }
      setDialogOpen(false);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  }

  const handleDeleteEntry = async (entry: NotebookEntry) => {
    if (!confirm("Supprimer ?")) return;
    if (entry.isPersisted) {
      if (!isAdmin && entry.type !== "infraction") {
        alert("Action non autorisée.");
        return;
      }
      if (entry.type === 'retard') await deleteRetard({ variables: { id: entry.id.replace('retard-', '') } });
      else if (entry.type.startsWith('absent') || entry.type === 'mise_a_pied') await deleteAbsent({ variables: { id: entry.id.replace('absent-', '') } });
      else await deleteExtra({ variables: { id: entry.id.replace('extra-', '') } });
    }
  }

  return (
    <div className="flex h-screen overflow-hidden flex-col bg-[#f8f6f1] lg:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 h-full">
        {/* Header */}
        <div className="border-b border-[#c9b896] bg-white p-4 sm:p-6 lg:p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#8b5a2b]">Reclamations</h1>
              <p className="text-sm font-medium text-[#6b5744] opacity-70">Enregistrement des événements : {format(new Date(), "MMMM yyyy", { locale: fr })}</p>
            </div>

            <div className="flex items-center gap-4">
              {/* SMART ENTRY LIST TRIGGER */}
              {isAdmin && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="relative border-[#8b5a2b] text-[#8b5a2b] hover:bg-[#8b5a2b]/10 font-bold px-4 rounded-xl h-12 shadow-sm transition-all flex items-center gap-2">
                      <History className="h-5 w-5" />
                      <span className="hidden sm:inline">Activités Récentes</span>
                      {allEntries.length > 0 && (
                        <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center border-2 border-white animate-pulse">
                          {allEntries.length}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md bg-[#f8f6f1] border-l-[#c9b896] p-0 overflow-hidden flex flex-col">
                    <SheetHeader className="p-6 bg-white border-b border-[#c9b896] shadow-sm">
                      <SheetTitle className="text-xl font-bold text-[#8b5a2b] flex items-center gap-2">
                        <Clock className="h-6 w-6" /> Historique du Mois
                      </SheetTitle>
                      <p className="text-xs text-[#6b5744] font-medium uppercase tracking-widest">{format(new Date(), "MMMM yyyy", { locale: fr })}</p>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {allEntries.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 p-20 text-center">
                          <History className="h-20 w-20 mb-4" />
                          <p className="font-bold italic">Aucune activité ce mois-ci</p>
                        </div>
                      ) : (
                        allEntries.map((entry) => {
                          const typeInfo = noteTypes.find(n => n.type === entry.type);
                          const user = employees.find(u => u.id == entry.userId);
                          return (
                            <Card key={entry.id} className="border-[#c9b896]/50 bg-white p-4 shadow-sm group">
                              <div className="flex items-center justify-between gap-3">
                                <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-[#c9b896]/20 bg-[#f8f6f1] flex items-center justify-center">
                                  {user?.photo ? (
                                    <img src={user.photo} alt={user?.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <span className="font-bold text-[#8b5a2b] text-sm">{user?.name?.charAt(0)}</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#3d2c1e] text-sm truncate">{user?.name || "???"}</span>
                                    <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded border shadow-xs", typeInfo?.color, typeInfo?.bgColor)}>
                                      {typeInfo?.label}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px] text-[#6b5744] mt-1.5 opacity-70">
                                    <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {format(new Date(entry.date), "dd/MM/yyyy")}</span>
                                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {entry.time}</span>
                                    {entry.price && <span className="font-bold text-[#8b5a2b]">{entry.price} DT</span>}
                                  </div>
                                  {entry.notes && <p className="text-[11px] italic text-[#6b5744] mt-1 line-clamp-1">{entry.notes}</p>}
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry)} className="h-8 w-8 text-rose-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </Card>
                          )
                        })
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              )}

              <NotificationBell />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          {/* SEARCH AND DEPT */}
          <Card className="p-4 border-[#c9b896] bg-white shadow-md rounded-2xl">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8b5a2b] opacity-40" />
                <Input
                  placeholder="Rechercher un membre par nom..."
                  className="pl-12 h-14 border-[#c9b896] bg-[#f8f6f1] rounded-xl text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto px-2">
                <Filter className="h-5 w-5 text-[#8b5a2b]" />
                <select
                  className="h-14 px-6 rounded-xl border border-[#c9b896] bg-white text-[#3d2c1e] text-sm font-bold focus:ring-2 focus:ring-[#8b5a2b]/20 outline-none min-w-[200px] shadow-sm"
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                >
                  <option value="all">Tous Départements</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </Card>

          {/* EMPLOYEES GRID */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-20">
            {filteredEmployees.map((employee) => (
              <Card
                key={employee.id}
                onClick={() => handleUserClick(employee)}
                className="border-[#c9b896] bg-white p-1 hover:shadow-2xl transition-all cursor-pointer group rounded-2xl overflow-hidden active:scale-95"
              >
                <div className="p-5 flex items-center gap-4 bg-white rounded-[calc(1rem-2px)]">
                  <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-gradient-to-tr from-[#8b5a2b] to-[#c9b896] flex items-center justify-center text-white font-black text-2xl shadow-lg transform group-hover:rotate-3 transition-transform overflow-hidden border border-[#c9b896]/20">
                    {employee.photo ? (
                      <img src={employee.photo} alt={employee.name} className="h-full w-full object-cover" />
                    ) : (
                      employee.name?.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-[#3d2c1e] text-lg truncate group-hover:text-[#8b5a2b] transition-colors uppercase tracking-tight">{employee.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-black uppercase text-[#6b5744] opacity-60 bg-[#f8f6f1] px-2 py-0.5 rounded border border-[#c9b896]/20">{employee.department}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* DIALOG */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-white border-[#c9b896] text-[#3d2c1e] max-w-[95vw] sm:max-w-lg rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-8 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-[#8b5a2b] flex items-center gap-3">
                <BookOpen className="h-8 w-8" />
                {step === 0 ? "Que voulez-vous faire ?" :
                  step === 1 ? "Quel événement ?" :
                    step === 3 ? "Historique des notes" :
                      `Détails : ${noteTypes.find(n => n.type === selectedNoteType)?.label || ""}`}
              </DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <div className="flex items-center gap-4 p-4 bg-[#f8f6f1]/50 rounded-2xl border border-[#c9b896]/30 mt-4">
                <div className="h-12 w-12 rounded-xl bg-[#8b5a2b] flex items-center justify-center text-white font-black shadow-md overflow-hidden border border-[#c9b896]/20">
                  {selectedUser.photo ? (
                    <img src={selectedUser.photo} alt={selectedUser.name} className="h-full w-full object-cover" />
                  ) : (
                    selectedUser.name?.charAt(0)
                  )}
                </div>
                <div>
                  <p className="font-black text-[#3d2c1e] text-lg leading-tight uppercase">{selectedUser.name}</p>
                  <p className="text-xs font-bold text-[#6b5744] uppercase tracking-widest opacity-60">{selectedUser.department}</p>
                </div>
              </div>
            )}

            {step === 0 ? (
              <div className="grid grid-cols-1 gap-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-4 p-6 rounded-2xl border-2 border-[#8b5a2b] bg-white hover:bg-[#8b5a2b]/5 transition-all text-[#8b5a2b]"
                >
                  <div className="h-12 w-12 rounded-xl bg-[#8b5a2b] flex items-center justify-center text-white">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div className="text-left font-black uppercase tracking-tighter text-lg">Ajouter un événement</div>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setStep(3)}
                    className="flex items-center gap-4 p-6 rounded-2xl border-2 border-[#c9b896] bg-white hover:bg-[#f8f6f1] transition-all text-[#3d2c1e]"
                  >
                    <div className="h-12 w-12 rounded-xl bg-[#c9b896] flex items-center justify-center text-white">
                      <History className="h-6 w-6" />
                    </div>
                    <div className="text-left font-black uppercase tracking-tighter text-lg">Voir l'historique</div>
                  </button>
                )}
              </div>
            ) : step === 1 ? (
              <div className="space-y-4 mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setStep(0)}
                  className="text-[#8b5a2b] font-black uppercase text-[10px] tracking-widest gap-2 h-8 px-0 hover:bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4" /> Retour
                </Button>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {noteTypes
                    .filter(nt => isAdmin || nt.type === "infraction")
                    .map(({ type, label, icon: Icon, color, bgColor }) => (
                      <button key={type} onClick={() => handleNoteTypeClick(type)} className={cn("flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 shadow-sm", bgColor)}>
                        <Icon className={cn("h-6 w-6 sm:h-8 sm:w-8", color)} />
                        <span className={cn("text-[9px] sm:text-xs font-black uppercase tracking-tight text-center leading-tight", color)}>{label}</span>
                      </button>
                    ))}
                </div>
              </div>
            ) : step === 3 ? (
              <div className="space-y-6 mt-6">
                <Button variant="ghost" onClick={() => setStep(0)} className="text-[#8b5a2b] font-black uppercase text-xs gap-2"><ArrowLeft className="h-4 w-4" /> Retour</Button>
                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                  {allEntries.filter(e => e.userId === selectedUser?.id).length > 0 ? (
                    allEntries.filter(e => e.userId === selectedUser?.id).map((entry) => (
                      <div key={entry.id} className={cn(
                        "p-5 rounded-[2rem] border transition-all duration-300",
                        editingEntryId === entry.id
                          ? "border-[#8b5a2b] bg-[#8b5a2b]/5 shadow-inner scale-[1.01]"
                          : "border-[#c9b896]/30 bg-white hover:border-[#c9b896] hover:shadow-lg"
                      )}>
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className={cn(
                              "h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0",
                              noteTypes.find(n => n.type === entry.type)?.bgColor
                            )}>
                              {(() => {
                                const info = noteTypes.find(n => n.type === entry.type);
                                const Icon = info?.icon || BookOpen;
                                return <Icon className={cn("h-7 w-7", info?.color || "text-[#8b5a2b]")} />;
                              })()}
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-black text-[#3d2c1e] text-lg uppercase tracking-tight leading-none">
                                {noteTypes.find(n => n.type === entry.type)?.label}
                              </h4>
                              <div className="flex items-center gap-3 text-[11px] text-[#6b5744] font-bold opacity-70">
                                <span className="flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" /> {format(new Date(entry.date), "dd/MM/yyyy")}</span>
                                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {entry.time}</span>
                              </div>
                              {(!editingEntryId || editingEntryId !== entry.id) && entry.notes ? (
                                <p className="text-xs text-[#8b5a2b] font-medium italic mt-1 bg-[#f8f6f1] px-2 py-1 rounded-lg inline-block">{entry.notes}</p>
                              ) : null}
                            </div>
                          </div>

                          {!editingEntryId || editingEntryId !== entry.id ? (
                            <div className="flex flex-col items-end gap-2">
                              {entry.price && (
                                <div className="bg-[#8b5a2b] text-white px-3 py-1 rounded-full text-xs font-black shadow-sm">
                                  {entry.price} {entry.type === 'mise_a_pied' ? 'JOURS' : 'DT'}
                                </div>
                              )}
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => {
                                    if (!isAdmin && entry.type !== "infraction") return;
                                    setEditingEntryId(entry.id);
                                    setEditForm({
                                      price: entry.price?.toString() || "",
                                      notes: entry.notes || "",
                                      type: entry.type === 'absent_justifie' ? 'Justifié' : (entry.type === 'mise_a_pied' ? 'Mise à pied' : (entry.type === 'present' ? 'Présent' : 'Injustifié'))
                                    });
                                  }}
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-blue-500 hover:bg-blue-50 rounded-xl"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={async () => {
                                    if (!confirm("Supprimer ?")) return;
                                    const id = entry.id.split('-')[1];
                                    if (entry.type === 'retard') await deleteRetard({ variables: { id } });
                                    else if (entry.type === 'extra' || entry.type === 'infraction' || entry.type === 'prime') await deleteExtra({ variables: { id } });
                                    else await deleteAbsent({ variables: { id } });
                                  }}
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-red-500 hover:bg-red-50 rounded-xl"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {editingEntryId === entry.id && (
                          <div className="mt-5 pt-4 border-t border-[#8b5a2b]/20 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-[#8b5a2b] ml-1">Valeur / Jours</Label>
                                {(entry.type === 'extra' || entry.type === 'infraction' || entry.type === 'prime' || entry.type === 'mise_a_pied') ? (
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      value={editForm.price}
                                      onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                      className="h-11 rounded-2xl border-[#c9b896] bg-white font-black pr-10 text-lg"
                                      placeholder="0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black opacity-40">
                                      {entry.type === 'mise_a_pied' ? "J" : "DT"}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="h-11 px-4 flex items-center bg-[#f8f6f1] rounded-2xl text-[10px] font-black text-[#6b5744] opacity-50 border border-[#c9b896]/30 uppercase">Non editable</div>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-[#8b5a2b] ml-1">Notes / Raison</Label>
                                <Input
                                  value={editForm.notes}
                                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                                  className="h-11 rounded-2xl border-[#c9b896] bg-white font-bold"
                                  placeholder="Détails..."
                                />
                              </div>
                            </div>

                            {(entry.type === 'absent_justifie' || entry.type === 'absent_non_justifie' || entry.type === 'present') && (
                              <div className="bg-white p-2 rounded-2xl border border-[#c9b896]/30 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-[#6b5744] ml-2">État de l'employé:</span>
                                <div className="flex bg-[#f8f6f1] p-1 rounded-xl gap-1">
                                  <button
                                    onClick={() => setEditForm({ ...editForm, type: 'Justifié' })}
                                    className={cn(
                                      "px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                                      editForm.type === 'Justifié' ? "bg-blue-600 text-white shadow-md" : "text-[#6b5744] hover:bg-white"
                                    )}
                                  >Justifié</button>
                                  <button
                                    onClick={() => setEditForm({ ...editForm, type: 'Injustifié' })}
                                    className={cn(
                                      "px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                                      editForm.type === 'Injustifié' ? "bg-red-600 text-white shadow-md" : "text-[#6b5744] hover:bg-white"
                                    )}
                                  >Injustifié</button>
                                  <button
                                    onClick={() => setEditForm({ ...editForm, type: 'Présent', notes: '' })}
                                    className={cn(
                                      "px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                                      editForm.type === 'Présent' ? "bg-emerald-600 text-white shadow-md" : "text-[#6b5744] hover:bg-white"
                                    )}
                                  >Présent</button>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-3 justify-end pt-2">
                              <Button
                                variant="ghost"
                                onClick={() => setEditingEntryId(null)}
                                className="h-11 px-6 rounded-2xl text-[#6b5744] font-black uppercase text-[10px] tracking-widest"
                              >Annuler</Button>
                              <Button
                                className="h-11 px-8 rounded-2xl bg-[#8b5a2b] hover:bg-[#6b4521] text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-[#8b5a2b]/20 flex items-center gap-2"
                                disabled={isSaving}
                                onClick={async () => {
                                  if (isSaving) return;
                                  setIsSaving(true);
                                  try {
                                    const rawId = entry.id.split('-')[1];
                                    if (entry.type === 'retard') {
                                      await updateRetardMutation({ variables: { id: rawId, reason: editForm.notes } });
                                    } else if (entry.type === 'extra' || entry.type === 'infraction' || entry.type === 'prime') {
                                      await updateExtraMutation({ variables: { id: rawId, montant: parseFloat(editForm.price), motif: editForm.notes || entry.type } });
                                    } else if (entry.type.startsWith('absent') || entry.type === 'mise_a_pied' || entry.type === 'present') {
                                      let finalPrice = (entry.type === 'mise_a_pied' || entry.type === 'present') ? (editForm.price.includes('jour') ? editForm.price : `${editForm.price} jours`) : editForm.notes;
                                      await updateAbsentMutation({ variables: { id: rawId, type: editForm.type, reason: finalPrice } });
                                    }
                                  } catch (e) {
                                    console.error(e);
                                    alert("Erreur lors de la mise à jour");
                                  } finally {
                                    setIsSaving(false);
                                  }
                                }}
                              >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isSaving ? "Enregistrement..." : "Enregistrer"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center opacity-30">
                      <History className="h-12 w-12 mx-auto mb-2" />
                      <p className="font-black uppercase text-xs">Aucun historique</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6 mt-6">
                <Button variant="ghost" onClick={() => setStep(1)} className="text-[#8b5a2b] font-black uppercase text-xs gap-2"><ArrowLeft className="h-4 w-4" /> Retour</Button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-[#8b5a2b]">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left h-12 rounded-xl border-[#c9b896] bg-white text-[#3d2c1e]">
                          <CalendarIcon className="mr-2 h-4 w-4 text-[#8b5a2b]" />
                          {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : "Choisir une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2"><Label className="font-bold text-[#8b5a2b]">Heure</Label><Input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="h-12 rounded-xl" /></div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-[#8b5a2b]">
                    {selectedNoteType === 'mise_a_pied' ? "Nombre de jours" : "Action / Prix (Optionnel)"}
                  </Label>
                  <div className="relative">
                    <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder={selectedNoteType === 'mise_a_pied' ? "1" : "0.00"} className="h-14 rounded-xl pr-12 font-black text-lg" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-[#8b5a2b]">
                      {selectedNoteType === 'mise_a_pied' ? "JOURS" : "DT"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2"><Label className="font-bold text-[#8b5a2b]">Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Raisons, détails..." className="h-14 rounded-xl" /></div>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full h-16 bg-[#8b5a2b] hover:bg-[#6b4521] text-white rounded-2xl text-xl font-black shadow-xl tracking-widest uppercase flex items-center justify-center gap-3"
                >
                  {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : null}
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
