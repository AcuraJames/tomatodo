import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTimerStore } from '../stores/timerStore'

describe('timerStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0))
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('starts in idle focus mode', () => {
      const store = useTimerStore()
      expect(store.status).toBe('idle')
      expect(store.mode).toBe('focus')
    })

    it('defaults to 25 min', () => {
      const store = useTimerStore()
      expect(store.selectedDuration).toBe(25)
      expect(store.remaining).toBe(25 * 60)
    })
  })

  describe('setDuration', () => {
    it('updates selectedDuration and remaining', () => {
      const store = useTimerStore()
      store.setDuration(45)
      expect(store.selectedDuration).toBe(45)
      expect(store.remaining).toBe(45 * 60)
    })
  })

  describe('start / pause / resume', () => {
    it('start sets running', () => {
      const store = useTimerStore()
      store.start()
      expect(store.status).toBe('running')
      expect(store.mode).toBe('focus')
    })

    it('pause sets paused', () => {
      const store = useTimerStore()
      store.start()
      store.pause()
      expect(store.status).toBe('paused')
    })

    it('pause only works when running', () => {
      const store = useTimerStore()
      store.pause()
      expect(store.status).toBe('idle')
    })

    it('resume sets running', () => {
      const store = useTimerStore()
      store.start()
      store.pause()
      store.resume()
      expect(store.status).toBe('running')
    })

    it('resume only works when paused', () => {
      const store = useTimerStore()
      store.start()
      store.resume()
      expect(store.status).toBe('running')
    })
  })

  describe('tick', () => {
    it('decrements remaining', () => {
      const store = useTimerStore()
      store.start()
      store.tick()
      expect(store.remaining).toBe(25 * 60 - 1)
    })

    it('does not go below 0', () => {
      const store = useTimerStore()
      store.setDuration(1)
      store.start()
      for (let i = 0; i < 70; i++) store.tick()
      expect(store.remaining).toBe(0)
    })
  })

  describe('reset', () => {
    it('resets to initial state', () => {
      const store = useTimerStore()
      store.start()
      store.tick()
      store.tick()
      store.reset()
      expect(store.status).toBe('idle')
      expect(store.mode).toBe('focus')
      expect(store.remaining).toBe(25 * 60)
      expect(store.activeSessionId).toBeNull()
    })
  })

  describe('startBreak', () => {
    it('switches to break mode', () => {
      const store = useTimerStore()
      store.startBreak()
      expect(store.mode).toBe('break')
      expect(store.status).toBe('running')
      expect(store.remaining).toBe(5 * 60)
      expect(store.activeSessionId).toBeNull()
    })

    it('uses custom breakDuration', () => {
      const store = useTimerStore()
      store.breakDuration = 10
      store.startBreak()
      expect(store.remaining).toBe(10 * 60)
    })
  })

  describe('skipBreak', () => {
    it('resets to idle', () => {
      const store = useTimerStore()
      store.startBreak()
      store.skipBreak()
      expect(store.status).toBe('idle')
      expect(store.mode).toBe('focus')
    })
  })

  describe('toggleZen', () => {
    it('toggles zenMode', () => {
      const store = useTimerStore()
      expect(store.zenMode).toBe(false)
      store.toggleZen()
      expect(store.zenMode).toBe(true)
      store.toggleZen()
      expect(store.zenMode).toBe(false)
    })
  })

  describe('recoverFromReload', () => {
    it('adjusts remaining when timer was running', () => {
      const store = useTimerStore()
      store.start()
      store.setSessionId('test-session')
      store.lastTickAt = new Date(Date.now() - 30_000).toISOString()
      store.remaining = 1500
      store.recoverFromReload()
      expect(store.remaining).toBe(1470)
    })

    it('sets remaining to 0 if elapsed exceeds remaining', () => {
      const store = useTimerStore()
      store.start()
      store.lastTickAt = new Date(Date.now() - 2000_000).toISOString()
      store.remaining = 60
      store.recoverFromReload()
      expect(store.remaining).toBe(0)
    })

    it('does nothing if status is not running', () => {
      const store = useTimerStore()
      store.recoverFromReload()
      expect(store.remaining).toBe(25 * 60)
    })

    it('does nothing if lastTickAt is null', () => {
      const store = useTimerStore()
      store.status = 'running'
      store.recoverFromReload()
      expect(store.remaining).toBe(25 * 60)
    })
  })

  describe('setActiveTask', () => {
    it('sets and clears activeTaskId', () => {
      const store = useTimerStore()
      store.setActiveTask('task-1')
      expect(store.activeTaskId).toBe('task-1')
      store.setActiveTask(null)
      expect(store.activeTaskId).toBeNull()
    })
  })

  describe('setSessionId', () => {
    it('sets activeSessionId', () => {
      const store = useTimerStore()
      store.setSessionId('sess-1')
      expect(store.activeSessionId).toBe('sess-1')
    })
  })
})
