"use client"

import { useState } from "react"
import { Search, User, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoginModal } from "@/components/auth/login-modal"
import { useAuthStore } from "@/lib/auth-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface NavigationProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export function Navigation({ searchQuery = "", onSearchChange }: NavigationProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()

  const handleLogin = (userData: any) => {
    useAuthStore.getState().setUser(userData)
    setIsLoginModalOpen(false)
  }

  const handleLogout = () => {
    logout()
    localStorage.removeItem("telegram_id")
    router.push("/")
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MB</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">MetalBaza</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Mahsulotlarni qidiring..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <Button variant="ghost" size="sm" className="relative p-2" onClick={() => router.push("/checkout")}>
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Button>

              {/* User Menu */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profile_image || "/placeholder.svg"} alt={user.first_name} />
                        <AvatarFallback>
                          {user.first_name.charAt(0)}
                          {user.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          @{user.username || user.phone}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile")}>Profil</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/orders")}>Buyurtmalar</DropdownMenuItem>
                    {user.role === "worker" && (
                      <DropdownMenuItem onClick={() => router.push("/worker-applications")}>Ishlar</DropdownMenuItem>
                    )}
                    {user.role === "admin" && (
                      <DropdownMenuItem onClick={() => router.push("/admin")}>Admin Panel</DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Chiqish</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
                >
                  <User className="h-4 w-4 mr-2" />
                  Kirish
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />
    </>
  )
}
