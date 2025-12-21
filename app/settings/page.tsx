"use client"

import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { currentUser } from "@/lib/mock-data"
import { User, Shield, Bell, Palette } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f6f1] lg:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="border-b border-[#c9b896] bg-white p-4 sm:p-6 shadow-sm">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-[#8b5a2b]">
            Paramètres
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[#6b5744]">Gérer votre compte et vos préférences</p>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            <Card className="border-[#c9b896] bg-white p-4 sm:p-6 shadow-md">
              <div className="mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-[#8b5a2b]" />
                <h3 className="font-[family-name:var(--font-heading)] text-base sm:text-lg font-semibold text-[#3d2c1e]">
                  Informations du Profil
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#3d2c1e]">
                    Nom Complet
                  </label>
                  <Input
                    id="name"
                    defaultValue={currentUser.name}
                    className="bg-[#f8f6f1] border-[#c9b896] text-[#3d2c1e]"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#3d2c1e]">
                    Adresse Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={currentUser.email}
                    className="bg-[#f8f6f1] border-[#c9b896] text-[#3d2c1e]"
                  />
                </div>
                <div>
                  <label htmlFor="department" className="mb-2 block text-sm font-medium text-[#3d2c1e]">
                    Département
                  </label>
                  <Input
                    id="department"
                    defaultValue={currentUser.department}
                    className="bg-[#f8f6f1] border-[#c9b896] text-[#6b5744]"
                    disabled
                  />
                </div>
                <Button className="bg-gradient-to-r from-[#8b5a2b] to-[#a0522d] text-white hover:opacity-90 shadow-md w-full sm:w-auto">
                  Enregistrer
                </Button>
              </div>
            </Card>

            <Card className="border-[#c9b896] bg-white p-4 sm:p-6 shadow-md">
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#8b5a2b]" />
                <h3 className="font-[family-name:var(--font-heading)] text-base sm:text-lg font-semibold text-[#3d2c1e]">
                  Sécurité
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="current-password" className="mb-2 block text-sm font-medium text-[#3d2c1e]">
                    Mot de Passe Actuel
                  </label>
                  <Input
                    id="current-password"
                    type="password"
                    className="bg-[#f8f6f1] border-[#c9b896] text-[#3d2c1e]"
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-[#3d2c1e]">
                    Nouveau Mot de Passe
                  </label>
                  <Input id="new-password" type="password" className="bg-[#f8f6f1] border-[#c9b896] text-[#3d2c1e]" />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-[#3d2c1e]">
                    Confirmer le Mot de Passe
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    className="bg-[#f8f6f1] border-[#c9b896] text-[#3d2c1e]"
                  />
                </div>
                <Button
                  variant="outline"
                  className="border-[#c9b896] text-[#3d2c1e] hover:bg-[#f8f6f1] bg-transparent w-full sm:w-auto"
                >
                  Modifier le Mot de Passe
                </Button>
              </div>
            </Card>

            <Card className="border-[#c9b896] bg-white p-4 sm:p-6 shadow-md">
              <div className="mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#8b5a2b]" />
                <h3 className="font-[family-name:var(--font-heading)] text-base sm:text-lg font-semibold text-[#3d2c1e]">
                  Notifications
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#3d2c1e] text-sm sm:text-base">Notifications par Email</p>
                    <p className="text-xs sm:text-sm text-[#6b5744]">Recevoir des mises à jour par email</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#8b5a2b] text-[#8b5a2b] hover:bg-[#8b5a2b]/10 bg-transparent w-full sm:w-auto"
                  >
                    Activer
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#3d2c1e] text-sm sm:text-base">Rappels de Pointage</p>
                    <p className="text-xs sm:text-sm text-[#6b5744]">Rappels pour pointer entrée/sortie</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#8b5a2b] text-[#8b5a2b] hover:bg-[#8b5a2b]/10 bg-transparent w-full sm:w-auto"
                  >
                    Activer
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#3d2c1e] text-sm sm:text-base">Mises à Jour des Avances</p>
                    <p className="text-xs sm:text-sm text-[#6b5744]">Notifications sur les demandes d'avances</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#8b5a2b] text-[#8b5a2b] hover:bg-[#8b5a2b]/10 bg-transparent w-full sm:w-auto"
                  >
                    Activer
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="border-[#c9b896] bg-white p-4 sm:p-6 shadow-md">
              <div className="mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5 text-[#8b5a2b]" />
                <h3 className="font-[family-name:var(--font-heading)] text-base sm:text-lg font-semibold text-[#3d2c1e]">
                  Apparence
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-lg bg-gradient-to-br from-[#8b5a2b] to-[#a0522d] neon-glow" />
                  <div>
                    <p className="font-medium text-[#3d2c1e] text-sm sm:text-base">Thème Bronze Élégance (Actif)</p>
                    <p className="text-xs sm:text-sm text-[#6b5744]">Tons crème avec accents bronze lumineux</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
