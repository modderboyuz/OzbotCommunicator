<<<<<<< HEAD
{"code":"rate-limited","message":"You have hit the rate limit. Please upgrade to keep chatting.","providerLimitHit":false,"isRetryable":true}
=======
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ProductDetailModal } from "@/components/product/product-detail-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/query-client";
import { 
  Building2, 
  Wrench, 
  Truck, 
  Zap,
  Package,
  ShoppingCart
} from "lucide-react";
import type { Category, Product, Ad } from "@shared/schema";

const categoryIcons = {
  building: Building2,
  wrench: Wrench,
  truck: Truck,
  zap: Zap,
};

function Categories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <div className="px-2 py-1 mb-4">
        <div className="flex justify-center">
          <div className="flex space-x-2 overflow-x-auto pb-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="w-8 h-2 mt-1 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Faqat asosiy kategoriyalarni ko'rsatamiz (parent_id null bo'lganlar)
  const mainCategories = categories?.filter((cat: Category) => !cat.parent_id) || [];

  return (
    <div className="px-2 py-2 mb-4">
      <div className="flex justify-center">
        <div className="flex space-x-4 overflow-x-auto pb-1 scrollbar-hide">
          {mainCategories.slice(0, 6).map((category: Category) => {
            const IconComponent = categoryIcons[category.icon as keyof typeof categoryIcons] || Package;
            return (
              <Link key={category.id} href={`/catalog?category=${category.id}`}>
                <div className="flex-shrink-0 flex flex-col items-center space-y-1 cursor-pointer group">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <IconComponent className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-700 text-center w-12 truncate">
                    {category.name_uz}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AdBanner() {
  const { data: ads } = useQuery({
    queryKey: ['/api/ads'],
  });

  if (!ads || ads.length === 0) {
    return null;
  }

  const ad = ads[0];

  const handleAdClick = () => {
    if (ad.link_url) {
      window.open(ad.link_url, '_blank');
    }
  };

  return (
    <div className="sticky top-0 z-10 px-2 mb-3">
      <div 
        className="w-full h-20 bg-gray-200 cursor-pointer overflow-hidden rounded-lg shadow-sm"
        onClick={handleAdClick}
      >
        {ad.image_url ? (
          <img 
            src={ad.image_url} 
            alt={ad.title_uz}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center rounded-lg">
            <span className="text-gray-500 text-xs">{ad.title_uz}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AllProducts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: (data: { product_id: string; quantity: number }) =>
      apiRequest('/api/cart', {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Muvaffaqiyat",
        description: "Mahsulot savatga qo'shildi",
      });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Mahsulotni savatga qo'shishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = (productId: string, quantity: number) => {
    addToCartMutation.mutate({ product_id: productId, quantity });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <CardContent className="p-2">
              <Skeleton className="h-3 w-3/4 mb-1" />
              <Skeleton className="h-2 w-1/2 mb-1" />
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Mahsulotlar topilmadi</h3>
        <p className="text-gray-500">Mahsulotlar mavjud emas</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {products.map((product: Product) => (
          <Card 
            key={product.id} 
            className="group overflow-hidden hover:shadow-md transition-all duration-200 bg-white border border-gray-100 cursor-pointer"
            onClick={() => handleProductClick(product)}
          >
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              {product.is_rental && (
                <Badge className="absolute top-1 left-1 bg-black text-white text-xs px-1 py-0.5">
                  Ijara
                </Badge>
              )}
            </div>
            
            <CardContent className="p-2">
              <h3 className="font-medium text-gray-900 mb-1 text-xs line-clamp-2 group-hover:text-black transition-colors">
                {product.name_uz}
              </h3>
              
              <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                {product.description_uz}
              </p>
              
              <div className="flex flex-col space-y-1">
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-gray-900">
                    {Number(product.price).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    so'm/{product.unit}
                  </span>
                </div>
                
                <Button 
                  size="sm" 
                  className="bg-black hover:bg-gray-800 text-white w-full h-6 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product.id, 1);
                  }}
                  disabled={addToCartMutation.isPending}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Qo'shish
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Categories />
      <AdBanner />
      
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3">
        <div className="mb-4">
          <h1 className="text-lg font-bold text-gray-900 mb-1">
            Barcha mahsulotlar
          </h1>
          <p className="text-gray-600 text-sm">
            Qurilish materiallari va jihozlari
          </p>
        </div>
        
        <AllProducts />
      </div>
    </div>
  );
}
>>>>>>> parent of cd60d84 (Saved your changes before starting work)
