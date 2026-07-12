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
  }

  function pause() {
    if (status.value === 'running') status.value = 'paused'
  }

  function resume() {
    if (status.value === 'paused') status.value = 'running'
  }

  function reset() {
    status.value = 'idle'
    mode.value = 'focus'
    remaining.value = selectedDuration.value * 60
    activeSessionId.value = null
  }

  function startBreak() {
    mode.value = 'break'
    remaining.value = breakDuration.value * 60
    status.value = 'running'
    activeSessionId.value = null
  }

  function skipBreak() {
    reset()
  }

  function tick() {
    if (remaining.value > 0) remaining.value--
  }

  function setSessionId(id: string) {
    activeSessionId.value = id
  }

  function toggleZen() {
    zenMode.value = !zenMode.value
  }

  return {
    mode, selectedDuration, remaining, status,
    activeSessionId, activeTaskId, zenMode, breakDuration,
    setDuration, setActiveTask, start, pause, resume, reset, tick,
    setSessionId, toggleZen, startBreak, skipBreak,
  }
}, {
  persist: true,
})
