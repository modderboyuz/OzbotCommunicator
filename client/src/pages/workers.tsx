import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  User, 
  Phone, 
  MessageCircle,
  Wrench,
  Star
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

export default function Workers() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: workers, isLoading } = useQuery<UserType[]>({
    queryKey: ['/api/workers', searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/workers?${params}`);
      if (!response.ok) {
        throw new Error('Ustalarni yuklashda xatolik');
      }
      return response.json();
    },
  });

  const filteredWorkers = React.useMemo(() => {
    if (!workers) return [];
    if (!searchQuery.trim()) return workers;
    
    const query = searchQuery.toLowerCase();
    return workers.filter(worker => 
      worker.first_name?.toLowerCase().includes(query) ||
      worker.last_name?.toLowerCase().includes(query) ||
      worker.phone?.includes(query)
    );
  }, [workers, searchQuery]);

  const handleContactWorker = (worker: UserType) => {
    if (worker.telegram_username) {
      window.open(`https://t.me/${worker.telegram_username}`, '_blank');
    } else if (worker.phone) {
      window.open(`tel:${worker.phone}`, '_self');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ustalar</h1>
              <p className="text-gray-600 mt-1">Malakali ishchilar va mutaxassislar</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Usta nomi, mutaxassisligi bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 text-base rounded-xl border-gray-300 focus:border-black focus:ring-black"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="w-20 h-8" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Wrench className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "Qidiruv bo'yicha natija topilmadi" : "Ustalar ro'yxati bo'sh"}
            </h3>
            <p className="text-gray-600">
              {searchQuery ? "Boshqa kalit so'zlar bilan qidiring" : "Hozircha ro'yxatdan o'tgan ustalar yo'q"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWorkers.map((worker) => (
              <Card key={worker.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      
                      {/* Worker Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {worker.first_name} {worker.last_name}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            <Wrench className="h-3 w-3 mr-1" />
                            Usta
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {(worker as any).specialization && (
                            <div className="flex items-center space-x-1">
                              <Wrench className="h-4 w-4" />
                              <span>{(worker as any).specialization}</span>
                            </div>
                          )}
                          
                          {(worker as any).phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{(worker as any).phone}</span>
                            </div>
                          )}
                          
                          {worker.telegram_username && (
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>@{worker.telegram_username}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Actions */}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContactWorker(worker)}
                        className="flex items-center space-x-1"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Bog'lanish</span>
                      </Button>
                    </div>
                  </div>

                  {/* Additional worker info could go here */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Ro'yxatdan o'tgan: {new Date(worker.created_at).toLocaleDateString('uz-UZ')}
                      </span>
                      
                      {/* Rating placeholder */}
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-gray-600">4.8</span>
                        <span className="text-gray-400 text-xs">(24 baho)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
