export interface Project {
  id: string
  name: string
  color: string
  emoji: string
  sortOrder: number
  createdAt: string
}

export interface Task {
  id: string
  projectId: string
  listType: 'project' | 'inbox' | 'today' | 'week'
  title: string
  status: 'active' | 'done'
  totalSeconds: number
  sortOrder: number
  completedAt?: string
  createdAt: string
}

export type SessionStatus = 'completed' | 'abandoned' | 'task_done_early'
export type TimerMode = 'focus' | 'break'
export type TimerStatus = 'idle' | 'running' | 'paused' | 'done'

export interface Session {
  id: string
  taskId: string
  plannedDuration: number
  actualSeconds: number
  mode: TimerMode
  status: SessionStatus
  startedAt: string
  endedAt?: string
  breakDuration?: number
}

export interface GardenTree {
  id: string
  taskId: string
  taskTitle: string
  treeState: string
  plantedAt: string
}

export interface DayStats {
  date: string
  totalSeconds: number
  tasksCompleted: number
  sessionsCount: number
}

export interface FocusDurations {
  label: string
  value: number
}
