import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useBottomNav } from "@/hooks/use-bottom-nav";
import { 
  Home, 
  Grid3X3, 
  ClipboardList, 
  User,
  Users
} from "lucide-react";

const navItems = [
  { name: 'Bosh sahifa', href: '/', icon: Home },
  { name: 'Katalog', href: '/catalog', icon: Grid3X3 },
  { name: 'Ustalar', href: '/workers', icon: Users },
  { name: 'Buyurtmalar', href: '/orders', icon: ClipboardList },
  { name: 'Profil', href: '/profile', icon: User },
];

export function BottomNavigation() {
  const [location] = useLocation();
  const { isVisible } = useBottomNav();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 z-50 md:hidden safe-area-pb">
      <div className="flex justify-around items-center px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
              }`}>
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-600'}`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
