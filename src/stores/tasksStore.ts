import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task } from '../types'

function determineListType(dueDate?: string): Task['listType'] {
  if (!dueDate) return 'inbox'

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const due = new Date(dueDate)
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'today'
  if (diffDays >= 1 && diffDays <= 6) return 'week'
  return 'inbox'
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])

  const inboxTasks = computed(() =>
    [...tasks.value].filter(t => t.listType === 'inbox' && t.status === 'active')
      .sort((a, b) => a.sortOrder - b.sortOrder)
  )

  const todayTasks = computed(() =>
    [...tasks.value].filter(t => t.listType === 'today' && t.status === 'active')
      .sort((a, b) => a.sortOrder - b.sortOrder)
  )

  const weekTasks = computed(() =>
    [...tasks.value].filter(t => t.listType === 'week' && t.status === 'active')
      .sort((a, b) => a.sortOrder - b.sortOrder)
  )

  const projectTasks = computed(() =>
    [...tasks.value].filter(t => t.listType === 'project' && t.status === 'active')
      .sort((a, b) => a.sortOrder - b.sortOrder)
  )

  const activeTasks = computed(() =>
    [...tasks.value].filter(t => t.status === 'active')
      .sort((a, b) => a.sortOrder - b.sortOrder)
  )

  const doneInbox = computed(() =>
    [...tasks.value].filter(t => t.listType === 'inbox' && t.status === 'done')
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
  )

  const doneToday = computed(() =>
    [...tasks.value].filter(t => t.listType === 'today' && t.status === 'done')
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
  )

  const doneWeek = computed(() =>
    [...tasks.value].filter(t => t.listType === 'week' && t.status === 'done')
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
  )

  const doneProject = computed(() =>
    [...tasks.value].filter(t => t.listType === 'project' && t.status === 'done')
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
  )

  const tasksByProject = computed(() => {
    const map = new Map<string, Task[]>()
    for (const t of tasks.value) {
      if (t.listType !== 'project') continue
      if (!map.has(t.projectId)) map.set(t.projectId, [])
      map.get(t.projectId)!.push(t)
    }
    return map
  })

  function addTask(projectId: string, title: string, listType: Task['listType'] = 'project', dueDate?: string) {
    const resolvedListType = listType === 'project' ? 'project' : determineListType(dueDate)
    const task: Task = {
      id: crypto.randomUUID(),
      projectId,
      listType: resolvedListType,
      title,
      status: 'active',
      totalSeconds: 0,
      dueDate,
      sortOrder: tasks.value.filter(t => t.projectId === projectId && t.listType === resolvedListType).length,
      createdAt: new Date().toISOString(),
    }
    tasks.value.push(task)
  }

  function updateTask(id: string, data: Partial<Task>) {
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      if (data.dueDate !== undefined) {
        data.listType = determineListType(data.dueDate)
      }
      Object.assign(tasks.value[idx], data)
    }
  }

  function completeTask(id: string) {
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      tasks.value[idx].status = 'done'
      tasks.value[idx].completedAt = new Date().toISOString()
    }
  }

  function reactivateTask(id: string) {
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      tasks.value[idx].status = 'active'
      tasks.value[idx].completedAt = undefined
    }
  }

  function deleteTask(id: string) {
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  function addSeconds(taskId: string, seconds: number) {
    const t = tasks.value.find(t => t.id === taskId)
    if (t) t.totalSeconds += seconds
  }

  function reorder(listType: string, projectId: string, orderedIds: string[]) {
    orderedIds.forEach((id, i) => {
      const t = tasks.value.find(t => t.id === id && t.listType === listType && t.projectId === projectId)
      if (t) t.sortOrder = i
    })
  }

  return {
    tasks,
    inboxTasks, todayTasks, weekTasks, projectTasks, activeTasks,
    doneInbox, doneToday, doneWeek, doneProject,
    tasksByProject,
    addTask, updateTask, completeTask, reactivateTask, deleteTask, addSeconds, reorder, determineListType,
  }
}, {
  persist: true,
})
