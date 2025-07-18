import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { queryClient } from '@/lib/query-client.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ClipboardList, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Calendar,
  CheckCircle,
  XCircle,
  DollarSign
} from 'lucide-react';
import type { WorkerApplication } from '@shared/schema';

export default function WorkerApplications() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch worker applications
  const { data: applications, isLoading } = useQuery<WorkerApplication[]>({
    queryKey: ['/api/worker-applications'],
    enabled: !!user && user.role === 'worker',
    queryFn: async () => {
      const response = await fetch('/api/worker-applications', {
        headers: {
          'x-telegram-id': user?.telegram_id?.toString() || '',
        },
      });
      if (!response.ok) {
        throw new Error('Arizalarni yuklashda xatolik');
      }
      return response.json();
    },
  });

  // Update application status
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/worker-applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-id': user?.telegram_id?.toString() || '',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Ariza statusini yangilashda xatolik');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worker-applications'] });
      toast({
        title: "Muvaffaqiyat",
        description: "Ariza statusi yangilandi",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Kutilmoqda';
      case 'accepted': return 'Qabul qilindi';
      case 'rejected': return 'Rad etildi';
      case 'completed': return 'Bajarildi';
      default: return status;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'Past';
      case 'medium': return 'O\'rta';
      case 'high': return 'Yuqori';
      default: return urgency;
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('uz-UZ').format(Number(price)) + " so'm";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Arizalar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <ClipboardList className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Menga kelgan arizalar</h1>
      </div>

      {!applications || applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Arizalar mavjud emas</h2>
            <p className="text-gray-600">Hozircha sizga ariza yo'q</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <Card key={application.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{application.title}</CardTitle>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(application.status)}>
                      {getStatusText(application.status)}
                    </Badge>
                    <Badge className={getUrgencyColor(application.urgency)}>
                      {getUrgencyText(application.urgency)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <p className="text-gray-700 leading-relaxed">{application.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {application.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{application.location}</span>
                    </div>
                  )}
                  
                  {application.budget && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>Byudjet: {formatPrice(application.budget)}</span>
                    </div>
                  )}
                  
                  {application.preferred_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Afzal sana: {formatDate(application.preferred_date)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>Yuborilgan: {formatDate(application.created_at)}</span>
                  </div>
                </div>

                {application.contact_phone && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Bog'lanish uchun:</span>
                      <a href={`tel:${application.contact_phone}`} className="text-blue-600 underline">
                        {application.contact_phone}
                      </a>
                    </div>
                  </div>
                )}

                {application.notes && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>Qo'shimcha ma'lumot:</strong> {application.notes}
                    </p>
                  </div>
                )}

                {application.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => updateApplicationMutation.mutate({ id: application.id, status: 'accepted' })}
                      disabled={updateApplicationMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Qabul qilish
                    </Button>
                    <Button
                      onClick={() => updateApplicationMutation.mutate({ id: application.id, status: 'rejected' })}
                      disabled={updateApplicationMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rad etish
                    </Button>
                  </div>
                )}

                {application.status === 'accepted' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => updateApplicationMutation.mutate({ id: application.id, status: 'completed' })}
                      disabled={updateApplicationMutation.isPending}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Bajarildi deb belgilash
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}