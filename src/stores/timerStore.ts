import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TimerMode, TimerStatus } from '../types'

export const FOCUS_OPTIONS = [
  { label: '1 мин', value: 1 },
  { label: '25 мин', value: 25 },
  { label: '30 мин', value: 30 },
  { label: '45 мин', value: 45 },
  { label: '60 мин', value: 60 },
] as const

export const useTimerStore = defineStore('timer', () => {
  const mode = ref<TimerMode>('focus')
  const selectedDuration = ref(25)
  const remaining = ref(25 * 60)
  const status = ref<TimerStatus>('idle')
  const activeSessionId = ref<string | null>(null)
  const activeTaskId = ref<string | null>(null)
  const zenMode = ref(false)
  const breakDuration = ref(5)
  const lastTickAt = ref<string | null>(null)

  function setDuration(minutes: number) {
    selectedDuration.value = minutes
    remaining.value = minutes * 60
  }

  function setActiveTask(taskId: string | null) {
    activeTaskId.value = taskId
  }

  function start() {
    mode.value = 'focus'
    status.value = 'running'
    lastTickAt.value = new Date().toISOString()
  }

  function pause() {
    if (status.value === 'running') status.value = 'paused'
  }

  function resume() {
    if (status.value === 'paused') {
      status.value = 'running'
      lastTickAt.value = new Date().toISOString()
    }
  }

  function reset() {
    status.value = 'idle'
    mode.value = 'focus'
    remaining.value = selectedDuration.value * 60
    activeSessionId.value = null
    lastTickAt.value = null
  }

  function startBreak() {
    mode.value = 'break'
    remaining.value = breakDuration.value * 60
    status.value = 'running'
    activeSessionId.value = null
    lastTickAt.value = new Date().toISOString()
  }

  function skipBreak() {
    reset()
  }

  function tick() {
    if (remaining.value > 0) remaining.value--
    lastTickAt.value = new Date().toISOString()
  }

  function setSessionId(id: string) {
    activeSessionId.value = id
  }

  function toggleZen() {
    zenMode.value = !zenMode.value
  }

  function recoverFromReload() {
    if (status.value !== 'running' || !lastTickAt.value) return
    const elapsed = Math.floor((Date.now() - new Date(lastTickAt.value).getTime()) / 1000)
    const newRemaining = remaining.value - elapsed
    if (newRemaining <= 0) {
      remaining.value = 0
      status.value = 'idle'
      lastTickAt.value = null
    } else {
      remaining.value = newRemaining
      lastTickAt.value = new Date().toISOString()
      status.value = 'paused'
    }
  }

  return {
    mode, selectedDuration, remaining, status,
    activeSessionId, activeTaskId, zenMode, breakDuration, lastTickAt,
    setDuration, setActiveTask, start, pause, resume, reset, tick,
    setSessionId, toggleZen, startBreak, skipBreak, recoverFromReload,
  }
}, {
  persist: {
    afterHydrate: () => {
      const store = useTimerStore()
      store.recoverFromReload()
    },
  },
})
