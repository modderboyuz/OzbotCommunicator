import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { ProductDetailModal } from "@/components/product/product-detail-modal";
import { CategoryNav } from "@/components/layout/category-nav";
import { ProductGrid } from "@/components/product/product-grid";
import { 
  Search,
  Building2, 
  Wrench, 
  Truck, 
  Zap,
  ShoppingCart,
  Package
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
      <div className="px-4 py-2 mb-6">
        <div className="flex justify-center">
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="w-12 h-3 mt-2 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 mb-6">
      <div className="flex justify-center">
        <div className="flex space-x-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories?.slice(0, 6).map((category: Category) => {
            const IconComponent = categoryIcons[category.icon as keyof typeof categoryIcons] || Package;
            return (
              <Link key={category.id} href={`/catalog?category=${category.id}`}>
                <div className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer group">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-700 text-center w-14 truncate">
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
  const [currentAdIndex, setCurrentAdIndex] = React.useState(0);
  const { data: ads } = useQuery({
    queryKey: ['/api/ads'],
  });

  // Auto-rotate ads every 3 seconds
  React.useEffect(() => {
    if (ads && ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex(prev => (prev + 1) % ads.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [ads]);
  if (!ads || ads.length === 0) {
    return null;
  }

  const ad = ads[currentAdIndex];

  const handleAdClick = () => {
    if (ad.link_url) {
      window.open(ad.link_url, '_blank');
    }
  };

  return (
    <div className="px-4 mb-6">
      <div 
        className="w-full h-20 bg-gradient-to-r from-gray-900 to-gray-700 cursor-pointer overflow-hidden rounded-xl relative"
        onClick={handleAdClick}
      >
        <div className="w-full h-full flex items-center justify-between p-4 text-white">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">{ad.title_uz}</h3>
            <p className="text-sm text-gray-200">{ad.description_uz}</p>
          </div>
          <div className="ml-4">
            <div className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
              Ko'rish
            </div>
          </div>
        </div>
        
        {/* Dots indicator */}
        {ads.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {ads.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentAdIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AllProducts() {
  const [page, setPage] = React.useState(1);
  const PRODUCTS_PER_PAGE = 30;
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Shuffle products for mixed display
  const shuffledProducts = React.useMemo(() => {
    if (!products) return [];
    return [...products].sort(() => Math.random() - 0.5);
  }, [products]);

  const displayedProducts = shuffledProducts.slice(0, page * PRODUCTS_PER_PAGE);
  const hasMore = shuffledProducts.length > displayedProducts.length;
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = (productId: string, quantity: number) => {
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', { productId, quantity });
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square bg-gray-200">
              <Skeleton className="w-full h-full" />
            </div>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-3" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!shuffledProducts || shuffledProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Mahsulotlar topilmadi
        </h3>
        <p className="text-gray-500">
          Hozircha bu kategoriyada mahsulotlar yo'q.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {displayedProducts.map((product: Product) => (
          <Card 
            key={product.id} 
            className="group overflow-hidden hover:shadow-md transition-all duration-200 bg-white border border-gray-100 cursor-pointer"
            onClick={() => handleProductClick(product)}
          >
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
              <img
                src={product.image_url || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"}
                alt={product.name_uz}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400";
                }}
              />
              {product.is_rental && (
                <Badge className="absolute top-1 left-1 bg-black text-white text-xs px-1 py-0.5">
                  Ijara
                </Badge>
              )}
            </div>
            
            <CardContent className="p-3">
              <h3 className="font-medium text-gray-900 mb-1 text-sm line-clamp-2 group-hover:text-black transition-colors">
                {product.name_uz}
              </h3>
              
              <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                {product.description_uz}
              </p>
              
              <div className="flex flex-col space-y-2">
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-gray-900">
                    {Number(product.price).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    so'm/{product.unit}
                  </span>
                </div>
                
                <Button 
                  size="sm" 
                  className="bg-black hover:bg-gray-800 text-white w-full h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product.id, 1);
                  }}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Qo'shish
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-8">
          <Button
            onClick={loadMore}
            variant="outline"
            size="lg"
            className="px-8 py-3 rounded-xl"
          >
            Yana boshqalar
          </Button>
        </div>
      )}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();

  // Get search query from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryNav 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdBanner />
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {searchQuery ? `"${searchQuery}" qidiruv natijalari` :
             selectedCategory ? 'Katalog' : 'Barcha mahsulotlar'}
          </h1>
          <p className="text-gray-600">
            Qurilish materiallari va jihozlari
          </p>
        </div>
        
        <ProductGrid categoryId={selectedCategory} searchQuery={searchQuery} />
      </div>
    </div>
  );
}
