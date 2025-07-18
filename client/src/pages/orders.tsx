import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { LoginModal } from "@/components/auth/login-modal";
import { ShoppingCart, Package, Trash2 } from "lucide-react";
import type { Order, CartItem, Product } from "@shared/schema";

export default function Orders() {
  const { user, login } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch('/api/orders', {
        headers: {
          'x-telegram-id': user?.telegram_id?.toString() || '',
        },
      });
      if (!response.ok) {
        throw new Error('Buyurtmalarni yuklashda xatolik');
      }
      return response.json();
    },
  });

  const { data: cartItems, isLoading: isCartLoading, refetch: refetchCart } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ['/api/cart'],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('Savatni yuklashda xatolik');
      }
      return response.json();
    },
  });

  React.useEffect(() => {
    if (!user) {
      setIsLoginModalOpen(true);
    }
  }, [user]);

  if (!user) {
    return (
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={login}
      />
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Kutilmoqda';
      case 'confirmed': return 'Tasdiqlangan';
      case 'processing': return 'Jarayonda';
      case 'completed': return 'Bajarilgan';
      case 'cancelled': return 'Bekor qilingan';
      default: return status;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        refetchCart();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('uz-UZ').format(Number(price)) + " so'm";
  };

  const getTotalCartAmount = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => {
      return total + (Number(item.product.price) * item.quantity);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${isMobile ? 'pb-20' : ''}`}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Buyurtmalar</h1>
          <p className="text-gray-600 mt-2">
            Sizning buyurtmalaringiz tarixi
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      Buyurtma #{order.id.slice(-8)}
                    </CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Umumiy summa:</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat('uz-UZ').format(Number(order.total_amount))} so'm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sana:</span>
                      <span>{new Date(order.created_at).toLocaleDateString('uz-UZ')}</span>
                    </div>
                    {order.delivery_address && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Manzil:</span>
                        <span className="text-right max-w-xs truncate">{order.delivery_address}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Buyurtmalar yo'q
              </h3>
              <p className="text-gray-600">
                Hozircha buyurtmalaringiz yo'q. Katalogdan mahsulotlar tanlang.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {isMobile && <BottomNavigation />}
    </div>
  );
}