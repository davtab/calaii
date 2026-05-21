import { db } from '@/db'
import { studyTests, studyHours } from '@/db/schema'
import { sql } from 'drizzle-orm'
import AddTestForm from './study-add-test'
import AddTimeButtons from './study-add-time'

const GOAL_TESTS = 200
const GOAL_HOURS = 50
const DEADLINE_MS = Date.UTC(2026, 5, 13)

function Ring({ pct, color }: { pct: number; color: string }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const fill = Math.min(1, Math.max(0, pct)) * circ
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
      <circle cx="48" cy="48" r={r} fill="none" strokeWidth="9" stroke="#e4e4e7" />
      <circle
        cx="48" cy="48" r={r} fill="none" strokeWidth="9"
        stroke={color}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  )
}

export default async function StudySection() {
  const now = new Date()
  const todayMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const daysLeft = Math.max(0, Math.ceil((DEADLINE_MS - todayMs) / 86_400_000))

  const [testRows, hoursResult, dailyRaw] = await Promise.all([
    db.select({ score: studyTests.score }).from(studyTests).orderBy(studyTests.createdAt),
    db
      .select({ total: sql<number>`coalesce(sum(${studyHours.minutes}), 0)` })
      .from(studyHours),
    db
      .select({
        day: sql<string>`(${studyHours.createdAt})::date`,
        minutes: sql<number>`sum(${studyHours.minutes})`,
      })
      .from(studyHours)
      .groupBy(sql`(${studyHours.createdAt})::date`)
      .orderBy(sql`(${studyHours.createdAt})::date`),
  ])

  const totalTests = testRows.length
  const totalMinutes = Number(hoursResult[0]?.total ?? 0)
  const totalHours = totalMinutes / 60
  const scores = testRows.map((r) => r.score)
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  const testPct = totalTests / GOAL_TESTS
  const hoursPct = totalHours / GOAL_HOURS
  const testsLeft = Math.max(0, GOAL_TESTS - totalTests)
  const hoursLeft = Math.max(0, GOAL_HOURS - totalHours)
  const testsPerDay = daysLeft > 0 ? Math.ceil(testsLeft / daysLeft) : testsLeft
  const hoursPerDay = daysLeft > 0 ? (hoursLeft / daysLeft).toFixed(1) : '0'

  const hoursMap: Record<string, number> = {}
  for (const row of dailyRaw) hoursMap[String(row.day)] = Number(row.minutes)
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const ms = todayMs - (13 - i) * 86_400_000
    const key = new Date(ms).toISOString().split('T')[0]
    return { key, minutes: hoursMap[key] ?? 0 }
  })
  const maxDayMinutes = Math.max(...last14.map((d) => d.minutes), 60)

  const last20Scores = scores.slice(-20)
  const hasScores = last20Scores.length > 0
  const hasHourChart = last14.some((d) => d.minutes > 0)

  const motiveLine =
    testPct >= 0.5 && hoursPct >= 0.5
      ? '¡Vas por buen camino! Sigue así.'
      : daysLeft <= 7
      ? '¡Última semana! Todo cuenta.'
      : `${testsPerDay} tests y ${hoursPerDay}h de estudio al día para llegar.`

  return (
    <section>
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-2xl p-5 mb-3 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-0.5">
              Reto de estudio
            </p>
            <h2 className="text-2xl font-black leading-tight">Oposición Junio 2026</h2>
            <p className="text-white/80 text-sm mt-1">{motiveLine}</p>
          </div>
          <div className="flex-shrink-0 flex flex-col items-center bg-white/25 backdrop-blur-sm rounded-xl px-4 py-2.5">
            <span className="text-3xl font-black tabular-nums leading-none">{daysLeft}</span>
            <span className="text-[11px] text-white/80 mt-0.5">días</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-white/70 mb-1">
            <span>Progreso global</span>
            <span>{Math.round(((testPct + hoursPct) / 2) * 100)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${Math.round(((testPct + hoursPct) / 2) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Progress rings */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-xl border border-zinc-200 p-4 flex flex-col items-center">
          <div className="relative mb-1.5">
            <Ring pct={testPct} color="#f59e0b" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold tabular-nums leading-none">
                {Math.round(testPct * 100)}%
              </span>
            </div>
          </div>
          <div className="text-sm font-bold text-zinc-900">Tests</div>
          <div className="text-xs text-zinc-500 tabular-nums">
            {totalTests} / {GOAL_TESTS}
          </div>
          <div className="mt-2 text-center space-y-0.5">
            <div className="text-xs text-zinc-700">
              Faltan <strong>{testsLeft}</strong>
            </div>
            <div className="text-[11px] text-zinc-400">{testsPerDay}/día necesarios</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-4 flex flex-col items-center">
          <div className="relative mb-1.5">
            <Ring pct={hoursPct} color="#f97316" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold tabular-nums leading-none">
                {Math.round(hoursPct * 100)}%
              </span>
            </div>
          </div>
          <div className="text-sm font-bold text-zinc-900">Horas</div>
          <div className="text-xs text-zinc-500 tabular-nums">
            {totalHours.toFixed(1)} / {GOAL_HOURS}h
          </div>
          <div className="mt-2 text-center space-y-0.5">
            <div className="text-xs text-zinc-700">
              Faltan <strong>{hoursLeft.toFixed(1)}h</strong>
            </div>
            <div className="text-[11px] text-zinc-400">{hoursPerDay}h/día necesarias</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {(hasScores || hasHourChart) && (
        <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-3 space-y-4">
          {hasScores && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                  Últimas notas
                </span>
                <span className="text-xs text-zinc-500">
                  Media:{' '}
                  <strong
                    className={
                      avgScore >= 80
                        ? 'text-emerald-600'
                        : avgScore >= 60
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }
                  >
                    {avgScore.toFixed(1)}/100
                  </strong>
                </span>
              </div>
              <div className="flex items-end gap-0.5 h-12">
                {last20Scores.map((s, i) => {
                  const h = Math.max(4, (s / 100) * 48)
                  const bg =
                    s >= 80 ? 'bg-emerald-400' : s >= 60 ? 'bg-amber-400' : 'bg-rose-400'
                  return (
                    <div
                      key={i}
                      title={`${s}/100`}
                      className={`flex-1 rounded-t-sm ${bg}`}
                      style={{ height: `${h}px` }}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between text-[10px] text-zinc-300 mt-1">
                <span>anterior</span>
                <span>reciente</span>
              </div>
            </div>
          )}

          {hasHourChart && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                  Estudio por día
                </span>
                <span className="text-xs text-zinc-400">últimas 2 semanas</span>
              </div>
              <div className="flex items-end gap-0.5 h-10">
                {last14.map((d) => {
                  const h = d.minutes > 0 ? Math.max(4, (d.minutes / maxDayMinutes) * 40) : 2
                  return (
                    <div
                      key={d.key}
                      title={`${(d.minutes / 60).toFixed(1)}h`}
                      className={`flex-1 rounded-t-sm ${d.minutes > 0 ? 'bg-orange-400' : 'bg-zinc-100'}`}
                      style={{ height: `${h}px` }}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4">
        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
          Registrar
        </p>
        <div className="space-y-2">
          <AddTestForm />
          <AddTimeButtons />
        </div>
      </div>
    </section>
  )
}
