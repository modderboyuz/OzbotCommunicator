"use client"

import * as React from "react"
import { Search, User, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoginModal } from "@/components/auth/login-modal"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"

interface NavigationProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export function Navigation({ searchQuery = "", onSearchChange }: NavigationProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value)
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MB</span>
              </div>
              <span className="text-xl font-bold text-gray-900">MetalBaza</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Mahsulotlarni qidiring..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-full rounded-xl border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Button>

              {/* User */}
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Salom, {user.first_name}</span>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    Chiqish
                  </Button>
                </div>
              ) : (
                <Button variant="default" size="sm" onClick={() => setIsLoginModalOpen(true)}>
                  <User className="h-4 w-4 mr-2" />
                  Kirish
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  )
}
