<script setup lang="ts">
import { ref, computed } from 'vue'
import GlassCard from '../components/ui/GlassCard.vue'
import { useSessionsStore } from '../stores/sessionsStore'
import { useTasksStore } from '../stores/tasksStore'

const sessions = useSessionsStore()
const tasksStore = useTasksStore()

type Period = 'day' | 'week' | 'month'
const period = ref<Period>('day')

const periods: { key: Period; label: string }[] = [
  { key: 'day', label: 'День' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
]

const filteredSessions = computed(() => {
  switch (period.value) {
    case 'day': return sessions.todaySessions
    case 'week': return sessions.weekSessions
    case 'month': return sessions.monthSessions
  }
})

const totalFocusTime = computed(() => {
  const total = filteredSessions.value
    .filter(s => s.status !== 'abandoned')
    .reduce((sum, s) => sum + s.actualSeconds, 0)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  if (h > 0) return `${h}ч ${m}м`
  return `${m}м`
})

const tasksCompleted = computed(() =>
  filteredSessions.value.filter(s => s.status === 'task_done_early').length
)

const sessionsCount = computed(() =>
  filteredSessions.value.filter(s => s.status !== 'abandoned').length
)

const sessionsByTask = computed(() => {
  const map = new Map<string, { title: string; seconds: number; count: number }>()
  for (const s of filteredSessions.value) {
    if (s.status === 'abandoned') continue
    if (!map.has(s.taskId)) {
      const task = tasksStore.tasks.find(t => t.id === s.taskId)
      map.set(s.taskId, { title: task?.title || 'Удалённая задача', seconds: 0, count: 0 })
    }
    const entry = map.get(s.taskId)!
    entry.seconds += s.actualSeconds
    entry.count++
  }
  return Array.from(map.values()).sort((a, b) => b.seconds - a.seconds)
})

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}ч ${m}м`
  return `${m}м`
}

const chartHeight = 200

const chartData = computed(() => {
  const map = new Map<string, number>()
  const now = new Date()
  const count = period.value === 'day' ? 24 : period.value === 'week' ? 7 : 30

  for (let i = 0; i < count; i++) {
    const d = new Date(now)
    if (period.value === 'day') {
      d.setHours(i, 0, 0, 0)
      map.set(String(d.getHours()), 0)
    } else {
      d.setDate(d.getDate() - (count - 1 - i))
      map.set(d.toISOString().slice(0, 10), 0)
    }
  }

  const relevant = period.value === 'day' ? sessions.todaySessions : period.value === 'week' ? sessions.weekSessions : sessions.monthSessions
  for (const s of relevant) {
    if (s.status === 'abandoned') continue
    if (period.value === 'day') {
      const hour = new Date(s.startedAt).getHours()
      map.set(String(hour), (map.get(String(hour)) || 0) + s.actualSeconds)
    } else {
      const date = s.startedAt.slice(0, 10)
      if (map.has(date)) map.set(date, (map.get(date) || 0) + s.actualSeconds)
    }
  }

  return Array.from(map.entries())
})

const maxValue = computed(() => Math.max(...chartData.value.map(([, v]) => v), 1))
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <h1 class="text-2xl font-semibold">Статистика</h1>

    <div class="flex gap-2">
      <button
        v-for="p in periods"
        :key="p.key"
        class="px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
        :class="period === p.key
          ? 'bg-accent text-white'
          : 'glass hover:bg-white/30 dark:hover:bg-white/10'"
        @click="period = p.key"
      >
        {{ p.label }}
      </button>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <GlassCard padding="p-5">
        <div class="text-2xl font-bold text-accent">{{ totalFocusTime }}</div>
        <div class="text-sm text-text-secondary mt-1">Время фокуса</div>
      </GlassCard>
      <GlassCard padding="p-5">
        <div class="text-2xl font-bold text-accent">{{ sessionsCount }}</div>
        <div class="text-sm text-text-secondary mt-1">Сессий</div>
      </GlassCard>
      <GlassCard padding="p-5">
        <div class="text-2xl font-bold text-accent">{{ tasksCompleted }}</div>
        <div class="text-sm text-text-secondary mt-1">Задач выполнено</div>
      </GlassCard>
    </div>

    <GlassCard padding="p-6">
      <h3 class="text-sm font-medium text-text-secondary mb-4">
        {{ period === 'day' ? 'По часам' : period === 'week' ? 'По дням' : 'По дням' }}
      </h3>
      <div class="flex items-end gap-1 h-48" style="min-height: 200px;">
        <div
          v-for="[label, value] in chartData"
          :key="label"
          class="flex-1 flex flex-col items-center gap-1"
        >
          <div
            class="w-full rounded-lg transition-all duration-500"
            :style="{
              height: Math.max(4, (value / maxValue) * (chartHeight - 20)) + 'px',
              background: value > 0 ? 'var(--color-accent)' : 'var(--color-glass-border)',
              opacity: value > 0 ? 0.8 : 0.3,
            }"
          />
          <span class="text-xs text-text-secondary">
            {{ period === 'day' ? label + 'ч' : label.slice(5) }}
          </span>
        </div>
      </div>
    </GlassCard>

    <GlassCard padding="p-6">
      <h3 class="text-sm font-medium text-text-secondary mb-4">По задачам</h3>
      <div class="space-y-3">
        <div
          v-for="item in sessionsByTask"
          :key="item.title"
          class="flex items-center justify-between"
        >
          <span class="text-sm">{{ item.title }}</span>
          <div class="flex items-center gap-3">
            <span class="text-xs text-text-secondary">{{ item.count }} сессий</span>
            <span class="text-sm font-medium text-accent">{{ formatTime(item.seconds) }}</span>
          </div>
        </div>
        <div v-if="sessionsByTask.length === 0" class="text-center py-8 text-text-secondary text-sm">
          Нет данных за выбранный период
        </div>
      </div>
    </GlassCard>
  </div>
</template>
