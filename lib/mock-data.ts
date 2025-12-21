// Données fictives pour l'application (sans base de données)

export type Role = "admin" | "manager" | "user"

export interface User {
  id: string
  zktecoId: string
  name: string
  email: string
  role: Role
  department: string
  avatar?: string
  managerId?: string
  phone?: string
  cin?: string
  status?: "IN" | "OUT"
  salary?: number
  permissions?: string
}

export interface AttendanceRecord {
  id: string
  userId: string
  date: string
  clockIn: string
  clockOut?: string
  status: "present" | "absent" | "late" | "half-day"
  hours?: number
}

export interface Advance {
  id: string
  userId: string
  amount: number
  reason: string
  status: "pending" | "approved" | "rejected"
  requestDate: string
  approvedBy?: string
}

export interface Payroll {
  id: string
  userId: string
  month: string
  basicSalary: number
  allowances: number
  deductions: number
  advances: number
  netSalary: number
  status: "pending" | "processed" | "paid"
}

export type ShiftType = "matin" | "soire" | "repos" | "doublage"

export interface Schedule {
  id: string
  userId: string
  date: string
  shift: ShiftType
  notes?: string
}

export type NotificationType = "pointage" | "avance" | "payment" | "schedule" | "system"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  userId: string // Who performed the action
  targetUserId?: string // Who is affected (for viewing permissions)
  timestamp: string
  read: boolean
  metadata?: {
    advanceId?: string
    amount?: number
    payrollId?: string
    attendanceId?: string
  }
}

// Mock notifications data
export const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "pointage",
    title: "Pointage d'entrée",
    message: "ABDALLAH a pointé son entrée à 09:00",
    userId: "3",
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: "n2",
    type: "avance",
    title: "Nouvelle demande d'avance",
    message: "ABDALLAH a demandé une avance de 500 TND",
    userId: "3",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    metadata: { advanceId: "1", amount: 500 },
  },
  {
    id: "n3",
    type: "avance",
    title: "Avance approuvée",
    message: "Votre avance de 1000 TND a été approuvée",
    userId: "2",
    targetUserId: "4",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: false,
    metadata: { advanceId: "2", amount: 1000 },
  },
  {
    id: "n4",
    type: "payment",
    title: "Paiement effectué",
    message: "Salaire de janvier 2025 payé - 1600 TND",
    userId: "1",
    targetUserId: "3",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    metadata: { payrollId: "1", amount: 1600 },
  },
  {
    id: "n5",
    type: "pointage",
    title: "Pointage en retard",
    message: "ABDELHAFIDHE a pointé en retard à 09:15",
    userId: "4",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "n6",
    type: "payment",
    title: "Paiement effectué",
    message: "Salaire de janvier 2025 payé - 930 TND",
    userId: "1",
    targetUserId: "4",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    metadata: { payrollId: "2", amount: 930 },
  },
  {
    id: "n7",
    type: "pointage",
    title: "Pointage de sortie",
    message: "MOHAMED a pointé sa sortie à 17:00",
    userId: "9",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "n8",
    type: "schedule",
    title: "Nouveau planning",
    message: "Votre planning a été mis à jour pour la semaine prochaine",
    userId: "2",
    targetUserId: "3",
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "n9",
    type: "avance",
    title: "Avance rejetée",
    message: "Votre demande d'avance de 800 TND a été rejetée",
    userId: "2",
    targetUserId: "5",
    timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    read: true,
    metadata: { amount: 800 },
  },
  {
    id: "n10",
    type: "system",
    title: "Mise à jour système",
    message: "Le système a été mis à jour avec succès",
    userId: "1",
    timestamp: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
]

// Helper function to get notifications for current user
export const getNotificationsForUser = (userId: string, role: Role): Notification[] => {
  if (role === "admin" || role === "manager") {
    // Admins and managers see all notifications
    return mockNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }
  // Regular users only see their own notifications
  return mockNotifications
    .filter((n) => n.targetUserId === userId || n.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export const mockUsers: User[] = [
  {
    id: "1",
    zktecoId: "10000001",
    name: "Utilisateur Admin",
    email: "admin@businessbey.com",
    role: "admin",
    department: "Direction",
    phone: "20123456",
    cin: "08000001",
    status: "IN",
    salary: 3000,
  },
  {
    id: "2",
    zktecoId: "10000002",
    name: "Ahmed Gérant",
    email: "ahmed@businessbey.com",
    role: "manager",
    department: "Service",
    phone: "20123457",
    cin: "08000002",
    status: "IN",
    salary: 2500,
  },
  {
    id: "3",
    zktecoId: "54195112",
    name: "ABDALLAH",
    email: "abdallah@businessbey.com",
    role: "user",
    department: "Service",
    managerId: "2",
    salary: 1500,
  },
  {
    id: "4",
    zktecoId: "70402802",
    name: "ABDELHAFIDHE",
    email: "abdelhafidhe@businessbey.com",
    role: "user",
    department: "Cuisine",
    managerId: "2",
    salary: 1800,
  },
  {
    id: "5",
    zktecoId: "47376315",
    name: "ABDELJALIL",
    email: "abdeljalil@businessbey.com",
    role: "user",
    department: "Service",
    managerId: "2",
    salary: 1400,
  },
  {
    id: "6",
    zktecoId: "79634572",
    name: "ABDELJELIL",
    email: "abdeljelil@businessbey.com",
    role: "user",
    department: "Caisse",
    managerId: "2",
    salary: 1600,
  },
  {
    id: "7",
    zktecoId: "53551979",
    name: "ABDELKERIM",
    email: "abdelkerim@businessbey.com",
    role: "user",
    department: "Cuisine",
    managerId: "2",
    salary: 1700,
  },
  {
    id: "8",
    zktecoId: "52176195",
    name: "ABDELLAZIZ",
    email: "abdellaziz@businessbey.com",
    role: "user",
    department: "Service",
    managerId: "2",
    salary: 1450,
  },
  {
    id: "9",
    zktecoId: "61234567",
    name: "MOHAMED",
    email: "mohamed@businessbey.com",
    role: "user",
    department: "Cuisine",
    managerId: "2",
    salary: 1550,
  },
  {
    id: "10",
    zktecoId: "71234568",
    name: "SARRA",
    email: "sarra@businessbey.com",
    role: "user",
    department: "Service",
    managerId: "2",
    salary: 1500,
  },
  {
    id: "11",
    zktecoId: "81234569",
    name: "FATMA",
    email: "fatma@businessbey.com",
    role: "user",
    department: "Caisse",
    managerId: "2",
    salary: 1600,
  },
  {
    id: "12",
    zktecoId: "91234570",
    name: "YOUSSEF",
    email: "youssef@businessbey.com",
    role: "user",
    department: "Cuisine",
    managerId: "2",
    phone: "20123467",
    cin: "08000012",
    status: "OUT",
    salary: 1650,
  },
]

const today = new Date().toISOString().split("T")[0]

export const mockAttendance: AttendanceRecord[] = [
  { id: "1", userId: "3", date: today, clockIn: "09:00", clockOut: "17:30", status: "present", hours: 8.5 },
  { id: "2", userId: "4", date: today, clockIn: "09:15", clockOut: "17:45", status: "late", hours: 8.5 },
  { id: "3", userId: "9", date: today, clockIn: "08:45", clockOut: "17:00", status: "present", hours: 8.25 },
  { id: "4", userId: "10", date: today, clockIn: "09:00", status: "present", hours: 0 },
  { id: "5", userId: "3", date: "2025-01-12", clockIn: "09:00", clockOut: "17:30", status: "present", hours: 8.5 },
  { id: "6", userId: "4", date: "2025-01-12", clockIn: "10:00", clockOut: "17:00", status: "late", hours: 7 },
  { id: "7", userId: "3", date: "2025-01-11", clockIn: "09:00", clockOut: "17:30", status: "present", hours: 8.5 },
  { id: "8", userId: "4", date: "2025-01-11", clockIn: "09:05", clockOut: "17:30", status: "present", hours: 8.4 },
  { id: "9", userId: "5", date: "2025-01-11", clockIn: "09:00", clockOut: "17:00", status: "present", hours: 8 },
]

// Avances fictives
export const mockAdvances: Advance[] = [
  {
    id: "1",
    userId: "3",
    amount: 500,
    reason: "Urgence médicale",
    status: "approved",
    requestDate: "2025-01-10",
    approvedBy: "2",
  },
  {
    id: "2",
    userId: "4",
    amount: 1620,
    reason: "Prêt personnel",
    status: "approved",
    requestDate: "2025-01-08",
    approvedBy: "2",
  },
  {
    id: "3",
    userId: "5",
    amount: 1260,
    reason: "Frais scolaires",
    status: "approved",
    requestDate: "2025-01-05",
    approvedBy: "2",
  },
  {
    id: "4",
    userId: "9",
    amount: 800,
    reason: "Réparation voiture",
    status: "approved",
    requestDate: "2025-01-07",
    approvedBy: "2",
  },
  {
    id: "5",
    userId: "10",
    amount: 600,
    reason: "Urgence familiale",
    status: "approved",
    requestDate: "2025-01-09",
    approvedBy: "1",
  },
]

// Paie fictive
export const mockPayroll: Payroll[] = [
  {
    id: "1",
    userId: "3",
    month: "2025-01",
    basicSalary: 1500,
    allowances: 200,
    deductions: 100,
    advances: 0,
    netSalary: 1600,
    status: "processed",
  },
  {
    id: "2",
    userId: "4",
    month: "2025-01",
    basicSalary: 1800,
    allowances: 250,
    deductions: 120,
    advances: 1000,
    netSalary: 930,
    status: "processed",
  },
]

// Emplois du temps (Schedules)
export const mockSchedules: Schedule[] = [
  { id: "1", userId: "3", date: "2025-01-12", shift: "matin" },
  { id: "2", userId: "3", date: "2025-01-13", shift: "repos" },
  { id: "3", userId: "4", date: "2025-01-12", shift: "soire" },
  { id: "4", userId: "4", date: "2025-01-13", shift: "doublage" },
  { id: "5", userId: "5", date: "2025-01-12", shift: "matin" },
  { id: "6", userId: "9", date: "2025-01-12", shift: "soire" },
  { id: "7", userId: "10", date: "2025-01-12", shift: "matin" },
  { id: "8", userId: "11", date: "2025-01-12", shift: "repos" },
]

const STORAGE_KEY = "business_bey_user";

// Initialize from storage if available
let _currentUser: User | null = null;
if (typeof window !== "undefined") {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      _currentUser = JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse user from storage", e);
  }
}

export const getCurrentUser = () => {
  if (typeof window !== "undefined" && !_currentUser) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        _currentUser = JSON.parse(stored);
      }
    } catch (e) { }
  }
  return _currentUser;
}

export const setCurrentUser = (user: User | null) => {
  _currentUser = user
  if (typeof window !== "undefined") {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent("userChanged"))
  }
}

// Pour la compatibilité (Deprecated - avoid using this directly for auth checks)
export const currentUser = new Proxy({} as User, {
  get(target, prop) {
    return _currentUser ? _currentUser[prop as keyof User] : undefined
  },
})
