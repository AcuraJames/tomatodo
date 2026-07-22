<script setup lang="ts">
import { useRouter } from 'vue-router'
import GlassButton from '../components/ui/GlassButton.vue'

const router = useRouter()
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh] text-center">
    <div class="space-y-6">
      <div class="text-8xl font-bold text-accent/20 select-none">404</div>
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold text-text">Страница не найдена</h1>
        <p class="text-text-secondary">Похоже, этой страницы здесь нет. Может, она где-то в другом саду?</p>
      </div>
      <div class="flex gap-3 justify-center">
        <GlassButton size="lg" @click="router.push('/')">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          На главную
        </GlassButton>
        <GlassButton variant="secondary" size="lg" @click="router.back()">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Назад
        </GlassButton>
      </div>
    </div>
  </div>
</template>
