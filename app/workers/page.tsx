"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"

interface Worker {
  id: string
  first_name: string
  last_name?: string
  username?: string
  phone?: string
  work_type: string
  description?: string
  average_pay?: number
  address?: string
  profile_image?: string
  rating: number
  completed_jobs: number
  is_available: boolean
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedWorkType, setSelectedWorkType] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("rating")
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  const workTypes = [
    "Payvandchi",
    "Qurilishchi", 
    "Elektrik",
    "Santexnik",
    "Usta",
    "Boshqa"
  ]

  const sortOptions = [
    { value: "rating", label: "Reyting bo'yicha" },
    { value: "price_low", label: "Arzon narxdan" },
    { value: "price_high", label: "Qimmat narxdan" },
    { value: "experience", label: "Tajriba bo'yicha" },
  ]

  useEffect(() => {
    loadWorkers()
  }, [selectedWorkType, searchQuery, sortBy])

  const loadWorkers = async () => {
