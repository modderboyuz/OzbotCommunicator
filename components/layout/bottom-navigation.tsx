"use client"

import { usePathname } from "next/navigation"
import { Home, Search, ShoppingCart, User, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"

const navItems = [
  {
    name: "Bosh sahifa",
    href: "/",
    icon: Home,
  },
  {
    name: "Qidirish",
    href: "/search",
    icon: Search,
  },
  {
    name: "Savat",
    href: "/cart",
    icon: ShoppingCart,
    requireAuth: true,
  },
  {
    name: "Ustalar",
    href: "/workers",
    icon: Users,
  },
  {
    name: "Profil",
    href: "/profile",
    icon: User,
    requireAuth: true,
  },
]

export function BottomNavigation() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <nav className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          if (item.requireAuth && !user) return null

          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", isActive && "text-primary")} />
              <span className={cn(isActive && "text-primary")}>{item.name}</span>
            </a>
          )
        })}
      </nav>
    </div>
  )
}
