import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      updateUser: (user) => set({ user }),
    }),
    { name: 'auth-storage' }
  )
)

export const useAppStore = create((set) => ({
  // Language
  language: 'English',
  setLanguage: (lang) => set({ language: lang }),

  // Prediction / organ state
  prediction: null,
  setPrediction: (prediction) => set({ prediction }),

  // Selected organ for detail view
  selectedOrgan: 'lungs',
  setSelectedOrgan: (organ) => set({ selectedOrgan: organ }),

  // Urge modal
  urgeModalOpen: false,
  setUrgeModalOpen: (val) => set({ urgeModalOpen: val }),

  // Organ speaking state
  organSpeaking: null,
  setOrganSpeaking: (organ) => set({ organSpeaking: organ }),

  // Notifications
  notifications: [],
  addNotification: (notif) =>
    set((state) => ({ notifications: [notif, ...state.notifications.slice(0, 9)] })),
  clearNotifications: () => set({ notifications: [] }),
}))
