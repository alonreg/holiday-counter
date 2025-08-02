import { useState } from 'react'
import { calculateVacationDaysDetailed, formatDayCountHebrew } from '../utils'
import WowTitle from './WowTitle'

function App() {
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [includeHolHamoed, setIncludeHolHamoed] = useState<boolean>(true)

  const vacationDetails = calculateVacationDaysDetailed(
    startDate,
    endDate,
    includeHolHamoed
  )

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Amazing title at the top */}
      <WowTitle title="כמה ימי חופש זה יעלה לי?" />

      {/* Main content */}
      <div className="flex items-center justify-center px-4 pb-8">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-xl max-w-md w-full mx-4 border border-white/20">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="start-date"
                className="block text-sm font-medium text-gray-700 mb-2 text-right"
              >
                תאריך התחלה
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label
                htmlFor="end-date"
                className="block text-sm font-medium text-gray-700 mb-2 text-right"
              >
                תאריך סיום
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
                dir="ltr"
              />
            </div>

            <div className="flex items-center justify-end">
              <label
                htmlFor="include-hol-hamoed"
                className="flex items-center cursor-pointer"
              >
                <span className="text-sm text-gray-700 ml-2">
                  כולל חול המועד (פסח וסוכות)
                </span>
                <input
                  id="include-hol-hamoed"
                  type="checkbox"
                  checked={includeHolHamoed}
                  onChange={(e) => setIncludeHolHamoed(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
              </label>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-md text-center">
              {vacationDetails !== null ? (
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {vacationDetails.vacationDaysNeeded % 1 === 0
                      ? vacationDetails.vacationDaysNeeded
                      : vacationDetails.vacationDaysNeeded.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {vacationDetails.vacationDaysNeeded % 1 === 0
                      ? formatDayCountHebrew(vacationDetails.vacationDaysNeeded)
                      : `${vacationDetails.vacationDaysNeeded.toFixed(
                          1
                        )} ימי`}{' '}
                    חופש נדרשים
                  </p>

                  {/* Breakdown */}
                  <div className="mt-4 text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>סה"כ ימים:</span>
                      <span>{vacationDetails.totalDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ימי עבודה:</span>
                      <span>{vacationDetails.workDays}</span>
                    </div>
                    {vacationDetails.halfDays > 0 && (
                      <div className="flex justify-between">
                        <span>חצי ימים:</span>
                        <span>{vacationDetails.halfDays}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>סופי שבוע:</span>
                      <span>{vacationDetails.weekendDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>חגים יהודיים:</span>
                      <span>{vacationDetails.holidayDays}</span>
                    </div>
                  </div>

                  {/* Holiday list */}
                  {vacationDetails.holidays.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                      <p className="text-xs font-medium text-yellow-800 mb-2">
                        חגים בתקופה:
                      </p>
                      <div className="text-xs text-yellow-700 space-y-1">
                        {vacationDetails.holidays.map((holiday, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span>{holiday.name}</span>
                            <span className="text-xs">
                              {new Date(holiday.date).toLocaleDateString(
                                'he-IL'
                              )}
                              {holiday.isHalfDay && ' (חצי יום)'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">
                  {!startDate || !endDate
                    ? 'בחרו שני תאריכים כדי לראות את חישוב ימי החופש'
                    : 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
