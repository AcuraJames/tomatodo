<script setup lang="ts">
import { computed, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import GlassCard from '../components/ui/GlassCard.vue'
import GlassButton from '../components/ui/GlassButton.vue'
import KoiFishCanvas from '../components/timer/KoiFishCanvas.vue'
import ZenBackground from '../components/zen/ZenBackground.vue'
import BonsaiTree from '../components/zen/BonsaiTree.vue'
import EnsoCircle from '../components/zen/EnsoCircle.vue'
import { useTimerStore, FOCUS_OPTIONS } from '../stores/timerStore'
import { useTasksStore } from '../stores/tasksStore'
import { useSessionsStore } from '../stores/sessionsStore'
import { useZenStore } from '../stores/zenStore'
import { useSettingsStore } from '../stores/settingsStore'

const timer = useTimerStore()
const tasksStore = useTasksStore()
const sessionsStore = useSessionsStore()
const zenStore = useZenStore()
const settings = useSettingsStore()
const route = useRoute()

let interval: ReturnType<typeof setInterval> | null = null

const activeTasksList = computed(() => tasksStore.activeTasks)

const progress = computed(() => {
  const total = timer.selectedDuration * 60
  return total > 0 ? ((total - timer.remaining) / total) : 0
})

const displayTime = computed(() => {
  const m = Math.floor(timer.remaining / 60)
  const s = timer.remaining % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const showZenToggle = computed(() => timer.zenMode && timer.status === 'running' ? false : timer.status === 'idle')

function getSelectStyle() {
  if (timer.zenMode) {
    const isDark = settings.theme === 'dark'
    return {
      background: isDark ? '#1a1a2e' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#1a1a2e',
      border: isDark ? '1px solid #4b5563' : '1px solid #d1d5db',
    }
  }
  return {
    background: settings.theme === 'dark' ? '#1a1a2e' : '#ffffff',
    color: settings.theme === 'dark' ? '#e2e8f0' : '#1a1a2e',
    border: settings.theme === 'dark' ? '1px solid #4b5563' : '1px solid #d1d5db',
  }
}

// Handle ?task= query param
const queryTaskId = computed(() => route.query.task as string)
watch(queryTaskId, (id) => {
  if (id) timer.setActiveTask(id)
}, { immediate: true })

function startTimer() {
  timer.start()

  const session = {
    id: crypto.randomUUID(),
    taskId: timer.activeTaskId || '',
    plannedDuration: timer.selectedDuration,
    actualSeconds: 0,
    mode: 'focus' as const,
    status: 'completed' as const,
    startedAt: new Date().toISOString(),
  }
  sessionsStore.addSession(session)
  timer.setSessionId(session.id)

  interval = setInterval(() => {
    timer.tick()
    const s = sessionsStore.sessions.find(s => s.id === timer.activeSessionId)
    if (s) s.actualSeconds++
  }, 1000)
}

function pauseTimer() {
  timer.pause()
  if (interval) clearInterval(interval)
  interval = null
}

function resumeTimer() {
  timer.resume()
  interval = setInterval(() => {
    timer.tick()
    const s = sessionsStore.sessions.find(s => s.id === timer.activeSessionId)
    if (s) s.actualSeconds++
  }, 1000)
}

function stopTimer() {
  if (interval) clearInterval(interval)
  interval = null
  const session = sessionsStore.sessions.find(s => s.id === timer.activeSessionId)
  if (session) {
    session.endedAt = new Date().toISOString()
    session.status = 'abandoned'
  }
  timer.reset()
}

watch(() => timer.remaining, (val) => {
  if (val <= 0 && timer.status === 'running') {
    if (interval) clearInterval(interval)
    interval = null
    const session = sessionsStore.sessions.find(s => s.id === timer.activeSessionId)
    if (session) {
      session.endedAt = new Date().toISOString()
      session.status = 'completed'
    }
    if (timer.activeTaskId) {
      tasksStore.addSeconds(timer.activeTaskId, timer.selectedDuration * 60)
    }
  }
})

function completeTaskEarly() {
  if (timer.status === 'idle') return
  if (interval) clearInterval(interval)
  interval = null

  const session = sessionsStore.sessions.find(s => s.id === timer.activeSessionId)
  const actualSeconds = timer.selectedDuration * 60 - timer.remaining

  if (session) {
    session.endedAt = new Date().toISOString()
    session.status = 'task_done_early'
    session.actualSeconds = actualSeconds
  }

  if (timer.activeTaskId) {
    tasksStore.addSeconds(timer.activeTaskId, actualSeconds)
    const task = tasksStore.tasks.find(t => t.id === timer.activeTaskId)
    if (task) {
      zenStore.plantTree({
        id: crypto.randomUUID(),
        taskId: task.id,
        taskTitle: task.title,
        treeState: '{}',
        plantedAt: new Date().toISOString(),
      })
      tasksStore.completeTask(task.id)
    }
  }

  timer.reset()
}

function handleVisibilityChange() {
  if (document.hidden && timer.status === 'running') {
    stopTimer()
  }
}

document.addEventListener('visibilitychange', handleVisibilityChange)

onUnmounted(() => {
  if (interval) clearInterval(interval)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div class="relative h-full">
      <ZenBackground
      v-if="timer.zenMode"
      :progress="progress"
      :is-dark="settings.theme === 'dark'"
    />

    <div
      class="flex flex-col items-center pt-6"
      :class="timer.zenMode ? 'relative z-10' : ''"
    >
      <!-- Zen toggle -->
      <div v-if="showZenToggle" class="mb-4">
        <label class="flex items-center gap-3 cursor-pointer">
          <button
            class="relative w-10 h-5 rounded-full transition-colors duration-200 border flex items-center px-0.5"
            :class="timer.zenMode ? 'bg-accent border-accent' : 'bg-white/80 dark:bg-[#1a1a2e] border-gray-400 dark:border-gray-500'"
            @click="timer.toggleZen()"
          >
            <div
              class="w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
              :class="timer.zenMode ? 'translate-x-[18px]' : 'translate-x-0'"
            />
          </button>
          <span class="text-sm text-text-secondary">Zen mode</span>
        </label>
      </div>

      <!-- Timer circle -->
      <GlassCard variant="strong" padding="p-8" class="relative inline-block overflow-visible">
        <KoiFishCanvas v-if="!timer.zenMode" :progress="progress" />
        <div class="relative flex flex-col items-center gap-6" style="z-index: 10;">
          <div class="relative w-56 h-56">
            <!-- Regular progress circle (non-Zen) -->
            <template v-if="!timer.zenMode">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="3" class="text-glass-border" />
                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  class="text-accent"
                  stroke-linecap="round"
                  :stroke-dasharray="2 * Math.PI * 45"
                  :stroke-dashoffset="2 * Math.PI * 45 * (1 - progress)"
                  style="transition: stroke-dashoffset 0.5s linear"
                />
              </svg>
            </template>
            <!-- Enso canvas (Zen mode) -->
            <EnsoCircle v-else :progress="progress" :size="224" />
            <div class="absolute inset-0 flex flex-col items-center justify-center" style="z-index: 10;">
              <span class="text-5xl font-bold tracking-tight font-mono">{{ displayTime }}</span>
              <span class="text-sm text-text-secondary mt-2">
                {{ timer.status === 'idle' ? 'Готов к фокусу' : timer.status === 'running' ? 'Фокусируюсь' : timer.status === 'paused' ? 'Пауза' : 'Готово' }}
              </span>
            </div>
          </div>

          <div v-if="timer.status === 'idle'" class="flex gap-2">
            <button
              v-for="opt in FOCUS_OPTIONS"
              :key="opt.value"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
              :class="timer.selectedDuration === opt.value
                ? 'bg-accent text-white'
                : 'glass hover:bg-white/30 dark:hover:bg-white/10'"
              @click="timer.setDuration(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </GlassCard>

      <!-- Task selector -->
      <GlassCard v-if="timer.status === 'idle'" padding="p-5" class="mt-4 w-full max-w-md">
        <div class="space-y-2">
          <label class="text-sm font-medium text-text-secondary">Задача (необязательно)</label>
          <select
            class="w-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/50 rounded-xl appearance-none cursor-pointer"
            :style="getSelectStyle()"
            :value="timer.activeTaskId || ''"
            @change="timer.setActiveTask(($event.target as HTMLSelectElement).value || null)"
          >
            <option value="">— без задачи —</option>
            <option v-for="t in activeTasksList" :key="t.id" :value="t.id">
              {{ t.title }}
            </option>
          </select>
        </div>
      </GlassCard>

      <!-- Bonsai (Zen mode) -->
      <div v-if="timer.zenMode && timer.status !== 'idle'" class="mt-4 w-full max-w-[180px] mx-auto">
        <BonsaiTree :progress="progress" />
      </div>

      <!-- Controls -->
      <div class="flex justify-center gap-3" :class="timer.zenMode && timer.status !== 'idle' ? 'mt-2' : 'mt-5'">
        <template v-if="timer.status === 'idle'">
          <GlassButton size="lg" @click="startTimer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Старт
          </GlassButton>
        </template>
        <template v-else-if="timer.status === 'running'">
          <GlassButton variant="secondary" size="lg" @click="pauseTimer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
            Пауза
          </GlassButton>
          <GlassButton variant="secondary" size="lg" :disabled="!timer.activeTaskId" @click="completeTaskEarly">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>
            Готово
          </GlassButton>
        </template>
        <template v-else-if="timer.status === 'paused'">
          <GlassButton size="lg" @click="resumeTimer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Продолжить
          </GlassButton>
          <GlassButton variant="ghost" size="lg" @click="stopTimer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
            Остановить
          </GlassButton>
        </template>
      </div>
    </div>
  </div>
</template>
