import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getDateTagColor, formatDate } from '../utils/helpers'

describe('getDateTagColor', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns undefined for no dueDate', () => {
    expect(getDateTagColor(undefined)).toBeUndefined()
    expect(getDateTagColor('')).toBeUndefined()
  })

  it('returns red for today', () => {
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0))
    expect(getDateTagColor('2026-01-15')).toBe('#ef4444')
  })

  it('returns red for overdue (yesterday)', () => {
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0))
    expect(getDateTagColor('2026-01-14')).toBe('#ef4444')
  })

  it('returns red for overdue (3 days ago)', () => {
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0))
    expect(getDateTagColor('2026-01-12')).toBe('#ef4444')
  })

  it('returns red for overdue (30 days ago)', () => {
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0))
    expect(getDateTagColor('2025-12-16')).toBe('#ef4444')
  })

  it('returns red for overdue (1 year ago)', () => {
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0))
    expect(getDateTagColor('2025-01-15')).toBe('#ef4444')
  })

  it('returns yellow for tomorrow', () => {
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0))
    expect(getDateTagColor('2026-01-16')).toBe('#f59e0b')
  })

  it('returns yellow for 6 days from now', () => {
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0))
    expect(getDateTagColor('2026-01-21')).toBe('#f59e0b')
  })

  it('returns green for 7+ days from now', () => {
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0))
    expect(getDateTagColor('2026-01-22')).toBe('#22c55e')
  })

  it('returns green for far future', () => {
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0, 0))
    expect(getDateTagColor('2027-06-01')).toBe('#22c55e')
  })
})

describe('formatDate', () => {
  it('formats date as DD.MM.YY', () => {
    expect(formatDate('2026-03-05')).toBe('05.03.26')
  })

  it('pads single digit day and month', () => {
    expect(formatDate('2026-01-09')).toBe('09.01.26')
  })

  it('handles december', () => {
    expect(formatDate('2025-12-31')).toBe('31.12.25')
  })
})
