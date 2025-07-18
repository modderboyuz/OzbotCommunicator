"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Package, LogOut, Home, Grid3X3, ClipboardList, Phone, Search } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const navigationItems = [
  { name: "Bosh sahifa", href: "/", icon: Home },
  { name: "Katalog", href: "/catalog", icon: Grid3X3 },
  { name: "Buyurtmalar", href: "/orders", icon: ClipboardList },
  { name: "Aloqa", href: "/contact", icon: Phone },
]

export function Navigation() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}`
    }
  }

  React.useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        window.location.href = `/?search=${encodeURIComponent(searchQuery)}`
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [searchQuery])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-black" />
            <span className="text-lg font-bold text-black hidden md:block">MetalBaza</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 bg-gray-100 border-none rounded-full h-9 text-sm placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-black/10 transition-all"
              />
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button size="sm">Kirish</Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
