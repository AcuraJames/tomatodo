import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Theme = 'light' | 'dark'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<Theme>('light')
  const soundEnabled = ref(true)
  const musicEnabled = ref(false)
  const volume = ref(0.5)
  const sidebarCollapsed = ref(false)
  const autoStartNextSession = ref(true)

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  function setTheme(t: Theme) {
    theme.value = t
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return {
    theme, soundEnabled, musicEnabled, volume, sidebarCollapsed, autoStartNextSession,
    toggleTheme, setTheme, toggleSidebar,
  }
}, {
  persist: true,
})
