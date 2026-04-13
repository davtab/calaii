import { db } from '@/db'
import { foods, logEntries } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { deleteLogEntry } from '@/app/actions'
import AddEntryForm from './add-entry-form'
import DateNav from './date-nav'
import LogTabs from './log-tabs'
import AiForm from './ai/ai-form'

const MEALS = ['desayuno', 'comida', 'merienda', 'cena'] as const
const MEAL_LABELS: Record<string, string> = {
  desayuno: 'Desayuno',
  comida:   'Comida',
  merienda: 'Merienda',
  cena:     'Cena',
}

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date: dateParam } = await searchParams
  const date = dateParam ?? new Date().toISOString().split('T')[0]

  const [entries, allFoods] = await Promise.all([
    db
      .select({
        id: logEntries.id,
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
      .where(eq(logEntries.date, date))
      .orderBy(logEntries.createdAt),
    db.select({ id: foods.id, name: foods.name, servingSize: foods.servingSize }).from(foods).orderBy(foods.name),
  ])

  const byMeal: Record<string, typeof entries> = Object.fromEntries(MEALS.map((m) => [m, []]))
  for (const e of entries) {
    if (byMeal[e.meal]) byMeal[e.meal].push(e)
    else byMeal[e.meal] = [e]
  }

  const totals = entries.reduce(
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

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <DateNav date={date} />

      {entries.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 p-4 mb-5 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <div><span className="text-zinc-700">Calorías </span><strong className="tabular-nums">{Math.round(totals.calories)}</strong></div>
          <div><span className="text-cyan-600">Proteína </span><strong className="tabular-nums">{Math.round(totals.protein)}g</strong></div>
          <div><span className="text-lime-600">Carbos </span><strong className="tabular-nums">{Math.round(totals.carbs)}g</strong></div>
          <div><span className="text-pink-600">Grasa </span><strong className="tabular-nums">{Math.round(totals.fat)}g</strong></div>
        </div>
      )}

      <div className="space-y-3 mb-8">
        {MEALS.map((meal) => {
          const mealEntries = byMeal[meal]
          if (mealEntries.length === 0) return null
          return (
            <div key={meal} className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-zinc-100 text-sm font-bold text-zinc-900">
                {MEAL_LABELS[meal]}
              </div>
              <div className="divide-y divide-zinc-100">
                {mealEntries.map((e) => {
                  const f = e.grams / 100
                  return (
                    <div key={e.id} className="px-4 py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{e.foodName}</div>
                        <div className="text-xs text-zinc-700 mt-0.5 tabular-nums">
                          {e.grams}g · {Math.round(e.calories * f)} kcal · P {Math.round(e.protein * f)}g · C {Math.round(e.carbs * f)}g · G {Math.round(e.fat * f)}g
                        </div>
                      </div>
                      <form action={deleteLogEntry.bind(null, e.id)}>
                        <button type="submit" className="text-zinc-300 hover:text-rose-500 transition-colors text-xl leading-none flex-shrink-0">×</button>
                      </form>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {entries.length === 0 && (
          <div className="text-center py-8 text-zinc-700 text-sm bg-white rounded-xl border border-zinc-200">
            Sin entradas para este día
          </div>
        )}
      </div>

      <LogTabs
        manualForm={<AddEntryForm foods={allFoods} date={date} />}
        aiForm={<AiForm today={date} />}
      />
    </main>
  )
}
