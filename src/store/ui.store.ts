import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '@/i18n'
import type { Language, Direction } from '@/types/api.types'

interface UIStore {
  language: Language
  dir: Direction
  darkMode: boolean
  sidebarOpen: boolean
  setLanguage: (lang: Language) => void
  toggleDarkMode: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      language: 'fr',
      dir: 'ltr',
      darkMode: false,
      sidebarOpen: true,

      setLanguage: (lang) => {
        const dir: Direction = lang === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.dir = dir
        document.documentElement.lang = lang
        i18n.changeLanguage(lang)
        set({ language: lang, dir })
      },

      toggleDarkMode: () =>
        set((s) => {
          document.documentElement.classList.toggle('dark', !s.darkMode)
          return { darkMode: !s.darkMode }
        }),

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    { name: 'rl-ui', partialize: (s) => ({ language: s.language, dir: s.dir, darkMode: s.darkMode }) },
  ),
)
