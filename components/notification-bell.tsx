"use client"

import { useState, useMemo, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/mock-data"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { gql, useQuery, useMutation } from "@apollo/client"

const GET_NOTIFICATIONS = gql`
  query GetNotifications($userId: ID, $limit: Int) {
    getNotifications(userId: $userId, limit: $limit) {
      id
      type
      title
      message
      url
      timestamp
      read
      userDone
    }
  }
`;

const MARK_READ = gql`
  mutation MarkRead($userId: ID!) {
    markNotificationsAsRead(userId: $userId)
  }
`;

const MARK_ONE_READ = gql`
  mutation MarkOneRead($id: ID!) {
    markNotificationAsRead(id: $id)
  }
`;

export function NotificationBell() {
  const router = useRouter()
  const currentUser = getCurrentUser()
  const { data, loading, refetch, startPolling, stopPolling } = useQuery(GET_NOTIFICATIONS, {
    variables: {
      userId: ['admin', 'manager'].includes(currentUser?.role || '') ? null : currentUser?.id,
      limit: 100
    },
    pollInterval: 60000, // Reduced to every 60 seconds
    fetchPolicy: "cache-and-network"
  });

  // Pause polling if tab is hidden to save bandwidth/CPU
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startPolling(60000);
      } else {
        stopPolling();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [startPolling, stopPolling]);

  const [markRead] = useMutation(MARK_READ);
  const [markOneRead] = useMutation(MARK_ONE_READ);

  const notifications = useMemo(() => data?.getNotifications || [], [data]);
  const unreadCount = useMemo(() => notifications.filter((n: any) => !n.read).length, [notifications]);

  const handleMarkAsRead = async () => {
    // We no longer automatically mark all as read when opening
    // unless you want to keep that behavior. 
    // Usually, it's better to stay unread until interacted with or "Clear all"
  }

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markOneRead({ variables: { id: notification.id } });
      refetch();
    }
    if (notification.url) {
      router.push(notification.url);
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "pointage":
        return "🕐"
      case "avance":
        return "💰"
      case "payment":
        return "💵"
      case "schedule":
        return "📅"
      case "system":
        return "⚙️"
      default:
        return "🔔"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const now = new Date()
      const notifTime = new Date(timestamp)
      const diffMs = now.getTime() - notifTime.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return "À l'instant"
      if (diffMins < 60) return `Il y a ${diffMins} min`
      if (diffHours < 24) return `Il y a ${diffHours}h`
      if (diffDays === 1) return "Hier"
      if (diffDays < 7) return `Il y a ${diffDays} jours`
      return notifTime.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    } catch (e) { return timestamp; }
  }

  return (
    <DropdownMenu onOpenChange={(open) => open && handleMarkAsRead()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-12 w-12 lg:h-14 lg:w-14 rounded-full hover:bg-[#8b5a2b]/10 transition-colors"
        >
          <Bell className="h-6 w-6 lg:h-7 lg:w-7 text-[#8b5a2b]" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold border-2 border-white p-0">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] sm:w-[420px] max-h-[600px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between py-3 px-4">
          <span className="text-lg lg:text-xl font-bold text-[#8b5a2b]">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-red-100 text-red-700 text-sm">
              {unreadCount} nouveau{unreadCount > 1 ? "x" : ""}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!data && loading ? (
          <div className="py-12 text-center text-[#6b5744]">Chargement...</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-[#6b5744]">
            <Bell className="h-12 w-12 mx-auto mb-3 text-[#c9b896]" />
            <p className="text-base lg:text-lg">Aucune notification</p>
          </div>
        ) : (
          <>
            {notifications.map((notification: any) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 cursor-pointer hover:bg-[#f8f6f1] transition-colors ${!notification.read ? "bg-blue-50/50" : ""
                  }`}
              >
                <div className="flex gap-3 w-full">
                  <div className="text-2xl mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-base lg:text-lg text-[#3d2c1e] leading-tight">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm lg:text-base text-[#6b5744] mt-1 line-clamp-2">{notification.message}</p>
                    {notification.userDone && (
                      <p className="text-[10px] lg:text-xs font-bold text-[#8b5a2b] mt-1 italic uppercase tracking-wider border-t border-[#8b5a2b]/10 pt-1">
                        PAR: {notification.userDone}
                      </p>
                    )}
                    <p className="text-[10px] lg:text-xs text-[#a08968] mt-2 uppercase font-medium">{formatTimestamp(notification.timestamp)}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/notifications"
                className="w-full text-center py-3 text-base lg:text-lg font-semibold text-[#8b5a2b] hover:bg-[#f8f6f1] cursor-pointer"
              >
                Voir toutes les notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
