import { computed, watch } from 'vue'
import { useSettingsStore } from '../stores/settingsStore'

export function useTheme() {
  const settings = useSettingsStore()

  const isDark = computed(() => settings.theme === 'dark')

  watch(isDark, (val) => {
    document.documentElement.classList.toggle('dark', val)
  }, { immediate: true })

  function toggle() {
    settings.toggleTheme()
  }

  return { isDark, toggle }
}
