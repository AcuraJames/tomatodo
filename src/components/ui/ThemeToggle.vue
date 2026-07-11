<script setup lang="ts">
import { useTheme } from '../../composables/useTheme'

const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    class="p-2 rounded-xl glass hover:bg-white/30 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer"
    @click="toggle"
    :title="isDark ? 'Светлая тема' : 'Тёмная тема'"
  >
    <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  </button>
</template>
