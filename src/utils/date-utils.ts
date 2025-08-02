import { HebrewCalendar, HDate, Event, flags } from '@hebcal/core'

/**
 * Calculates the number of days between two dates
 * @param startDate - The start date as a string (YYYY-MM-DD format)
 * @param endDate - The end date as a string (YYYY-MM-DD format)
 * @returns The number of days between the dates, or null if invalid
 */
export function calculateDaysBetween(
  startDate: string,
  endDate: string
): number | null {
  if (!startDate || !endDate) return null

  const start = new Date(startDate)
  const end = new Date(endDate)

  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null

  // Check if end date is before start date
  if (start > end) return null

  const diffTime = end.getTime() - start.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Gets the work day value for vacation calculation
 * @param date - The date to check
 * @param includeHolHamoed - Whether to include Chol Hamoed as holidays
 * @returns 0 for weekends/full holidays, 0.5 for half days, 1 for full work days
 */
export function getWorkDayValue(
  date: Date,
  includeHolHamoed: boolean = true
): number {
  // Check if it's weekend (Friday or Saturday in Israel)
  if (isWeekend(date)) {
    return 0
  }

  // Check if it's a half day (Erev holidays)
  if (isJewishHalfDay(date)) {
    return 0.5
  }

  // Check if it's a full Jewish holiday
  if (isJewishHoliday(date, includeHolHamoed)) {
    return 0
  }

  return 1
}

/**
 * Checks if a date falls on weekend (Friday or Saturday in Israel)
 * @param date - The date to check
 * @returns True if it's weekend, false otherwise
 */
export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay()
  return dayOfWeek === 5 || dayOfWeek === 6 // Friday = 5, Saturday = 6
}

/**
 * Checks if a date is a Jewish half day (like Erev holidays)
 * @param date - The date to check
 * @returns True if it's a Jewish half day, false otherwise
 */
export function isJewishHalfDay(date: Date): boolean {
  try {
    const hd = new HDate(date)
    const events = HebrewCalendar.getHolidaysOnDate(hd, true) // true for Israel

    // Filter for Erev holidays that are typically half days
    const halfDayHolidays = events?.filter((event: Event) => {
      const eventFlags = event.getFlags()
      const desc = event.getDesc()

      // Check for Erev holidays and other known half days
      return (
        eventFlags & flags.EREV || // Erev holidays
        desc.includes('Erev') ||
        desc === 'Rosh Hashana LaBehemot' || // Sometimes considered half day
        desc === 'Tu BiShvat' // Sometimes considered half day in some workplaces
      )
    })

    return (halfDayHolidays?.length ?? 0) > 0
  } catch (error) {
    console.warn('Error checking Jewish half day:', error)
    return false
  }
}

/**
 * Checks if a date is a Jewish holiday in Israel (excluding half days)
 * @param date - The date to check
 * @param includeHolHamoed - Whether to include Chol Hamoed as holidays
 * @returns True if it's a Jewish holiday, false otherwise
 */
export function isJewishHoliday(
  date: Date,
  includeHolHamoed: boolean = true
): boolean {
  try {
    const hd = new HDate(date)
    const events = HebrewCalendar.getHolidaysOnDate(hd, true) // true for Israel

    // Filter for major holidays that are observed as national holidays in Israel
    const majorHolidays = events?.filter((event: Event) => {
      const eventFlags = event.getFlags()
      const desc = event.getDesc()

      // Check for major holidays that affect work days (excluding half days)
      return (
        ((eventFlags & flags.CHAG && !(eventFlags & flags.EREV)) || // Major holidays but not Erev
          eventFlags & flags.YOM_TOV_ENDS || // End of Yom Tov
          (includeHolHamoed && eventFlags & flags.CHOL_HAMOED) || // Intermediate days of festivals - only if enabled
          desc === 'Yom HaZikaron' ||
          desc === 'Yom HaAtzmaut' ||
          desc === 'Yom Yerushalayim') &&
        !desc.includes('Erev')
      ) // Exclude Erev holidays as they're handled as half days
    })

    return (majorHolidays?.length ?? 0) > 0
  } catch (error) {
    console.warn('Error checking Jewish holiday:', error)
    return false
  }
}

/**
 * Gets a list of Jewish holidays in a date range
 * @param startDate - Start date string (YYYY-MM-DD format)
 * @param endDate - End date string (YYYY-MM-DD format)
 * @param includeHolHamoed - Whether to include Chol Hamoed as holidays
 * @returns Array of holiday information with dates and names
 */
export function getJewishHolidaysInRange(
  startDate: string,
  endDate: string,
  includeHolHamoed: boolean = true
): Array<{
  date: string
  name: string
  isHalfDay: boolean
  isHolHamoed: boolean
}> {
  if (!startDate || !endDate) return []

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return []

  const holidays: Array<{
    date: string
    name: string
    isHalfDay: boolean
    isHolHamoed: boolean
  }> = []
  const currentDate = new Date(start)

  while (currentDate <= end) {
    try {
      const hd = new HDate(currentDate)
      const events = HebrewCalendar.getHolidaysOnDate(hd, true) // true for Israel

      events?.forEach((event: Event) => {
        const eventFlags = event.getFlags()
        const desc = event.getDesc()

        // Determine if it's a half day
        const isHalfDay = !!(
          eventFlags & flags.EREV ||
          desc.includes('Erev') ||
          desc === 'Rosh Hashana LaBehemot' ||
          desc === 'Tu BiShvat'
        )

        // Determine if it's Chol Hamoed
        const isHolHamoed = !!(eventFlags & flags.CHOL_HAMOED)

        if (
          eventFlags & flags.CHAG ||
          eventFlags & flags.YOM_TOV_ENDS ||
          eventFlags & flags.EREV ||
          (includeHolHamoed && eventFlags & flags.CHOL_HAMOED) ||
          desc === 'Yom HaZikaron' ||
          desc === 'Yom HaAtzmaut' ||
          desc === 'Yom Yerushalayim'
        ) {
          holidays.push({
            date: currentDate.toISOString().split('T')[0],
            name: desc,
            isHalfDay,
            isHolHamoed
          })
        }
      })
    } catch (error) {
      console.warn('Error getting holidays for date:', currentDate, error)
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return holidays
}

/**
 * Calculates vacation days with detailed breakdown
 * @param startDate - The start date as a string (YYYY-MM-DD format)
 * @param endDate - The end date as a string (YYYY-MM-DD format)
 * @param includeHolHamoed - Whether to include Chol Hamoed as holidays
 * @returns Detailed breakdown of vacation calculation
 */
export function calculateVacationDaysDetailed(
  startDate: string,
  endDate: string,
  includeHolHamoed: boolean = true
): {
  totalDays: number
  workDays: number
  weekendDays: number
  holidayDays: number
  halfDays: number
  vacationDaysNeeded: number
  holidays: Array<{
    date: string
    name: string
    isHalfDay: boolean
    isHolHamoed: boolean
  }>
} | null {
  if (!startDate || !endDate) return null

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null
  if (start > end) return null

  const totalDays = calculateDaysBetween(startDate, endDate) || 0
  let workDays = 0
  let weekendDays = 0
  let holidayDays = 0
  let halfDays = 0
  let vacationDaysNeeded = 0

  const holidays = getJewishHolidaysInRange(
    startDate,
    endDate,
    includeHolHamoed
  )
  const currentDate = new Date(start)

  while (currentDate <= end) {
    const dayValue = getWorkDayValue(currentDate, includeHolHamoed)

    if (isWeekend(currentDate)) {
      weekendDays++
    } else if (isJewishHalfDay(currentDate)) {
      halfDays++
    } else if (isJewishHoliday(currentDate, includeHolHamoed)) {
      holidayDays++
    } else {
      workDays++
    }

    vacationDaysNeeded += dayValue
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return {
    totalDays,
    workDays,
    weekendDays,
    holidayDays,
    halfDays,
    vacationDaysNeeded,
    holidays
  }
}

/**
 * Formats the day count with proper Hebrew pluralization
 * @param days - The number of days
 * @returns Formatted string with proper Hebrew pluralization
 */
export function formatDayCountHebrew(days: number): string {
  if (days === 1) {
    return 'יום אחד'
  } else if (days === 2) {
    return 'יומיים'
  } else if (days <= 10) {
    return `${days} ימים`
  } else {
    return `${days} ימים`
  }
}
