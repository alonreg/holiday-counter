import { HebrewCalendar, HDate, Event, flags } from '@hebcal/core'

// Types
export type HolidayInfo = {
  date: string
  name: string
  isHalfDay: boolean
  isHolHamoed: boolean
}

export type VacationCalculation = {
  totalDays: number
  workDays: number
  weekendDays: number
  holidayDays: number
  halfDays: number
  vacationDaysNeeded: number
  holidays: HolidayInfo[]
}

type DateValidationResult = {
  isValid: boolean
  start?: Date
  end?: Date
  error?: string
}

// Helper functions
/**
 * Validates and parses date range input
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns Validation result with parsed dates or error
 */
function validateDateRange(
  startDate: string,
  endDate: string
): DateValidationResult {
  if (!startDate || !endDate) {
    return { isValid: false, error: 'Both start and end dates are required' }
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime())) {
    return { isValid: false, error: 'Invalid start date format' }
  }

  if (isNaN(end.getTime())) {
    return { isValid: false, error: 'Invalid end date format' }
  }

  if (start > end) {
    return { isValid: false, error: 'End date must be after start date' }
  }

  return { isValid: true, start, end }
}

/**
 * Creates a safe copy of a date to avoid mutation issues
 * @param date - Date to copy
 * @returns New Date instance
 */
function createDateCopy(date: Date): Date {
  return new Date(date.getTime())
}

/**
 * Safely gets Hebrew calendar events for a date
 * @param date - The date to check
 * @returns Array of events or empty array if error
 */
function getHebrewCalendarEvents(date: Date): Event[] {
  try {
    const hd = new HDate(date)
    return HebrewCalendar.getHolidaysOnDate(hd, true) || [] // true for Israel
  } catch (error) {
    console.warn('Error getting Hebrew calendar events for date:', date, error)
    return []
  }
}

/**
 * Determines if an event is a half-day holiday
 * @param event - The holiday event
 * @returns True if it's a half day
 */
function isHalfDayEvent(event: Event): boolean {
  const eventFlags = event.getFlags()
  const desc = event.getDesc()

  return !!(
    eventFlags & flags.EREV ||
    desc.includes('Erev') ||
    desc === 'Rosh Hashana LaBehemot' ||
    desc === 'Tu BiShvat'
  )
}

/**
 * Determines if an event is Chol Hamoed
 * @param event - The holiday event
 * @returns True if it's Chol Hamoed
 */
function isHolHamoedEvent(event: Event): boolean {
  return !!(event.getFlags() & flags.CHOL_HAMOED)
}

/**
 * Determines if an event is a major holiday that affects work days
 * @param event - The holiday event
 * @param includeHolHamoed - Whether to include Chol Hamoed as holidays
 * @returns True if it's a major holiday
 */
function isMajorHolidayEvent(event: Event, includeHolHamoed: boolean): boolean {
  const eventFlags = event.getFlags()
  const desc = event.getDesc()

  const isMajorHoliday =
    !!(eventFlags & flags.CHAG && !(eventFlags & flags.EREV)) || // Major holidays but not Erev
    !!(eventFlags & flags.YOM_TOV_ENDS) || // End of Yom Tov
    (includeHolHamoed && !!(eventFlags & flags.CHOL_HAMOED)) || // Intermediate days - only if enabled
    desc === 'Yom HaZikaron' ||
    desc === 'Yom HaAtzmaut' ||
    desc === 'Yom Yerushalayim'

  return isMajorHoliday && !desc.includes('Erev') // Exclude Erev holidays as they're handled as half days
}

/**
 * Calculates the number of days between two dates (inclusive)
 * @param startDate - The start date as a string (YYYY-MM-DD format)
 * @param endDate - The end date as a string (YYYY-MM-DD format)
 * @returns The number of days between the dates, or null if invalid
 */
export function calculateDaysBetween(
  startDate: string,
  endDate: string
): number | null {
  const validation = validateDateRange(startDate, endDate)
  if (!validation.isValid || !validation.start || !validation.end) {
    return null
  }

  const diffTime = validation.end.getTime() - validation.start.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 for inclusive range

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
  const events = getHebrewCalendarEvents(date)
  return events.some(isHalfDayEvent)
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
  const events = getHebrewCalendarEvents(date)
  return events.some((event) => isMajorHolidayEvent(event, includeHolHamoed))
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
): HolidayInfo[] {
  const validation = validateDateRange(startDate, endDate)
  if (!validation.isValid || !validation.start || !validation.end) {
    return []
  }

  const holidays: HolidayInfo[] = []
  const currentDate = createDateCopy(validation.start)

  while (currentDate <= validation.end) {
    const events = getHebrewCalendarEvents(currentDate)

    events.forEach((event: Event) => {
      const shouldInclude =
        isHalfDayEvent(event) || isMajorHolidayEvent(event, includeHolHamoed)

      if (shouldInclude) {
        holidays.push({
          date: currentDate.toISOString().split('T')[0],
          name: event.getDesc(),
          isHalfDay: isHalfDayEvent(event),
          isHolHamoed: isHolHamoedEvent(event)
        })
      }
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return holidays
}

/**
 * Calculates vacation days with detailed breakdown
 * @param startDate - The start date as a string (YYYY-MM-DD format)
 * @param endDate - The end date as a string (YYYY-MM-DD format)
 * @param includeHolHamoed - Whether to include Chol Hamoed as holidays
 * @returns Detailed breakdown of vacation calculation or null if invalid dates
 */
export function calculateVacationDaysDetailed(
  startDate: string,
  endDate: string,
  includeHolHamoed: boolean = true
): VacationCalculation | null {
  const validation = validateDateRange(startDate, endDate)
  if (!validation.isValid || !validation.start || !validation.end) {
    return null
  }

  const totalDays = calculateDaysBetween(startDate, endDate) || 0
  const holidays = getJewishHolidaysInRange(
    startDate,
    endDate,
    includeHolHamoed
  )

  let workDays = 0
  let weekendDays = 0
  let holidayDays = 0
  let halfDays = 0
  let vacationDaysNeeded = 0

  const currentDate = createDateCopy(validation.start)

  while (currentDate <= validation.end) {
    const dayValue = getWorkDayValue(currentDate, includeHolHamoed)

    // Categorize the day
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

// Constants for Hebrew pluralization
const HEBREW_DAY_FORMATS = {
  ONE: 'יום אחד',
  TWO: 'יומיים',
  MANY: 'ימים'
} as const

/**
 * Formats the day count with proper Hebrew pluralization
 * @param days - The number of days
 * @returns Formatted string with proper Hebrew pluralization
 */
export function formatDayCountHebrew(days: number): string {
  if (!Number.isInteger(days) || days < 0) {
    return `${days} ${HEBREW_DAY_FORMATS.MANY}`
  }

  switch (days) {
    case 1:
      return HEBREW_DAY_FORMATS.ONE
    case 2:
      return HEBREW_DAY_FORMATS.TWO
    default:
      return `${days} ${HEBREW_DAY_FORMATS.MANY}`
  }
}
