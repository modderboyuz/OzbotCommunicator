import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { queryClient } from '@/lib/query-client.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  User, 
  Phone, 
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import type { CartItem, Product } from '@shared/schema';

export default function Checkout() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [editableProfile, setEditableProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || ''
  });

  // Fetch cart items
  const { data: cartItems, isLoading: cartLoading, refetch: refetchCart } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ['/api/cart'],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch('/api/cart', {
        headers: {
          'x-telegram-id': user?.telegram_id?.toString() || '',
        },
      });
      if (!response.ok) {
        throw new Error('Savatni yuklashda xatolik');
      }
      return response.json();
    },
  });

  // Update cart item quantity
  const updateCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-id': user?.telegram_id?.toString() || '',
        },
        body: JSON.stringify({ quantity }),
      });
      
      if (!response.ok) {
        throw new Error('Savat elementini yangilashda xatolik');
      }
      
      return response.json();
    },
    onSuccess: () => {
      refetchCart();
    },
  });

  // Remove item from cart
  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'x-telegram-id': user?.telegram_id?.toString() || '',
        },
      });
      
      if (!response.ok) {
        throw new Error('Savatdan o\'chirishda xatolik');
      }
      
      return response.json();
    },
    onSuccess: () => {
      refetchCart();
    },
  });

  // Update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: typeof editableProfile) => {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-id': user?.telegram_id?.toString() || '',
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error('Profilni yangilashda xatolik');
      }
      
      return response.json();
    },
  });

  // Place order
  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-id': user?.telegram_id?.toString() || '',
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        throw new Error('Buyurtma berishda xatolik');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Buyurtma berish",
        description: "Buyurtma muvaffaqiyatli berildi!",
      });
      navigate('/orders');
    },
  });

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('uz-UZ').format(Number(price)) + " so'm";
  };

  const getTotalAmount = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => {
      return total + (Number(item.product.price) * item.quantity);
    }, 0);
  };

  const handlePlaceOrder = () => {
    if (!cartItems || cartItems.length === 0) {
      toast({
        title: "Xatolik",
        description: "Savat bo'sh",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      delivery_address: deliveryAddress,
      notes: notes,
      items: cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_per_unit: Number(item.product.price)
      }))
    };

    placeOrderMutation.mutate(orderData);
  };

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(editableProfile);
  };

  if (cartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Savat bo'sh</h2>
          <p className="text-gray-600 mb-4">Hozircha savatda mahsulotlar yo'q</p>
          <Button onClick={() => navigate('/catalog')}>
            Katalogga o'tish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Buyurtma berish</h1>
      </div>

      {/* Cart Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Savat ({cartItems.length} mahsulot)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <img
                src={item.product.image_url || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                alt={item.product.name_uz}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-medium">{item.product.name_uz}</h3>
                <p className="text-sm text-gray-600">{formatPrice(item.product.price)} / {item.product.unit}</p>
                {item.product.is_rental && (
                  <Badge variant="secondary" className="mt-1">Ijara</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateCartMutation.mutate({ 
                    productId: item.product_id, 
                    quantity: Math.max(1, item.quantity - 1) 
                  })}
                  disabled={item.quantity <= 1 || updateCartMutation.isPending}
                  className="w-8 h-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateCartMutation.mutate({ 
                    productId: item.product_id, 
                    quantity: item.quantity + 1 
                  })}
                  disabled={updateCartMutation.isPending}
                  className="w-8 h-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFromCartMutation.mutate(item.product_id)}
                  disabled={removeFromCartMutation.isPending}
                  className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* User Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Shaxsiy ma'lumotlar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fullName">Ism va familiya</Label>
            <Input
              id="fullName"
              value={`${user?.first_name} ${user?.last_name}`}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefon raqam</Label>
            <Input
              id="phone"
              value={user?.phone || ''}
              readOnly
              className="bg-gray-50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Yetkazib berish manzili
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Manzil</Label>
            <Input
              id="address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Yetkazib berish manzilini kiriting..."
            />
          </div>
          <div>
            <Label htmlFor="notes">Qo'shimcha ma'lumot</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Buyurtma haqida qo'shimcha ma'lumot..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Buyurtma jami</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Mahsulotlar jami:</span>
              <span>{formatPrice(getTotalAmount().toString())}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Jami:</span>
              <span>{formatPrice(getTotalAmount().toString())}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Place Order Button */}
      <Button
        onClick={handlePlaceOrder}
        disabled={placeOrderMutation.isPending}
        className="w-full bg-black text-white hover:bg-gray-800 py-3 text-lg font-semibold"
      >
        {placeOrderMutation.isPending ? 'Yuklanmoqda...' : 'Buyurtma berish'}
      </Button>
    </div>
  );
}