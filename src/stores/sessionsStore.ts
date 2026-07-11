import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Session, DayStats } from '../types'

export const useSessionsStore = defineStore('sessions', () => {
  const sessions = ref<Session[]>([])

  function addSession(session: Session) {
    sessions.value.push(session)
  }

  function updateSession(id: string, data: Partial<Session>) {
    const idx = sessions.value.findIndex(s => s.id === id)
    if (idx !== -1) Object.assign(sessions.value[idx], data)
  }

  const todaySessions = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return sessions.value.filter(s => s.startedAt.startsWith(today))
  })

  const weekSessions = computed(() => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    return sessions.value.filter(s => s.startedAt >= weekAgo)
  })

  const monthSessions = computed(() => {
    const now = new Date()
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    return sessions.value.filter(s => s.startedAt >= monthAgo)
  })

  const dailyStats = computed(() => {
    const statsMap = new Map<string, DayStats>()
    for (const s of sessions.value) {
      if (s.status === 'abandoned') continue
      const date = s.startedAt.slice(0, 10)
      const existing = statsMap.get(date) || { date, totalSeconds: 0, tasksCompleted: 0, sessionsCount: 0 }
      existing.totalSeconds += s.actualSeconds
      existing.sessionsCount += 1
      if (s.status === 'task_done_early') existing.tasksCompleted += 1
      statsMap.set(date, existing)
    }
    return Array.from(statsMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  })

  return { sessions, todaySessions, weekSessions, monthSessions, dailyStats, addSession, updateSession }
}, {
  persist: true,
})
