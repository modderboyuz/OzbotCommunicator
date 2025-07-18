import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Building2, 
  Wrench, 
  Truck, 
  Zap,
  Package,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import type { Category } from "@shared/schema";

const categoryIcons = {
  building: Building2,
  wrench: Wrench,
  truck: Truck,
  zap: Zap,
};

export default function Catalog() {
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = React.useState<Category | null>(null);
  
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: subcategories, isLoading: subcategoriesLoading } = useQuery({
    queryKey: ['/api/categories', selectedCategory?.id],
    enabled: !!selectedCategory,
    queryFn: async () => {
      const response = await fetch(`/api/categories?parent_id=${selectedCategory?.id}`);
      if (!response.ok) throw new Error('Subcategories fetch failed');
      return response.json();
    },
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products', selectedSubcategory?.id || selectedCategory?.id],
    enabled: !!(selectedSubcategory || selectedCategory),
    queryFn: async () => {
      const categoryId = selectedSubcategory?.id || selectedCategory?.id;
      const response = await fetch(`/api/products?category_id=${categoryId}`);
      if (!response.ok) throw new Error('Products fetch failed');
      return response.json();
    },
  });
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Katalog</h1>
            <p className="text-gray-600 mt-2">Kategoriyalar ro'yxati</p>
          </div>
          
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="w-6 h-6" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show subcategories if category is selected
  if (selectedCategory && !selectedSubcategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedCategory.name_uz}</h1>
                <p className="text-gray-600 mt-2">Sub-kategoriyalar</p>
              </div>
            </div>
          </div>

          {subcategoriesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="w-6 h-6" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Show all products from this category */}
              <Card 
                className="group hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-black"
                onClick={() => setSelectedSubcategory(selectedCategory)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Barcha {selectedCategory.name_uz} mahsulotlari
                        </h3>
                        <p className="text-sm text-gray-600">
                          Ushbu kategoriyaning barcha mahsulotlari
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
              
              {/* Show subcategories */}
              {subcategories?.map((subcategory: Category) => {
                const IconComponent = categoryIcons[subcategory.icon as keyof typeof categoryIcons] || Package;
                return (
                  <Card 
                    key={subcategory.id} 
                    className="group hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedSubcategory(subcategory)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                            <IconComponent className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-black transition-colors">
                              {subcategory.name_uz}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {subcategory.description_uz || 'Sub-kategoriya ma\'lumotlari'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show products if subcategory is selected
  if (selectedSubcategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSubcategory(null)}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedSubcategory.name_uz}</h1>
                <p className="text-gray-600 mt-2">Mahsulotlar</p>
              </div>
            </div>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <CardContent className="p-3">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products?.map((product: any) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={product.image_url || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"}
                      alt={product.name_uz}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                      {product.name_uz}
                    </h3>
                    <p className="text-sm font-semibold text-black">
                      {new Intl.NumberFormat('uz-UZ').format(Number(product.price))} so'm
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Katalog</h1>
          <p className="text-gray-600 mt-2">Kategoriyalar ro'yxati</p>
        </div>

        <div className="space-y-3">
          {categories?.filter((cat: Category) => !cat.parent_id).map((category: Category) => {
            const IconComponent = categoryIcons[category.icon as keyof typeof categoryIcons] || Package;
            return (
              <Card 
                key={category.id} 
                className="group hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                          <IconComponent className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-black transition-colors">
                            {category.name_uz}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {category.description_uz || 'Kategoriya ma\'lumotlari'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
