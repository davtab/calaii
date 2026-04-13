import { db } from '@/db'
import { foods, logEntries, goals } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function ProgressBar({ value, max, colorClass }: { value: number; max: number; colorClass: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

const MEAL_CONFIG = [
  { key: 'desayuno', label: 'Desayuno', color: 'bg-orange-400', pct: 0.20 },
  { key: 'comida',   label: 'Comida',   color: 'bg-lime-500',   pct: 0.35 },
  { key: 'merienda', label: 'Merienda', color: 'bg-cyan-400',   pct: 0.15 },
  { key: 'cena',     label: 'Cena',     color: 'bg-violet-500', pct: 0.30 },
] as const

export default async function DashboardPage() {
  const today = getToday()

  const [entries, goalsRows] = await Promise.all([
    db
      .select({
        meal: logEntries.meal,
        grams: logEntries.grams,
        foodName: foods.name,
        calories: foods.calories,
        protein: foods.protein,
        carbs: foods.carbs,
        fat: foods.fat,
      })
      .from(logEntries)
      .innerJoin(foods, eq(logEntries.foodId, foods.id))
      .where(eq(logEntries.date, today))
      .orderBy(logEntries.createdAt),
    db.select().from(goals).limit(1),
  ])

  const g = goalsRows[0] ?? { calories: 2330, protein: 175, carbs: 250, fat: 70 }

  function calcMacros(subset: typeof entries) {
    return subset.reduce(
      (acc, e) => {
        const f = e.grams / 100
        return {
          calories: acc.calories + e.calories * f,
          protein: acc.protein + e.protein * f,
          carbs: acc.carbs + e.carbs * f,
          fat: acc.fat + e.fat * f,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  const totals = calcMacros(entries)
  const mealTotals = Object.fromEntries(
    MEAL_CONFIG.map(({ key }) => [key, calcMacros(entries.filter((e) => e.meal === key))])
  )
  const mealEntries = Object.fromEntries(
    MEAL_CONFIG.map(({ key }) => [key, entries.filter((e) => e.meal === key)])
  )

  const remaining = Math.round(g.calories - totals.calories)
  const dateStr = new Date(today + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold capitalize">{dateStr}</h1>
          <p className="text-zinc-700 text-sm mt-0.5">Resumen de hoy</p>
        </div>
        <Link href="/log" className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">
          + Registrar
        </Link>
      </div>

      {/* Calorías */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-4">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-5xl font-bold tabular-nums">{Math.round(totals.calories)}</div>
            <div className="text-zinc-700 text-sm mt-1">kcal consumidas</div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-semibold tabular-nums ${remaining < 0 ? 'text-rose-500' : 'text-zinc-700'}`}>
              {remaining < 0 ? '+' : ''}{Math.abs(remaining)}
            </div>
            <div className="text-zinc-700 text-sm">{remaining < 0 ? 'excedido' : 'restantes'}</div>
          </div>
        </div>
        <ProgressBar value={totals.calories} max={g.calories} colorClass="bg-orange-400" />
        <div className="flex justify-between text-xs text-zinc-700 mt-1.5">
          <span>Meta: {Math.round(g.calories)} kcal</span>
          <span>{Math.round(Math.min(100, (totals.calories / g.calories) * 100))}%</span>
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Proteína', value: totals.protein, goal: g.protein, color: 'bg-cyan-500',   text: 'text-cyan-700' },
          { label: 'Carbos',   value: totals.carbs,   goal: g.carbs,   color: 'bg-lime-500',   text: 'text-lime-700' },
          { label: 'Grasa',    value: totals.fat,     goal: g.fat,     color: 'bg-pink-500',   text: 'text-pink-700' },
        ].map(({ label, value, goal, color, text }) => (
          <div key={label} className="bg-white rounded-xl border border-zinc-200 p-4">
            <div className={`text-xs font-bold mb-1 ${text}`}>{label}</div>
            <div className="text-xl font-bold tabular-nums">{Math.round(value)}g</div>
            <div className="text-xs text-zinc-700 mb-2.5">de {goal}g</div>
            <ProgressBar value={value} max={goal} colorClass={color} />
          </div>
        ))}
      </div>

      {/* Barras por comida */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-zinc-100 text-sm font-bold">Por comida</div>
        <div className="divide-y divide-zinc-100">
          {MEAL_CONFIG.map(({ key, label, color, pct }) => {
            const mealCal = mealTotals[key]?.calories ?? 0
            const mealGoal = g.calories * pct
            return (
              <div key={key} className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-sm tabular-nums text-zinc-800">
                    <strong>{Math.round(mealCal)}</strong>
                    <span className="text-zinc-600"> / {Math.round(mealGoal)} kcal</span>
                  </span>
                </div>
                <ProgressBar value={mealCal} max={mealGoal} colorClass={color} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Comidas del día */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-base px-1">Comidas de hoy</h2>
          {MEAL_CONFIG.map(({ key, label }) => {
            const items = mealEntries[key]
            if (!items.length) return null
            const mealTotal = mealTotals[key]
            return (
              <div key={key} className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between">
                  <span className="font-bold text-sm">{label}</span>
                  <span className="text-xs text-zinc-700 tabular-nums">
                    {Math.round(mealTotal.calories)} kcal · P {Math.round(mealTotal.protein)}g · C {Math.round(mealTotal.carbs)}g · G {Math.round(mealTotal.fat)}g
                  </span>
                </div>
                <div className="divide-y divide-zinc-100">
                  {items.map((e, i) => {
                    const f = e.grams / 100
                    return (
                      <div key={i} className="px-4 py-2.5">
                        <div className="font-medium text-sm">{e.foodName}</div>
                        <div className="text-xs text-zinc-700 mt-0.5 tabular-nums">
                          {e.grams}g · {Math.round(e.calories * f)} kcal · P {Math.round(e.protein * f)}g · C {Math.round(e.carbs * f)}g · G {Math.round(e.fat * f)}g
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-10 bg-white rounded-xl border border-zinc-200">
          <p className="text-zinc-700">Sin registros hoy</p>
          <Link href="/log" className="text-violet-600 text-sm mt-2 inline-block hover:underline font-medium">
            Registrar una comida →
          </Link>
        </div>
      )}
    </main>
  )
}
