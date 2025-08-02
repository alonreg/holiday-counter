import { useState } from 'react'

function App() {
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const calculateDays = (): number | null => {
    if (!startDate || !endDate) return null

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start > end) return null

    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  const dayCount = calculateDays()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          holiday-counter
        </h1>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="start-date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="end-date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-md text-center">
            {dayCount !== null ? (
              <div>
                <p className="text-2xl font-bold text-blue-600">{dayCount}</p>
                <p className="text-sm text-gray-600">
                  {dayCount === 1 ? 'day' : 'days'} between dates
                </p>
              </div>
            ) : (
              <p className="text-gray-500">
                {!startDate || !endDate
                  ? 'Select both dates to see the count'
                  : 'End date must be after start date'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
