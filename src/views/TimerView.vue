<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import GlassCard from '../components/ui/GlassCard.vue'
import GlassButton from '../components/ui/GlassButton.vue'
import Tag from '../components/ui/Tag.vue'
import CalendarPicker from '../components/ui/CalendarPicker.vue'
import KoiFishCanvas from '../components/timer/KoiFishCanvas.vue'
import ZenBackground from '../components/zen/ZenBackground.vue'
import BonsaiTree from '../components/zen/BonsaiTree.vue'
import EnsoCircle from '../components/zen/EnsoCircle.vue'
import { useTimerStore, FOCUS_OPTIONS } from '../stores/timerStore'
import { useTasksStore } from '../stores/tasksStore'
import { useProjectsStore } from '../stores/projectsStore'
import { useSessionsStore } from '../stores/sessionsStore'
import { useZenStore } from '../stores/zenStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useNotification } from '../composables/useNotification'
import { getDateTagColor, getDateTagText, getProjectName, getProjectColor } from '../utils/helpers'

const timer = useTimerStore()
const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()
const sessionsStore = useSessionsStore()
const zenStore = useZenStore()
const settings = useSettingsStore()
const route = useRoute()
const { notify } = useNotification()

let interval: ReturnType<typeof setInterval> | null = null

const showNewTaskForm = ref(false)
const newTaskTitle = ref('')
const newTaskProjectId = ref('')
const newTaskDueDate = ref('')

const projectsList = computed(() => projectsStore.sortedProjects)

const activeTasksList = computed(() => tasksStore.activeTasks)

const progress = computed(() => {
  if (timer.mode === 'break') {
    const total = timer.breakDuration * 60
    return total > 0 ? ((total - timer.remaining) / total) : 0
  }
  const total = timer.selectedDuration * 60
  return total > 0 ? ((total - timer.remaining) / total) : 0
})

const displayTime = computed(() => {
  const m = Math.floor(timer.remaining / 60)
  const s = timer.remaining % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const statusText = computed(() => {
  if (timer.mode === 'break') {
    return timer.status === 'running' ? 'Отдыхаю' : 'Пауза отдыха'
  }
  return timer.status === 'idle' ? 'Готов к фокусу'
    : timer.status === 'running' ? 'Фокусируюсь'
    : timer.status === 'paused' ? 'Пауза' : 'Готово'
})

const showZenToggle = computed(() => {
  if (timer.status === 'running' && timer.mode === 'focus') return false
  return timer.status === 'idle' || timer.mode === 'break'
})

const selectedTask = computed(() => tasksStore.tasks.find(t => t.id === timer.activeTaskId))

const queryTaskId = computed(() => route.query.task as string)
watch(queryTaskId, (id) => {
  if (id) timer.setActiveTask(id)
}, { immediate: true })

function startTimer() {
  if (timer.mode === 'break') timer.skipBreak()

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
  if (timer.mode === 'focus') {
    const session = sessionsStore.sessions.find(s => s.id === timer.activeSessionId)
    if (session) {
      session.endedAt = new Date().toISOString()
      session.status = 'abandoned'
    }
  }
  timer.reset()
}

function createTask() {
  if (!newTaskTitle.value.trim()) return
  const pid = newTaskProjectId.value || ''
  const hasProject = !!pid
  const hasDueDate = !!newTaskDueDate.value

  if (hasProject) {
    tasksStore.addTask(pid, newTaskTitle.value.trim(), 'project', newTaskDueDate.value || undefined, 'project')
  } else if (hasDueDate) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const due = new Date(newTaskDueDate.value)
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
    const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) {
      tasksStore.addTask('', newTaskTitle.value.trim(), 'today', newTaskDueDate.value, 'today')
    } else {
      tasksStore.addTask('', newTaskTitle.value.trim(), 'plans', newTaskDueDate.value)
    }
  } else {
    tasksStore.addTask('', newTaskTitle.value.trim(), 'inbox', undefined, 'inbox')
  }

  const created = tasksStore.tasks[tasksStore.tasks.length - 1]
  timer.setActiveTask(created.id)
  newTaskTitle.value = ''
  newTaskProjectId.value = ''
  newTaskDueDate.value = ''
  showNewTaskForm.value = false
}

function cancelNewTask() {
  newTaskTitle.value = ''
  newTaskProjectId.value = ''
  newTaskDueDate.value = ''
  showNewTaskForm.value = false
}

watch(() => timer.remaining, (val) => {
  if (val > 0 || timer.status !== 'running') return

  if (interval) clearInterval(interval)
  interval = null

  if (timer.mode === 'focus') {
    const session = sessionsStore.sessions.find(s => s.id === timer.activeSessionId)
    if (session) {
      session.endedAt = new Date().toISOString()
      session.status = 'completed'
    }
    if (timer.activeTaskId) {
      tasksStore.addSeconds(timer.activeTaskId, timer.selectedDuration * 60)
    }

    notify('Фокус завершён', 'Время для отдыха! 🍵')

    timer.startBreak()
    interval = setInterval(() => {
      timer.tick()
    }, 1000)
  } else {
    notify('Перерыв окончен', 'Готов к новому фокусу! 🍅')

    timer.reset()
    if (settings.autoStartNextSession) {
      startTimer()
    }
  }
})

function skipBreak() {
  if (interval) clearInterval(interval)
  interval = null
  timer.skipBreak()
}

function completeTaskEarly() {
  if (timer.status === 'idle' || timer.mode === 'break') return
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
  if (document.hidden && timer.status === 'running' && timer.mode === 'focus') {
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
            <template v-if="!timer.zenMode">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="3" class="text-glass-border" />
                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  :class="timer.mode === 'break' ? 'text-green-500' : 'text-accent'"
                  stroke-linecap="round"
                  :stroke-dasharray="2 * Math.PI * 45"
                  :stroke-dashoffset="2 * Math.PI * 45 * (1 - progress)"
                  style="transition: stroke-dashoffset 0.5s linear"
                />
              </svg>
            </template>
            <EnsoCircle v-else :progress="progress" :size="224" />
            <div class="absolute inset-0 flex flex-col items-center justify-center" style="z-index: 10;">
              <span class="text-5xl font-bold tracking-tight font-mono">{{ displayTime }}</span>
              <span class="text-sm text-text-secondary mt-2">{{ statusText }}</span>
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
      <GlassCard v-if="timer.status === 'idle'" padding="p-5" class="mt-4 w-full max-w-md relative">
        <div class="flex gap-2">
          <div class="relative flex-1 h-[42px]">
            <div
              class="absolute inset-0 flex items-center px-4 rounded-xl pointer-events-none bg-white dark:bg-[#1a1a2e] border border-glass-border"
            >
              <span class="text-sm truncate" :class="selectedTask ? 'text-text' : 'text-text-secondary'">
                {{ selectedTask ? selectedTask.title : 'Задача' }}
              </span>
              <div class="flex items-center gap-1 ml-auto pl-2">
                <Tag
                  v-if="selectedTask && getProjectName(selectedTask.projectId)"
                  :text="getProjectName(selectedTask.projectId)!"
                  :color="getProjectColor(selectedTask.projectId) || '#6b7280'"
                />
                <Tag
                  v-if="selectedTask && selectedTask.dueDate"
                  :text="getDateTagText(selectedTask.dueDate) || ''"
                  :color="getDateTagColor(selectedTask.dueDate) || '#6b7280'"
                />
              </div>
              <svg class="w-4 h-4 ml-2 text-text-secondary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <select
              class="absolute inset-0 w-full opacity-0 cursor-pointer text-sm focus:outline-none"
              :value="timer.activeTaskId || ''"
              @change="timer.setActiveTask(($event.target as HTMLSelectElement).value || null)"
            >
              <option value="">Задача</option>
              <option v-for="t in activeTasksList" :key="t.id" :value="t.id">
                {{ t.title }}
              </option>
            </select>
          </div>
          <button
            class="px-3 py-2.5 flex items-center justify-center rounded-xl glass hover:bg-white/30 dark:hover:bg-white/10 transition-all shrink-0 cursor-pointer text-lg leading-none"
            @click="showNewTaskForm = true"
            title="Новая задача"
          >
            +
          </button>
        </div>
      </GlassCard>

      <!-- New task modal -->
      <Teleport to="body">
        <div v-if="showNewTaskForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="cancelNewTask">
          <div class="bg-white dark:bg-[#1a1a2e] p-6 rounded-2xl w-80 space-y-5 shadow-2xl border border-glass-border">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-text">Новая задача</h3>
              <button class="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-text-secondary" @click="cancelNewTask">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <input
              v-model="newTaskTitle"
              class="w-full bg-transparent border-b-2 border-glass-border focus:border-accent outline-none px-1 py-1 text-sm transition-colors text-text"
              placeholder="Название задачи..."
              @keyup.enter="createTask"
            />

            <div>
              <label class="text-xs text-text-secondary mb-2 block">Проект</label>
              <select
                v-model="newTaskProjectId"
                class="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-[#1a1a2e] border border-glass-border focus:border-accent outline-none appearance-none cursor-pointer transition-colors text-text"
              >
                <option value="">Без проекта</option>
                <option v-for="p in projectsList" :key="p.id" :value="p.id">
                  {{ p.emoji }} {{ p.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="text-xs text-text-secondary mb-2 block">Срок</label>
              <CalendarPicker v-model="newTaskDueDate" placeholder="Выбрать дату" />
            </div>

            <div class="flex gap-2 pt-2">
              <GlassButton variant="ghost" class="flex-1" @click="cancelNewTask">Отмена</GlassButton>
              <GlassButton class="flex-1" :disabled="!newTaskTitle.trim()" @click="createTask">Создать</GlassButton>
            </div>
          </div>
        </div>
      </Teleport>

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
        <template v-else-if="timer.status === 'running' && timer.mode === 'focus'">
          <GlassButton variant="secondary" size="lg" @click="pauseTimer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
            Пауза
          </GlassButton>
          <GlassButton variant="secondary" size="lg" :disabled="!timer.activeTaskId" @click="completeTaskEarly">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>
            Готово
          </GlassButton>
        </template>
        <template v-else-if="timer.status === 'running' && timer.mode === 'break'">
          <GlassButton variant="ghost" size="lg" @click="skipBreak">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
            Прервать отдых
          </GlassButton>
        </template>
        <template v-else-if="timer.status === 'paused' && timer.mode === 'focus'">
          <GlassButton size="lg" @click="resumeTimer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Продолжить
          </GlassButton>
          <GlassButton variant="ghost" size="lg" @click="stopTimer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
            Остановить
          </GlassButton>
        </template>
        <template v-else-if="timer.status === 'paused' && timer.mode === 'break'">
          <GlassButton size="lg" @click="resumeTimer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Продолжить
          </GlassButton>
          <GlassButton variant="ghost" size="lg" @click="skipBreak">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
            Прервать отдых
          </GlassButton>
        </template>
      </div>
    </div>
  </div>
</template>
