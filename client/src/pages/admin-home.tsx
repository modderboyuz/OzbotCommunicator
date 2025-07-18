import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LoginModal } from "@/components/auth/login-modal";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  Megaphone, 
  BarChart3,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export default function AdminHome() {
  const { user, login } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: orders } = useQuery({
    queryKey: ['/api/orders'],
  });

  const { data: ads } = useQuery({
    queryKey: ['/api/ads'],
  });

  React.useEffect(() => {
    if (!user) {
      setIsLoginModalOpen(true);
    } else if (user.role !== 'admin') {
      // Redirect non-admin users to regular home
      window.location.href = '/';
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

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Kirish taqiqlangan
            </h2>
            <p className="text-gray-600">
              Bu sahifa faqat administratorlar uchun
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administrator paneli</h1>
          <p className="text-gray-600 mt-2">
            Tizim boshqaruvi va statistikalar
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jami mahsulotlar
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Katalogdagi mahsulotlar soni
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Buyurtmalar
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Jami buyurtmalar soni
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Aktiv reklamalar
              </CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ads?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Faol reklama bannerlari
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Foydalanuvchilar
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Ro'yxatdan o'tgan foydalanuvchilar
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Mahsulotlar boshqaruvi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Mahsulotlarni qo'shish, tahrirlash va boshqarish
              </p>
              <Button className="w-full" onClick={() => window.location.href = '/admin'}>
                Mahsulotlar bo'limiga o'tish
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Buyurtmalar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Buyurtmalarni ko'rish va boshqarish
              </p>
              <Button className="w-full" onClick={() => window.location.href = '/admin'}>
                Buyurtmalar bo'limiga o'tish
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Reklamalar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Reklama bannerlarini boshqarish
              </p>
              <Button className="w-full" onClick={() => window.location.href = '/admin'}>
                Reklamalar bo'limiga o'tish
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
