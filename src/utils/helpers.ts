import { useProjectsStore } from '../stores/projectsStore'

export function getDateTagColor(dueDate?: string): string | undefined {
  if (!dueDate) return undefined
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const due = new Date(dueDate)
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return '#ef4444'
  if (diffDays === 0) return '#ef4444'
  if (diffDays >= 1 && diffDays <= 6) return '#f59e0b'
  return '#22c55e'
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = String(d.getFullYear()).slice(-2)
  return `${day}.${month}.${year}`
}

export function getProjectName(projectId: string): string | undefined {
  const projects = useProjectsStore()
  return projects.sortedProjects.find(p => p.id === projectId)?.name
}

export function getProjectColor(projectId: string): string | undefined {
  const projects = useProjectsStore()
  return projects.sortedProjects.find(p => p.id === projectId)?.color
}
