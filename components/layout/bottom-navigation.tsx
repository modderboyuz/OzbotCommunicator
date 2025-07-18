"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, Search, ShoppingCart, User, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"

const navigationItems = [
  {
    name: "Bosh sahifa",
    href: "/",
    icon: Home,
  },
  {
    name: "Katalog",
    href: "/catalog",
    icon: Search,
  },
  {
    name: "Savatcha",
    href: "/checkout",
    icon: ShoppingCart,
  },
  {
    name: "Ishchilar",
    href: "/workers",
    icon: Briefcase,
  },
  {
    name: "Profil",
    href: "/profile",
    icon: User,
  },
]

export function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors",
                isActive ? "text-gray-900 bg-gray-50" : "text-gray-500 hover:text-gray-700",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
