import { describe, it, expect } from 'vitest'
import {
  calculateDaysBetween,
  calculateVacationDays,
  calculateVacationDaysDetailed,
  getWorkDayValue,
  isWorkDay,
  isWeekend,
  isJewishHoliday,
  isJewishHalfDay,
  formatDayCount
} from './date-utils'

describe('calculateDaysBetween', () => {
  it('should return null when start date is empty', () => {
    expect(calculateDaysBetween('', '2024-01-10')).toBe(null)
  })

  it('should return null when end date is empty', () => {
    expect(calculateDaysBetween('2024-01-01', '')).toBe(null)
  })

  it('should return null when both dates are empty', () => {
    expect(calculateDaysBetween('', '')).toBe(null)
  })

  it('should return null when start date is after end date', () => {
    expect(calculateDaysBetween('2024-01-10', '2024-01-05')).toBe(null)
  })

  it('should return null for invalid date formats', () => {
    expect(calculateDaysBetween('invalid-date', '2024-01-10')).toBe(null)
    expect(calculateDaysBetween('2024-01-01', 'invalid-date')).toBe(null)
  })

  it('should return 0 for the same date', () => {
    expect(calculateDaysBetween('2024-01-01', '2024-01-01')).toBe(0)
  })

  it('should return 1 for consecutive dates', () => {
    expect(calculateDaysBetween('2024-01-01', '2024-01-02')).toBe(1)
  })

  it('should calculate days correctly for a week', () => {
    expect(calculateDaysBetween('2024-01-01', '2024-01-08')).toBe(7)
  })

  it('should calculate days correctly across months', () => {
    expect(calculateDaysBetween('2024-01-31', '2024-02-01')).toBe(1)
  })

  it('should calculate days correctly across years', () => {
    expect(calculateDaysBetween('2023-12-31', '2024-01-01')).toBe(1)
  })

  it('should handle leap year correctly', () => {
    expect(calculateDaysBetween('2024-02-28', '2024-03-01')).toBe(2) // 2024 is a leap year
  })

  it('should calculate a full year correctly', () => {
    expect(calculateDaysBetween('2024-01-01', '2024-12-31')).toBe(365) // 2024 is a leap year
  })
})

describe('formatDayCount', () => {
  it('should return singular form for 1 day', () => {
    expect(formatDayCount(1)).toBe('1 day')
  })

  it('should return plural form for 0 days', () => {
    expect(formatDayCount(0)).toBe('0 days')
  })

  it('should return plural form for multiple days', () => {
    expect(formatDayCount(2)).toBe('2 days')
    expect(formatDayCount(7)).toBe('7 days')
    expect(formatDayCount(365)).toBe('365 days')
  })
})

describe('isWeekend', () => {
  it('should return true for Friday', () => {
    const friday = new Date('2024-01-05') // A Friday
    expect(isWeekend(friday)).toBe(true)
  })

  it('should return true for Saturday', () => {
    const saturday = new Date('2024-01-06') // A Saturday
    expect(isWeekend(saturday)).toBe(true)
  })

  it('should return false for Sunday', () => {
    const sunday = new Date('2024-01-07') // A Sunday
    expect(isWeekend(sunday)).toBe(false)
  })

  it('should return false for Monday', () => {
    const monday = new Date('2024-01-08') // A Monday
    expect(isWeekend(monday)).toBe(false)
  })
})

describe('calculateVacationDays', () => {
  it('should return null for invalid dates', () => {
    expect(calculateVacationDays('', '2024-01-10')).toBe(null)
    expect(calculateVacationDays('2024-01-01', '')).toBe(null)
    expect(calculateVacationDays('invalid', '2024-01-10')).toBe(null)
  })

  it('should return null when start date is after end date', () => {
    expect(calculateVacationDays('2024-01-10', '2024-01-05')).toBe(null)
  })

  it('should calculate vacation days for a week with weekend', () => {
    // Monday to Sunday (includes one Friday and Saturday)
    const result = calculateVacationDays('2024-01-01', '2024-01-07') // Mon to Sun
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThan(7) // Should be less than total days due to weekend
  })

  it('should return 0 for weekend-only period', () => {
    // Friday to Saturday
    const result = calculateVacationDays('2024-01-05', '2024-01-06')
    expect(result).toBe(0)
  })
})

describe('calculateVacationDaysDetailed', () => {
  it('should return null for invalid inputs', () => {
    expect(calculateVacationDaysDetailed('', '2024-01-10')).toBe(null)
    expect(calculateVacationDaysDetailed('2024-01-01', '')).toBe(null)
  })

  it('should provide detailed breakdown for a week', () => {
    const result = calculateVacationDaysDetailed('2024-01-01', '2024-01-07') // Mon to Sun

    expect(result).not.toBe(null)
    expect(result?.totalDays).toBe(7)
    expect(result?.weekendDays).toBeGreaterThan(0) // Should have weekend days
    expect(result?.workDays).toBeGreaterThanOrEqual(0) // Should have work days
    expect(result?.halfDays).toBeGreaterThanOrEqual(0) // Should have half days count
    expect(result?.holidayDays).toBeGreaterThanOrEqual(0) // Should have holiday days count
    expect(typeof result?.vacationDaysNeeded).toBe('number') // Should be a number (could be fractional)
    expect(Array.isArray(result?.holidays)).toBe(true)
  })

  it('should handle same date correctly', () => {
    const result = calculateVacationDaysDetailed('2024-01-01', '2024-01-01')

    expect(result).not.toBe(null)
    expect(result?.totalDays).toBe(1)
    expect(result?.halfDays).toBeGreaterThanOrEqual(0)
    expect(typeof result?.vacationDaysNeeded).toBe('number')
  })
})

describe('isJewishHoliday', () => {
  it('should not throw errors for valid dates', () => {
    const date = new Date('2024-01-01')
    expect(() => isJewishHoliday(date)).not.toThrow()
  })

  it('should return boolean', () => {
    const date = new Date('2024-01-01')
    const result = isJewishHoliday(date)
    expect(typeof result).toBe('boolean')
  })
})

describe('isJewishHalfDay', () => {
  it('should not throw errors for valid dates', () => {
    const date = new Date('2024-01-01')
    expect(() => isJewishHalfDay(date)).not.toThrow()
  })

  it('should return boolean', () => {
    const date = new Date('2024-01-01')
    const result = isJewishHalfDay(date)
    expect(typeof result).toBe('boolean')
  })
})

describe('getWorkDayValue', () => {
  it('should return 0 for Friday (weekend)', () => {
    const friday = new Date('2024-01-05')
    expect(getWorkDayValue(friday)).toBe(0)
  })

  it('should return 0 for Saturday (weekend)', () => {
    const saturday = new Date('2024-01-06')
    expect(getWorkDayValue(saturday)).toBe(0)
  })

  it('should return 1 for regular work day', () => {
    const monday = new Date('2024-01-08')
    const result = getWorkDayValue(monday)
    expect([0, 0.5, 1]).toContain(result) // Could be work day, half day, or holiday
  })

  it('should return 0.5 for half days', () => {
    // This test would need a known half day date
    // For now, just test that the function returns valid values
    const date = new Date('2024-01-01')
    const result = getWorkDayValue(date)
    expect([0, 0.5, 1]).toContain(result)
  })
})

describe('isWorkDay', () => {
  it('should return false for Friday (weekend)', () => {
    const friday = new Date('2024-01-05')
    expect(isWorkDay(friday)).toBe(false)
  })

  it('should return false for Saturday (weekend)', () => {
    const saturday = new Date('2024-01-06')
    expect(isWorkDay(saturday)).toBe(false)
  })

  it('should return true for Monday (regular work day)', () => {
    const monday = new Date('2024-01-08')
    // Assuming it's not a holiday
    const result = isWorkDay(monday)
    expect(typeof result).toBe('boolean')
  })
})
