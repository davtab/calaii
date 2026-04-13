import { db } from '@/db'
import { foods, logEntries, goals } from '@/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import Link from 'next/link'
import CalendarNav from './calendar-nav'

type Status = 'goal' | 'under' | 'over' | 'empty'

function getStatus(consumed: number, goal: number): Status {
  if (consumed === 0) return 'empty'
  const pct = consumed / goal
  if (pct > 1.05) return 'over'
  if (pct >= 0.85) return 'goal'
  return 'under'
}

const STATUS_STYLES: Record<Status, string> = {
  goal:  'bg-emerald-100 text-emerald-800 border-emerald-200',
  under: 'bg-amber-100  text-amber-800  border-amber-200',
  over:  'bg-rose-100   text-rose-800   border-rose-200',
  empty: 'bg-white      text-zinc-600   border-zinc-100',
}

const STATUS_DOT: Record<Status, string> = {
  goal:  'bg-emerald-400',
  under: 'bg-amber-400',
  over:  'bg-rose-400',
  empty: '',
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const { year: yearStr, month: monthStr } = await searchParams
  const now = new Date()
  const year = parseInt(yearStr ?? String(now.getFullYear()))
  const month = parseInt(monthStr ?? String(now.getMonth() + 1))

  const daysInMonth = new Date(year, month, 0).getDate()
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`

  const [entries, goalsRows] = await Promise.all([
    db
      .select({
        date: logEntries.date,
        grams: logEntries.grams,
        calories: foods.calories,
      })
      .from(logEntries)
      .innerJoin(foods, eq(logEntries.foodId, foods.id))
      .where(and(gte(logEntries.date, start), lte(logEntries.date, end))),
    db.select().from(goals).limit(1),
  ])

  const goalCal = goalsRows[0]?.calories ?? 2000

  // Group by date → sum calories
  const dailyMap: Record<string, number> = {}
  for (const e of entries) {
    const key = typeof e.date === 'string' ? e.date.slice(0, 10) : String(e.date)
    dailyMap[key] = (dailyMap[key] ?? 0) + (e.calories * e.grams) / 100
  }

  // Calendar grid (Monday-first)
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay() // 0=Sun
  const startOffset = (firstDayOfMonth + 6) % 7 // 0=Mon
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7

  const today = new Date().toISOString().split('T')[0]

  // Stats for the month
  const daysWithData = Object.keys(dailyMap).length
  const goalDays = Object.values(dailyMap).filter((cal) => getStatus(cal, goalCal) === 'goal').length
  const underDays = Object.values(dailyMap).filter((cal) => getStatus(cal, goalCal) === 'under').length
  const overDays = Object.values(dailyMap).filter((cal) => getStatus(cal, goalCal) === 'over').length

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <CalendarNav year={year} month={month} />

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden mb-5">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-zinc-100">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-zinc-600">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {Array.from({ length: totalCells }).map((_, i) => {
            const dayNum = i - startOffset + 1
            if (dayNum < 1 || dayNum > daysInMonth) {
              return <div key={i} className="aspect-square border-r border-b border-zinc-50 last:border-r-0" />
            }

            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
            const consumed = dailyMap[dateStr] ?? 0
            const status = getStatus(consumed, goalCal)
            const isToday = dateStr === today
            const isFuture = dateStr > today

            return (
              <Link
                key={i}
                href={`/log?date=${dateStr}`}
                className={`
                  aspect-square border-r border-b border-zinc-100 p-1.5
                  flex flex-col items-center justify-between
                  hover:opacity-80 transition-opacity
                  ${!isFuture && status !== 'empty' ? STATUS_STYLES[status] : 'bg-white text-zinc-600 border-zinc-100'}
                `}
              >
                <span
                  className={`text-xs font-semibold leading-none ${
                    isToday
                      ? 'bg-zinc-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]'
                      : isFuture
                      ? 'text-zinc-300'
                      : ''
                  }`}
                >
                  {dayNum}
                </span>
                {!isFuture && status !== 'empty' && (
                  <span className="text-[9px] tabular-nums opacity-70 leading-none">
                    {Math.round(consumed)}
                  </span>
                )}
                {!isFuture && status !== 'empty' && (
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-5 text-xs">
        {[
          { color: 'bg-emerald-400', label: 'Objetivo (85–105%)' },
          { color: 'bg-amber-400',   label: `Bajo objetivo (<85%)` },
          { color: 'bg-rose-400',    label: 'Excedido (>105%)' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-zinc-500">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            {label}
          </div>
        ))}
      </div>

      {/* Monthly summary */}
      {daysWithData > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="font-semibold text-sm mb-3">Resumen del mes</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <div className="text-2xl font-bold text-emerald-700 tabular-nums">{goalDays}</div>
              <div className="text-xs text-emerald-600 mt-0.5">Objetivo</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="text-2xl font-bold text-amber-700 tabular-nums">{underDays}</div>
              <div className="text-xs text-amber-600 mt-0.5">Bajo objetivo</div>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
              <div className="text-2xl font-bold text-rose-700 tabular-nums">{overDays}</div>
              <div className="text-xs text-rose-600 mt-0.5">Excedido</div>
            </div>
          </div>
          <p className="text-xs text-zinc-600 mt-3 text-center">
            {daysWithData} día{daysWithData !== 1 ? 's' : ''} con registro este mes
          </p>
        </div>
      )}

      {daysWithData === 0 && (
        <div className="text-center py-8 text-zinc-600 text-sm bg-white rounded-xl border border-zinc-200">
          Sin registros este mes
        </div>
      )}
    </main>
  )
}
