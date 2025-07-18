import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { CartItem, Product } from "@shared/schema";

interface CartBarProps {
  onOrderClick?: () => void;
}

export function CartBar({ onOrderClick }: CartBarProps) {
  const { user } = useAuth();

  const { data: cartItems, isLoading } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ['/api/cart'],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch('/api/cart', {
        headers: {
          'x-telegram-id': user?.telegram_id?.toString() || '',
        },
      });
      if (!response.ok) {
        if (response.status === 401) return []; // Not authenticated
        throw new Error('Savatni yuklashda xatolik');
      }
      return response.json();
    },
  });

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('uz-UZ').format(Number(price)) + " so'm";
  };

  const getTotalCartAmount = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => {
      return total + (Number(item.product.price) * item.quantity);
    }, 0);
  };

  const getTotalItemCount = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Don't show if user is not logged in or cart is empty
  if (!user || !cartItems || cartItems.length === 0 || isLoading) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-lg md:bottom-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <ShoppingCart className="h-6 w-6 text-gray-700" />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-black text-white text-xs">
              {getTotalItemCount()}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Jami summa</p>
            <p className="font-bold text-lg text-black">
              {formatPrice(getTotalCartAmount().toString())}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={onOrderClick}
          className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-lg font-medium"
        >
          Buyurtma berish
        </Button>
      </div>
    </div>
  );
}
