import * as React from "react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Menu, 
  ShoppingCart, 
  User, 
  Package, 
  Settings, 
  LogOut,
  Home,
  Grid3X3,
  ClipboardList,
  Phone,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth.tsx";

const navigationItems = [
  { name: 'Bosh sahifa', href: '/', icon: Home },
  { name: 'Katalog', href: '/catalog', icon: Grid3X3 },
  { name: 'Buyurtmalar', href: '/orders', icon: ClipboardList },
  { name: 'Aloqa', href: '/contact', icon: Phone },
];

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to home page with search query
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Real-time search on input change
  React.useEffect(() => {
    if (searchQuery.trim() && location === '/') {
      const timeoutId = setTimeout(() => {
        window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
      }, 500); // 500ms debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, location]);

  const NavItems = ({ mobile = false }) => (
    <>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            onClick={() => mobile && setIsOpen(false)}
          >
            <Button
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={mobile ? 'w-full justify-start' : ''}
            >
              <Icon className={`h-4 w-4 ${mobile ? 'mr-2' : ''}`} />
              {mobile && item.name}
            </Button>
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-black" />
              <span className="text-lg font-bold text-black hidden md:block">
                MetalBaza
              </span>
            </div>
          </Link>

          {/* Search Bar - iOS Style */}
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavItems />
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Buyurtmalar</Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm">
                Kirish
              </Button>
            )}


          </div>
        </div>
      </div>
    </header>
  );
}
