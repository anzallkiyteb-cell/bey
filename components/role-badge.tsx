import type { Role } from "@/lib/mock-data"

export function RoleBadge({ role }: { role: Role }) {
  const styles = {
    admin: "bg-[#8b5a2b]/15 text-[#8b5a2b] border-[#8b5a2b]/40",
    manager: "bg-[#a0522d]/15 text-[#a0522d] border-[#a0522d]/40",
    user: "bg-[#c9a227]/15 text-[#c9a227] border-[#c9a227]/40",
  }

  const roleNames = {
    admin: "Admin",
    manager: "Gérant",
    user: "Employé",
  }

  return (
    <span className={`rounded-full border px-2 sm:px-3 py-1 text-xs font-medium ${styles[role]}`}>
      {roleNames[role]}
    </span>
  )
}
