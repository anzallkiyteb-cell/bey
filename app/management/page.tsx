"use client"

import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Edit, Shield, Save, Plus, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { gql, useQuery, useMutation } from "@apollo/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const GET_MANAGERS = gql`
  query GetLogins {
    getLogins {
      id
      username
      role
      photo
      permissions
    }
  }
`

const UPDATE_ACCOUNT = gql`
  mutation UpdateLoginAccount($id: ID!, $username: String, $password: String, $role: String, $permissions: String) {
    updateLoginAccount(id: $id, username: $username, password: $password, role: $role, permissions: $permissions) {
      id
      username
      role
      permissions
    }
  }
`

const CREATE_ACCOUNT = gql`
  mutation CreateLoginAccount($username: String!, $password: String!, $role: String!, $permissions: String) {
    createLoginAccount(username: $username, password: $password, role: $role, permissions: $permissions) {
      id
      username
      role
      permissions
    }
  }
`

const DELETE_ACCOUNT = gql`
  mutation DeleteLoginAccount($id: ID!) {
    deleteLoginAccount(id: $id)
  }
`

const initialPermissions = {
    sidebar: {
        dashboard: true,
        attendance: true,
        employees: true,
        schedule: true,
        calendar: true,
        payroll: true,
        fiche_payroll: true,
        notebook: true,
        finance: true,
        advances: true,
        retards: true,
        absents: true
    },
    dashboard: {
        total_personnel: true,
        presence_actuelle: true,
        en_retard: true,
        absences: true,
        les_avances: true,
        reste_a_payer: true
    },
    attendance: {
        top_performers: true
    },
    employees: {
        add_employee: true
    },
    payroll: {
        // Stats
        stats_total_base: true,
        stats_avances: true,
        stats_net_global: true,
        stats_extras: true,
        stats_doublages: true,

        // Actions
        action_extra: true,
        action_doublage: true,
        action_rapport: true,

        // Table Columns
        col_employee: true,
        col_base: true,
        col_abs_days: true,
        col_primes: true,
        col_extra: true,
        col_doublage: true,
        col_retenues: true,
        col_avance: true,
        col_net: true,
        col_action: true, // "Payer" button / Details
        user_details_modal: true,
    }
}

export default function ManagementPage() {
    const { data, loading, refetch } = useQuery(GET_MANAGERS, {
        fetchPolicy: "network-only"
    })

    const managers = data?.getLogins || []

    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [permissions, setPermissions] = useState<any>(initialPermissions)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editPassword, setEditPassword] = useState("")
    const [editRole, setEditRole] = useState("manager")
    const [editUsername, setEditUsername] = useState("")
    const [isAddMode, setIsAddMode] = useState(false)

    const [updateAccount] = useMutation(UPDATE_ACCOUNT, {
        onCompleted: (data) => {
            setIsDialogOpen(false)
            refetch()
            alert("Compte mis à jour avec succès")

            // Sync current user session if editing self
            const updatedUser = data?.updateLoginAccount;
            const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('business_bey_user') || 'null') : null;
            if (currentUser && updatedUser && currentUser.username === updatedUser.username) {
                // Update local session
                const newSessionUser = {
                    ...currentUser,
                    name: updatedUser.username,
                    username: updatedUser.username,
                    role: updatedUser.role,
                    permissions: updatedUser.permissions
                };
                localStorage.setItem('business_bey_user', JSON.stringify(newSessionUser));
                window.dispatchEvent(new CustomEvent("userChanged"));
            }
        }
    })

    const [createAccount] = useMutation(CREATE_ACCOUNT, {
        onCompleted: (data) => {
            setIsDialogOpen(false)
            refetch()
            alert("Compte créé avec succès")

            // Sync if matched
            const newUser = data?.createLoginAccount;
            const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('business_bey_user') || 'null') : null;
            if (currentUser && newUser && currentUser.username === newUser.username) {
                const newSessionUser = {
                    ...currentUser,
                    name: newUser.username,
                    username: newUser.username,
                    role: newUser.role,
                    permissions: newUser.permissions
                };
                localStorage.setItem('business_bey_user', JSON.stringify(newSessionUser));
                window.dispatchEvent(new CustomEvent("userChanged"));
            }
        }
    })

    const [deleteAccount] = useMutation(DELETE_ACCOUNT, {
        onCompleted: () => {
            refetch()
            alert("Compte supprimé avec succès")
        }
    })

    const handleOpenPermissions = (user: any) => {
        setIsAddMode(false)
        setSelectedUser(user)
        setEditUsername(user.username)
        setEditRole(user.role)
        setEditPassword("")
        if (user.permissions) {
            try {
                const parsed = JSON.parse(user.permissions);
                setPermissions({
                    ...initialPermissions,
                    ...parsed,
                    sidebar: { ...initialPermissions.sidebar, ...(parsed.sidebar || {}) },
                    dashboard: { ...initialPermissions.dashboard, ...(parsed.dashboard || {}) },
                    attendance: { ...initialPermissions.attendance, ...(parsed.attendance || {}) },
                    employees: { ...initialPermissions.employees, ...(parsed.employees || {}) },
                    payroll: { ...initialPermissions.payroll, ...(parsed.payroll || {}) },
                })
            } catch (e) {
                setPermissions(initialPermissions)
            }
        } else {
            setPermissions(initialPermissions)
        }
        setIsDialogOpen(true)
    }

    const handleOpenAdd = () => {
        setIsAddMode(true)
        setSelectedUser(null)
        setEditUsername("")
        setEditRole("manager")
        setEditPassword("")
        setPermissions(initialPermissions)
        setIsDialogOpen(true)
    }

    const handleSave = () => {
        const variables = {
            id: selectedUser?.id,
            username: editUsername,
            password: editPassword || undefined,
            role: editRole,
            permissions: JSON.stringify(permissions)
        }

        if (isAddMode) {
            if (!editUsername || !editPassword) return alert("Nom d'utilisateur et mot de passe requis")
            createAccount({
                variables: {
                    username: editUsername,
                    password: editPassword,
                    role: editRole,
                    permissions: JSON.stringify(permissions)
                }
            })
        } else {
            updateAccount({
                variables: {
                    id: selectedUser.id,
                    username: editUsername,
                    password: editPassword || undefined,
                    role: editRole,
                    permissions: JSON.stringify(permissions)
                }
            })
        }
    }

    const handleDelete = (id: string, e: any) => {
        e.stopPropagation()
        if (confirm("Êtes-vous sûr de vouloir supprimer ce compte ?")) {
            deleteAccount({ variables: { id } })
        }
    }

    const togglePermission = (category: string, key: string) => {
        setPermissions((prev: any) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: !prev[category][key]
            }
        }))
    }

    if (loading) return <div className="p-10">Chargement...</div>

    return (
        <div className="flex h-screen overflow-hidden flex-col bg-[#f8f6f1] lg:flex-row">
            <Sidebar />
            <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 h-full p-6 lg:p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#8b5a2b]">Gestion des Accès</h1>
                        <p className="text-[#6b5744] mt-2">Configurez les comptes et permissions pour vos gérants.</p>
                    </div>
                    <Button onClick={handleOpenAdd} className="bg-[#8b5a2b] hover:bg-[#6b4521] text-white">
                        <Plus className="mr-2 h-4 w-4" /> Ajouter un Compte
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {managers.map((manager: any) => (
                        <Card
                            key={manager.id}
                            onClick={() => handleOpenPermissions(manager)}
                            className="bg-white p-6 shadow-md hover:shadow-xl transition-all cursor-pointer border border-[#c9b896]/30 group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-[#f8f6f1] border-2 border-[#8b5a2b]/20 overflow-hidden flex items-center justify-center shrink-0">
                                    {manager.photo ? (
                                        <img src={manager.photo} alt={manager.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xl font-bold text-[#8b5a2b]">{manager.username.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-[#3d2c1e] text-lg truncate">{manager.username}</h3>
                                    <p className="text-[#8b5a2b] text-sm font-medium uppercase tracking-wide">{manager.role}</p>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <div className="bg-[#f8f6f1] p-2 rounded-full">
                                        <Edit className="h-5 w-5 text-[#8b5a2b]" />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="p-2 h-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => handleDelete(manager.id, e)}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Permissions Modal */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#faf8f5]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-[#8b5a2b] flex items-center gap-3">
                                <Shield className="h-6 w-6" />
                                {isAddMode ? "Nouvel Accès" : `Modifier Accès - ${selectedUser?.username}`}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-xl border border-[#c9b896]/20 shadow-sm my-4">
                            <div className="space-y-2">
                                <Label className="text-[#3d2c1e] font-bold">Nom d'utilisateur</Label>
                                <Input
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                    placeholder="Ex: admin_bey"
                                    className="bg-[#f8f6f1]/50 border-[#c9b896]/30 focus:border-[#8b5a2b]"
                                    disabled={!isAddMode}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[#3d2c1e] font-bold">Rôle</Label>
                                <Select value={editRole} onValueChange={setEditRole}>
                                    <SelectTrigger className="bg-[#f8f6f1]/50 border-[#c9b896]/30 focus:border-[#8b5a2b]">
                                        <SelectValue placeholder="Choisir un rôle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="admin">Administrateur</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-[#3d2c1e] font-bold">{isAddMode ? "Mot de passe" : "Changer le mot de passe (laisser vide pour ne pas changer)"}</Label>
                                <Input
                                    type="password"
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-[#f8f6f1]/50 border-[#c9b896]/30 focus:border-[#8b5a2b]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">

                            {/* Sidebar Permissions */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-[#3d2c1e] text-lg border-b border-[#c9b896] pb-2">Menu Latéral (Sidebar)</h3>
                                <div className="space-y-3">
                                    {Object.entries({
                                        dashboard: "Tableau de bord",
                                        attendance: "Présences",
                                        employees: "Employés",
                                        schedule: "Emplois du Temps",
                                        calendar: "Calendrier",
                                        payroll: "Paie",
                                        fiche_payroll: "Fiche de Paie",
                                        notebook: "Reclamations",
                                        finance: "Chiffres de Paie",
                                        advances: "Avances",
                                        retards: "Retards",
                                        absents: "Absents"
                                    }).map(([key, label]) => (
                                        <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                            <span className="font-medium text-[#6b5744]">{label}</span>
                                            <Switch
                                                checked={permissions.sidebar[key]}
                                                onCheckedChange={() => togglePermission("sidebar", key)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Dashboard Stats */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-[#3d2c1e] text-lg border-b border-[#c9b896] pb-2">Tableau de Bord (Cards)</h3>
                                <div className="space-y-3">
                                    {Object.entries({
                                        total_personnel: "Total Personnel",
                                        presence_actuelle: "Présence Actuelle",
                                        en_retard: "En Retard",
                                        absences: "Absences",
                                        les_avances: "Les Avances",
                                        reste_a_payer: "Reste à Payer"
                                    }).map(([key, label]) => (
                                        <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                            <span className="font-medium text-[#6b5744]">{label}</span>
                                            <Switch
                                                checked={permissions.dashboard[key]}
                                                onCheckedChange={() => togglePermission("dashboard", key)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Attendance & Employees */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-[#3d2c1e] text-lg border-b border-[#c9b896] pb-2">Modules Spécifiques</h3>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                        <span className="font-medium text-[#6b5744]">Attendance - Top 5 Performers</span>
                                        <Switch
                                            checked={permissions.attendance.top_performers}
                                            onCheckedChange={() => togglePermission("attendance", "top_performers")}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                        <span className="font-medium text-[#6b5744]">Employés - Bouton Ajouter</span>
                                        <Switch
                                            checked={permissions.employees.add_employee}
                                            onCheckedChange={() => togglePermission("employees", "add_employee")}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payroll - Stats & Actions */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-[#3d2c1e] text-lg border-b border-[#c9b896] pb-2">Paie - Statistiques & Actions</h3>
                                <div className="space-y-3">
                                    {Object.entries({
                                        stats_total_base: "Stat - Salaires Base",
                                        stats_avances: "Stat - Avances",
                                        stats_net_global: "Stat - Net à Payer",
                                        stats_extras: "Stat - Extras",
                                        stats_doublages: "Stat - Doublages",
                                        action_extra: "Bouton Extra",
                                        action_doublage: "Bouton Doublage",
                                        action_rapport: "Bouton Rapport"
                                    }).map(([key, label]) => (
                                        <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                            <span className="font-medium text-[#6b5744]">{label}</span>
                                            <Switch
                                                checked={permissions.payroll[key]}
                                                onCheckedChange={() => togglePermission("payroll", key)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payroll - Table Columns */}
                            <div className="space-y-4 md:col-span-2">
                                <h3 className="font-bold text-[#3d2c1e] text-lg border-b border-[#c9b896] pb-2">Paie - Colonnes du Tableau</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {Object.entries({
                                        col_employee: "Employé",
                                        col_base: "Base",
                                        col_abs_days: "Jours Abs",
                                        col_primes: "Primes",
                                        col_extra: "Extra",
                                        col_doublage: "Doublage",
                                        col_retenues: "Retenues",
                                        col_avance: "Avance",
                                        col_net: "Net",
                                        col_action: "Action (Payer / Détails)",
                                        user_details_modal: "Détails Employé (Modal)"
                                    }).map(([key, label]) => (
                                        <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                            <span className="font-medium text-[#6b5744]">{label}</span>
                                            <Switch
                                                checked={permissions.payroll[key]}
                                                onCheckedChange={() => togglePermission("payroll", key)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        <div className="flex justify-end pt-4 border-t border-[#c9b896]/20">
                            <Button
                                onClick={handleSave}
                                className="bg-[#8b5a2b] hover:bg-[#6b4521] text-white px-8"
                            >
                                <Save className="mr-2 h-4 w-4" /> {isAddMode ? "Créer le compte" : "Enregistrer les modifications"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}
