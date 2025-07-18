import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  User, 
  Phone, 
  MessageCircle,
  Star,
  Send,
  Calendar,
  MapPin,
  DollarSign
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface WorkerWithRating extends UserType {
  average_rating: number;
  review_count: number;
}

export default function Workers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedWorker, setSelectedWorker] = React.useState<WorkerWithRating | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = React.useState(false);
  const [applicationForm, setApplicationForm] = React.useState({
    title: '',
    description: '',
    location: '',
    budget: '',
    urgency: 'medium',
    contact_phone: user?.phone || '',
    preferred_date: '',
    notes: ''
  });

  const { data: workers, isLoading } = useQuery<WorkerWithRating[]>({
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

  const handleContactWorker = (worker: WorkerWithRating) => {
    if (worker.telegram_username) {
      window.open(`https://t.me/${worker.telegram_username}`, '_blank');
    } else if (worker.phone) {
      window.open(`tel:${worker.phone}`, '_self');
    }
  };

  const handleSendApplication = (worker: WorkerWithRating) => {
    if (!user) {
      toast({
        title: "Xatolik",
        description: "Ariza yuborish uchun tizimga kiring",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedWorker(worker);
    setApplicationForm(prev => ({
      ...prev,
      contact_phone: user.phone || ''
    }));
    setIsApplicationModalOpen(true);
  };

  const submitApplication = async () => {
    if (!selectedWorker || !user) return;

    try {
      const response = await fetch('/api/worker-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-id': user.telegram_id?.toString() || '',
        },
        body: JSON.stringify({
          ...applicationForm,
          worker_id: selectedWorker.id,
          budget: applicationForm.budget ? Number(applicationForm.budget) : null,
          preferred_date: applicationForm.preferred_date ? new Date(applicationForm.preferred_date).toISOString() : null
        }),
      });

      if (response.ok) {
        toast({
          title: "Muvaffaqiyat",
          description: "Ariza muvaffaqiyatli yuborildi!",
        });
        setIsApplicationModalOpen(false);
        setApplicationForm({
          title: '',
          description: '',
          location: '',
          budget: '',
          urgency: 'medium',
          contact_phone: user?.phone || '',
          preferred_date: '',
          notes: ''
        });
      } else {
        throw new Error('Ariza yuborishda xatolik');
      }
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Ariza yuborishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  return (
    <>
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
                <User className="mx-auto h-12 w-12" />
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
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {worker.description && (
                              <span>{worker.description}</span>
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
                        <Button
                          size="sm"
                          onClick={() => handleSendApplication(worker)}
                          className="flex items-center space-x-1 bg-black text-white hover:bg-gray-800"
                        >
                          <Send className="h-4 w-4" />
                          <span>Ariza yuborish</span>
                        </Button>
                      </div>
                    </div>

                    {/* Additional worker info */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Ro'yxatdan o'tgan: {new Date(worker.created_at).toLocaleDateString('uz-UZ')}
                        </span>
                        
                        {/* Rating */}
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-gray-600">{worker.average_rating.toFixed(1)}</span>
                          <span className="text-gray-400 text-xs">({worker.review_count} baho)</span>
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

      {/* Application Modal */}
      <Dialog open={isApplicationModalOpen} onOpenChange={setIsApplicationModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedWorker?.first_name} {selectedWorker?.last_name} ga ariza yuborish
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Ish nomi</Label>
              <Input
                id="title"
                value={applicationForm.title}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Masalan: Metall darvoza yasash"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Ish tavsifi</Label>
              <Textarea
                id="description"
                value={applicationForm.description}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ishning batafsil tavsifi..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Manzil</Label>
                <Input
                  id="location"
                  value={applicationForm.location}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ish manzili"
                />
              </div>
              
              <div>
                <Label htmlFor="budget">Byudjet (so'm)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={applicationForm.budget}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="contact_phone">Telefon raqam</Label>
              <Input
                id="contact_phone"
                value={applicationForm.contact_phone}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                placeholder="+998901234567"
              />
            </div>
            
            <div>
              <Label htmlFor="preferred_date">Afzal sana</Label>
              <Input
                id="preferred_date"
                type="datetime-local"
                value={applicationForm.preferred_date}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, preferred_date: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Qo'shimcha ma'lumot</Label>
              <Textarea
                id="notes"
                value={applicationForm.notes}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Qo'shimcha talablar yoki ma'lumotlar..."
                rows={2}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsApplicationModalOpen(false)}
                className="flex-1"
              >
                Bekor qilish
              </Button>
              <Button
                onClick={submitApplication}
                disabled={!applicationForm.title || !applicationForm.description}
                className="flex-1 bg-black text-white hover:bg-gray-800"
              >
                Ariza yuborish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}