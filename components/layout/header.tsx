"use client"

import type React from "react"

import { useState } from "react"
import { Search, User, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/auth-store"

interface HeaderProps {
  onSearch?: (query: string) => void
  cartItemsCount?: number
}

export function Header({ onSearch, cartItemsCount = 0 }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout } = useAuthStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">MetalBaza</span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Mahsulotlarni qidirish..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <nav className="flex items-center space-x-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-4 w-4" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {user.first_name}
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                Kirish
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
