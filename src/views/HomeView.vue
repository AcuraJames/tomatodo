<script setup lang="ts">
import { useRouter } from 'vue-router'
import GlassCard from '../components/ui/GlassCard.vue'
import GlassButton from '../components/ui/GlassButton.vue'
import { useTasksStore } from '../stores/tasksStore'
import { computed } from 'vue'

const router = useRouter()
const tasks = useTasksStore()

const activeCount = computed(() => tasks.activeTasks.length)
const doneCount = computed(() => tasks.tasks.filter(t => t.status === 'done').length)
</script>

<template>
  <div class="max-w-2xl mx-auto pt-12 space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-5xl font-bold tracking-tight">
        <span class="text-accent">Tomatodo</span>
      </h1>
      <p class="text-text-secondary text-lg">
        Фокусируйся на задачах. Расти свой сад.
      </p>
    </div>

    <GlassCard variant="strong" padding="p-8">
      <div class="flex items-center justify-around text-center">
        <div>
          <div class="text-3xl font-bold text-accent">{{ activeCount }}</div>
          <div class="text-sm text-text-secondary mt-1">Активных задач</div>
        </div>
        <div class="w-px h-12 bg-glass-border" />
        <div>
          <div class="text-3xl font-bold text-accent">{{ doneCount }}</div>
          <div class="text-sm text-text-secondary mt-1">Выполнено</div>
        </div>
      </div>
    </GlassCard>

    <div class="flex flex-col gap-3">
      <GlassButton size="lg" @click="router.push('/timer')">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Начать фокус
      </GlassButton>
      <GlassButton variant="ghost" size="lg" @click="router.push('/tasks')">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        Управлять задачами
      </GlassButton>
    </div>
  </div>
</template>
