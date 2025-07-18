"use client"

import type React from "react"

import { useState } from "react"
import { Search, User, ShoppingCart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/auth-store"

interface NavigationProps {
  onSearch?: (query: string) => void
  cartItemsCount?: number
}

export function Navigation({ onSearch, cartItemsCount = 0 }: NavigationProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuthStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-xl">MetalBaza</span>
            </a>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Mahsulotlarni qidirish..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{user.first_name}</span>
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm">
                <User className="h-4 w-4 mr-2" />
                Kirish
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Mahsulotlarni qidirish..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="py-4 space-y-4">
              {user ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{user.first_name}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      {cartItemsCount > 0 && (
                        <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                          {cartItemsCount}
                        </Badge>
                      )}
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={logout} className="w-full bg-transparent">
                    Chiqish
                  </Button>
                </>
              ) : (
                <Button variant="default" size="sm" className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  Kirish
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
