"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
} from "lucide-react"
import { supabase, type User as UserType, type WorkerApplication } from "@/lib/supabase"

interface WorkerApplicationWithUsers extends WorkerApplication {
  client: UserType
  worker: UserType
}

export default function WorkerApplicationsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [user, setUser] = useState<UserType | null>(null)
  const [applications, setApplications] = useState<WorkerApplicationWithUsers[]>([])
  const [workers, setWorkers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    worker_id: "",
    title: "",
    description: "",
    location: "",
    budget: "",
    urgency: "medium" as "low" | "medium" | "high",
    contact_phone: "",
    preferred_date: "",
    notes: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const telegramId = localStorage.getItem("telegram_id")
      if (!telegramId) {
        router.push("/")
        return
      }

      // Get user
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", Number.parseInt(telegramId))
        .single()

      if (userError || !userData) {
        router.push("/")
        return
      }

      setUser(userData)

      // Load applications based on user role
      if (userData.role === "worker") {
        // Load applications sent to this worker
        const { data: applicationsData, error: appsError } = await supabase
          .from("worker_applications")
          .select(`
            *,
            client:users!worker_applications_client_id_fkey(*),
            worker:users!worker_applications_worker_id_fkey(*)
          `)
          .eq("worker_id", userData.id)
          .order("created_at", { ascending: false })

        if (appsError) {
          console.error("Applications fetch error:", appsError)
        } else {
          setApplications(applicationsData || [])
        }
      } else {
        // Load applications sent by this client
        const { data: applicationsData, error: appsError } = await supabase
          .from("worker_applications")
          .select(`
            *,
            client:users!worker_applications_client_id_fkey(*),
            worker:users!worker_applications_worker_id_fkey(*)
          `)
          .eq("client_id", userData.id)
          .order("created_at", { ascending: false })

        if (appsError) {
          console.error("Applications fetch error:", appsError)
        } else {
          setApplications(applicationsData || [])
        }

        // Load workers for the form
        const { data: workersData, error: workersError } = await supabase
          .from("users")
          .select("*")
          .eq("role", "worker")
          .eq("is_active", true)
          .order("first_name")

        if (workersError) {
          console.error("Workers fetch error:", workersError)
        } else {
          setWorkers(workersData || [])
        }
      }
    } catch (error) {
      console.error("Load error:", error)
    } finally {
      setLoading(false)
    }
  }

  const createApplication = async () => {
    if (!user || !formData.worker_id || !formData.title || !formData.description) {
      toast({
        title: "Xatolik",
        description: "Majburiy maydonlarni to'ldiring",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("worker_applications").insert({
        client_id: user.id,
        worker_id: formData.worker_id,
        title: formData.title,
        description: formData.description,
        location: formData.location || null,
        budget: formData.budget ? Number.parseFloat(formData.budget) : null,
        urgency: formData.urgency,
        contact_phone: formData.contact_phone || null,
        preferred_date: formData.preferred_date || null,
        notes: formData.notes || null,
      })

      if (error) {
        toast({
          title: "Xatolik",
          description: "Ariza yuborishda xatolik",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Muvaffaqiyat",
        description: "Ariza muvaffaqiyatli yuborildi",
      })

      setShowCreateForm(false)
      setFormData({
        worker_id: "",
        title: "",
        description: "",
        location: "",
        budget: "",
        urgency: "medium",
        contact_phone: "",
        preferred_date: "",
        notes: "",
      })

      loadData()
    } catch (error) {
      console.error("Create application error:", error)
      toast({
        title: "Xatolik",
        description: "Ariza yuborishda xatolik",
        variant: "destructive",
      })
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: "accepted" | "rejected" | "completed") => {
    try {
      const { error } = await supabase.from("worker_applications").update({ status }).eq("id", applicationId)

      if (error) {
        toast({
          title: "Xatolik",
          description: "Statusni yangilashda xatolik",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Muvaffaqiyat",
        description: "Status yangilandi",
      })

      loadData()
    } catch (error) {
      console.error("Update status error:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "accepted":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Kutilmoqda"
      case "accepted":
        return "Qabul qilindi"
      case "rejected":
        return "Rad etildi"
      case "completed":
        return "Bajarildi"
      default:
        return status
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case "low":
        return "Past"
      case "medium":
        return "O'rta"
      case "high":
        return "Yuqori"
      default:
        return urgency
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {user?.role === "worker" ? "Kelib tushgan arizalar" : "Yuborgan arizalar"}
          </h1>
        </div>

        {user?.role !== "worker" && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Send className="h-4 w-4 mr-2" />
            Ariza yuborish
          </Button>
        )}
      </div>

      {/* Create Application Form */}
      {showCreateForm && user?.role !== "worker" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Yangi ariza yuborish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="worker">Usta *</Label>
              <Select
                value={formData.worker_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, worker_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ustani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.first_name} {worker.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Sarlavha *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ish sarlavhasi"
              />
            </div>

            <div>
              <Label htmlFor="description">Tavsif *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Ish haqida batafsil ma'lumot"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Manzil</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Ish manzili"
                />
              </div>

              <div>
                <Label htmlFor="budget">Byudjet (so'm)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
                  placeholder="Taxminiy narx"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="urgency">Muhimlik darajasi</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setFormData((prev) => ({ ...prev, urgency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Past</SelectItem>
                    <SelectItem value="medium">O'rta</SelectItem>
                    <SelectItem value="high">Yuqori</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contact_phone">Bog'lanish telefoni</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="+998901234567"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="preferred_date">Afzal sana</Label>
              <Input
                id="preferred_date"
                type="datetime-local"
                value={formData.preferred_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, preferred_date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="notes">Qo'shimcha izoh</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Qo'shimcha ma'lumot"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={createApplication} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Yuborish
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Bekor qilish
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applications List */}
      {applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Send className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Arizalar yo'q</h2>
            <p className="text-gray-600">
              {user?.role === "worker" ? "Hozircha sizga ariza yo'q" : "Hozircha ariza yubormagansiz"}
            </p>
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
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {user?.role === "worker"
                          ? `${application.client.first_name} ${application.client.last_name}`
                          : `${application.worker.first_name} ${application.worker.last_name}`}
                      </div>
                      {(user?.role === "worker" ? application.client.phone : application.worker.phone) && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {user?.role === "worker" ? application.client.phone : application.worker.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={`${getStatusColor(application.status)} flex items-center gap-1`}>
                      {getStatusIcon(application.status)}
                      {getStatusText(application.status)}
                    </Badge>
                    <Badge className={`${getUrgencyColor(application.urgency)} flex items-center gap-1`}>
                      <AlertTriangle className="h-3 w-3" />
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
                      <span>Byudjet: {formatPrice(Number.parseFloat(application.budget.toString()))}</span>
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

                {/* Action buttons for workers */}
                {user?.role === "worker" && application.status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => updateApplicationStatus(application.id, "accepted")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Qabul qilish
                    </Button>
                    <Button
                      onClick={() => updateApplicationStatus(application.id, "rejected")}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rad etish
                    </Button>
                  </div>
                )}

                {user?.role === "worker" && application.status === "accepted" && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => updateApplicationStatus(application.id, "completed")}
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
  )
}
