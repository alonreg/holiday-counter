export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(' ')
}

export {
  calculateDaysBetween,
  calculateVacationDaysDetailed,
  formatDayCountHebrew,
  getJewishHolidaysInRange,
  getWorkDayValue,
  isJewishHalfDay,
  isJewishHoliday,
  isWeekend,
  type HolidayInfo,
  type VacationCalculation
} from './date-utils'
