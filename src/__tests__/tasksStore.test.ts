import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTasksStore } from '../stores/tasksStore'

describe('tasksStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0))
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('determineListType', () => {
    it('returns inbox for undefined dueDate', () => {
      const store = useTasksStore()
      expect(store.determineListType(undefined)).toBe('inbox')
    })

    it('returns today for today', () => {
      const store = useTasksStore()
      expect(store.determineListType('2026-01-15')).toBe('today')
    })

    it('returns today for yesterday (overdue)', () => {
      const store = useTasksStore()
      expect(store.determineListType('2026-01-14')).toBe('today')
    })

    it('returns today for 3 days ago (overdue)', () => {
      const store = useTasksStore()
      expect(store.determineListType('2026-01-12')).toBe('today')
    })

    it('returns week for tomorrow', () => {
      const store = useTasksStore()
      expect(store.determineListType('2026-01-16')).toBe('week')
    })

    it('returns week for 6 days from now', () => {
      const store = useTasksStore()
      expect(store.determineListType('2026-01-21')).toBe('week')
    })

    it('returns inbox for 7+ days from now', () => {
      const store = useTasksStore()
      expect(store.determineListType('2026-01-22')).toBe('inbox')
    })

    it('returns today for 30 days ago (far overdue)', () => {
      const store = useTasksStore()
      expect(store.determineListType('2025-12-16')).toBe('today')
    })

    it('returns inbox for empty string', () => {
      const store = useTasksStore()
      expect(store.determineListType('')).toBe('inbox')
    })
  })

  describe('addTask', () => {
    it('adds a task with correct fields', () => {
      const store = useTasksStore()
      store.addTask('proj-1', 'Test task', 'project')
      expect(store.tasks).toHaveLength(1)
      expect(store.tasks[0].title).toBe('Test task')
      expect(store.tasks[0].projectId).toBe('proj-1')
      expect(store.tasks[0].status).toBe('active')
      expect(store.tasks[0].totalSeconds).toBe(0)
    })

    it('sets listType based on dueDate for non-project tasks', () => {
      const store = useTasksStore()
      store.addTask('inbox', 'Overdue task', 'inbox', '2026-01-10')
      expect(store.tasks[0].listType).toBe('today')
    })

    it('generates unique ids', () => {
      const store = useTasksStore()
      store.addTask('proj-1', 'Task 1', 'project')
      store.addTask('proj-1', 'Task 2', 'project')
      expect(store.tasks[0].id).not.toBe(store.tasks[1].id)
    })

    it('handles empty projectId for inbox tasks', () => {
      const store = useTasksStore()
      store.addTask('', 'Inbox task', 'inbox')
      expect(store.tasks[0].projectId).toBe('')
      expect(store.tasks[0].listType).toBe('inbox')
    })

    it('sets listType to week for tomorrow dueDate', () => {
      const store = useTasksStore()
      store.addTask('', 'Tomorrow task', 'inbox', '2026-01-16')
      expect(store.tasks[0].listType).toBe('week')
    })

    it('sets listType to week for 6 days from now', () => {
      const store = useTasksStore()
      store.addTask('', 'Week task', 'inbox', '2026-01-21')
      expect(store.tasks[0].listType).toBe('week')
    })

    it('sets listType to inbox for 7+ days from now', () => {
      const store = useTasksStore()
      store.addTask('', 'Far task', 'inbox', '2026-01-22')
      expect(store.tasks[0].listType).toBe('inbox')
    })

    it('sets listType to today for today dueDate', () => {
      const store = useTasksStore()
      store.addTask('', 'Today task', 'inbox', '2026-01-15')
      expect(store.tasks[0].listType).toBe('today')
    })

    it('sets listType to inbox when no dueDate', () => {
      const store = useTasksStore()
      store.addTask('', 'No date task', 'inbox')
      expect(store.tasks[0].listType).toBe('inbox')
    })

    it('project tasks always get listType project regardless of dueDate', () => {
      const store = useTasksStore()
      store.addTask('proj-1', 'Project task', 'project', '2026-01-15')
      expect(store.tasks[0].listType).toBe('project')
    })
  })

  describe('completeTask', () => {
    it('marks task as done with completedAt', () => {
      const store = useTasksStore()
      store.addTask('proj-1', 'Task', 'project')
      const id = store.tasks[0].id
      store.completeTask(id)
      expect(store.tasks[0].status).toBe('done')
      expect(store.tasks[0].completedAt).toBeTruthy()
    })
  })

  describe('reactivateTask', () => {
    it('marks done task as active', () => {
      const store = useTasksStore()
      store.addTask('proj-1', 'Task', 'project')
      const id = store.tasks[0].id
      store.completeTask(id)
      store.reactivateTask(id)
      expect(store.tasks[0].status).toBe('active')
      expect(store.tasks[0].completedAt).toBeUndefined()
    })
  })

  describe('deleteTask', () => {
    it('removes task by id', () => {
      const store = useTasksStore()
      store.addTask('proj-1', 'Task', 'project')
      const id = store.tasks[0].id
      store.deleteTask(id)
      expect(store.tasks).toHaveLength(0)
    })
  })

  describe('addSeconds', () => {
    it('increments totalSeconds', () => {
      const store = useTasksStore()
      store.addTask('proj-1', 'Task', 'project')
      const id = store.tasks[0].id
      store.addSeconds(id, 60)
      store.addSeconds(id, 30)
      expect(store.tasks[0].totalSeconds).toBe(90)
    })
  })

  describe('computed lists', () => {
    it('inboxTasks filters correctly', () => {
      const store = useTasksStore()
      store.addTask('inbox', 'Inbox task', 'inbox')
      store.addTask('proj-1', 'Project task', 'project')
      expect(store.inboxTasks).toHaveLength(1)
      expect(store.inboxTasks[0].title).toBe('Inbox task')
    })

    it('todayTasks filters correctly', () => {
      const store = useTasksStore()
      store.addTask('inbox', 'Today task', 'inbox', '2026-01-15')
      store.addTask('inbox', 'Future task', 'inbox', '2026-02-01')
      expect(store.todayTasks).toHaveLength(1)
      expect(store.todayTasks[0].title).toBe('Today task')
    })

    it('weekTasks filters correctly', () => {
      const store = useTasksStore()
      store.addTask('inbox', 'Week task', 'inbox', '2026-01-18')
      store.addTask('inbox', 'Future task', 'inbox', '2026-02-01')
      expect(store.weekTasks).toHaveLength(1)
      expect(store.weekTasks[0].title).toBe('Week task')
    })

    it('activeTasks excludes done', () => {
      const store = useTasksStore()
      store.addTask('proj-1', 'Active', 'project')
      store.addTask('proj-1', 'Done', 'project')
      store.completeTask(store.tasks[1].id)
      expect(store.activeTasks).toHaveLength(1)
    })
  })

  describe('updateTask', () => {
    it('updates title', () => {
      const store = useTasksStore()
      store.addTask('proj-1', 'Old title', 'project')
      const id = store.tasks[0].id
      store.updateTask(id, { title: 'New title' })
      expect(store.tasks[0].title).toBe('New title')
    })

    it('recalculates listType when dueDate changes', () => {
      const store = useTasksStore()
      store.addTask('inbox', 'Task', 'inbox')
      const id = store.tasks[0].id
      store.updateTask(id, { dueDate: '2026-01-15' })
      expect(store.tasks[0].listType).toBe('today')
    })
  })
})
