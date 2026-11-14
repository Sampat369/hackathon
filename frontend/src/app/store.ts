import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface AppState {
  theme: Theme
  activeCaseId: string | null
  searchOpen: boolean
  sidebarCollapsed: boolean

  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setActiveCaseId: (id: string | null) => void
  setSearchOpen: (open: boolean) => void
  toggleSearch: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      activeCaseId: null,
      searchOpen: false,
      sidebarCollapsed: false,

      setTheme: (theme) => {
        set({ theme })
        document.documentElement.classList.toggle('dark', theme === 'dark')
      },

      toggleTheme: () => {
        const next: Theme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: next })
        document.documentElement.classList.toggle('dark', next === 'dark')
      },

      setActiveCaseId: (id) => set({ activeCaseId: id }),

      setSearchOpen: (open) => set({ searchOpen: open }),

      toggleSearch: () => set(s => ({ searchOpen: !s.searchOpen })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: 'evidenceiq-app',
      partialize: (state) => ({ theme: state.theme, sidebarCollapsed: state.sidebarCollapsed }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle('dark', state.theme === 'dark')
        }
      },
    }
  )
)
