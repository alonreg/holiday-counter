export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(' ')
}

export {
  calculateDaysBetween,
  calculateVacationDaysDetailed,
  getWorkDayValue,
  isWeekend,
  isJewishHoliday,
  isJewishHalfDay,
  getJewishHolidaysInRange,
  formatDayCountHebrew
} from './date-utils'
