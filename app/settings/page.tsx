"use client"

import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { currentUser } from "@/lib/mock-data"
import { User, Shield, Bell, Palette, Eye, EyeOff } from "lucide-react"

import { useState, useEffect } from "react"
import { gql, useMutation } from "@apollo/client"
import { useRouter } from "next/navigation"

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($userId: ID!, $oldPassword: String!, $newPassword: String!) {
    changePassword(userId: $userId, oldPassword: $oldPassword, newPassword: $newPassword)
  }
`

export default function SettingsPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (currentUser?.role === "manager") {
      router.push("/")
    }
  }, [router])

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [changePassword, { loading: updatingPassword }] = useMutation(CHANGE_PASSWORD)

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Veuillez remplir tous les champs")
      return
    }

    if (newPassword !== confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas")
      return
    }

    try {
      if (!currentUser?.id) {
        alert("Utilisateur non identifié")
        return
      }

      await changePassword({
        variables: {
          userId: currentUser.id,
          oldPassword: currentPassword,
          newPassword: newPassword
        }
      })

      alert("Mot de passe modifié avec succès")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (e: any) {
      console.error(e)
      alert(e.message || "Erreur lors de la modification du mot de passe")
    }
  }

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
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-[#f8f6f1] border-[#c9b896] text-[#3d2c1e] pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-[#8b5a2b]" />
                      ) : (
                        <Eye className="h-4 w-4 text-[#8b5a2b]" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-[#3d2c1e]">
                    Nouveau Mot de Passe
                  </label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-[#f8f6f1] border-[#c9b896] text-[#3d2c1e] pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-[#8b5a2b]" />
                      ) : (
                        <Eye className="h-4 w-4 text-[#8b5a2b]" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-[#3d2c1e]">
                    Confirmer le Mot de Passe
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-[#f8f6f1] border-[#c9b896] text-[#3d2c1e] pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-[#8b5a2b]" />
                      ) : (
                        <Eye className="h-4 w-4 text-[#8b5a2b]" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-[#c9b896] text-[#3d2c1e] hover:bg-[#f8f6f1] bg-transparent w-full sm:w-auto"
                  onClick={handlePasswordUpdate}
                  disabled={updatingPassword}
                >
                  {updatingPassword ? "Modification..." : "Modifier le Mot de Passe"}
                </Button>
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
