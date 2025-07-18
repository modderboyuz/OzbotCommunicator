"use client"

import { create } from "zustand"

interface BottomNavStore {
  isVisible: boolean
  hide: () => void
  show: () => void
}

export const useBottomNav = create<BottomNavStore>((set) => ({
  isVisible: true,
  hide: () => set({ isVisible: false }),
  show: () => set({ isVisible: true }),
}))
