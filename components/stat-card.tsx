"use client"

import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: LucideIcon
  trend?: "up" | "down"
  color: "bronze" | "copper" | "gold"
  href?: string
}

export function StatCard({ title, value, change, icon: Icon, trend, color, href }: StatCardProps) {
  const router = useRouter()
  const colorClasses = {
    bronze: "from-[#8b5a2b]/20 to-[#8b5a2b]/5 text-[#8b5a2b] border-[#8b5a2b]/30",
    copper: "from-[#a0522d]/20 to-[#a0522d]/5 text-[#a0522d] border-[#a0522d]/30",
    gold: "from-[#c9a227]/20 to-[#c9a227]/5 text-[#c9a227] border-[#c9a227]/30",
  }

  const handleClick = () => {
    if (href) {
      router.push(href)
    }
  }

  return (
    <Card
      className={`bg-white border-[#c9b896] p-4 sm:p-5 lg:p-6 shadow-md hover:shadow-lg transition-all ${href ? "cursor-pointer hover:scale-[1.02] hover:border-[#8b5a2b]" : ""
        }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-3 lg:gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm lg:text-base font-bold text-[#6b5744]/70 uppercase tracking-wider">{title}</p>
          <p className="mt-1 sm:mt-2 font-[family-name:var(--font-heading)] text-2xl sm:text-3xl lg:text-4xl font-black text-[#3d2c1e] tracking-tight">
            {value}
          </p>
          {change && (
            <p
              className={`mt-1 text-[10px] sm:text-xs lg:text-sm font-bold ${trend === "up" ? "text-emerald-600" : "text-red-500"}`}
            >
              {change}
            </p>
          )}
        </div>
        <div className={`flex-shrink-0 rounded-xl bg-gradient-to-br p-2.5 sm:p-3 lg:p-3.5 border ${colorClasses[color]} shadow-sm`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
        </div>
      </div>
    </Card>
  )
}
