import { db } from '@/db'
import { foods, combos, comboItems } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { deleteCombo, deleteFood } from '@/app/actions'
import FoodForm from './food-form'
import ComboForm from './combo-form'
import AddComboBtn from './add-combo-btn'
import ComboTabNav from './tab-nav'

export default async function CombosPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab: tabParam } = await searchParams
  const tab = tabParam === 'combos' ? 'combos' : 'alimentos'

  const allFoods = await db.select().from(foods).orderBy(foods.name)

  if (tab === 'alimentos') {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Alimentos</h1>
        <ComboTabNav active="alimentos" />

        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <h2 className="font-bold text-sm mb-4">Añadir alimento</h2>
          <FoodForm />
        </div>

        {allFoods.length === 0 ? (
          <div className="text-center py-8 text-zinc-700 text-sm bg-white rounded-xl border border-zinc-200">
            Sin alimentos. Agrega uno arriba.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] px-4 py-2.5 text-xs font-bold text-zinc-900 border-b border-zinc-100 bg-zinc-50 gap-4">
              <div>Nombre</div>
              <div className="text-right">Kcal</div>
              <div className="text-right">P / C / G</div>
              <div />
            </div>
            <div className="divide-y divide-zinc-100">
              {allFoods.map((f) => (
                <div key={f.id} className="grid grid-cols-[1fr_auto_auto_auto] px-4 py-3 items-center gap-4 text-sm">
                  <div className="font-semibold truncate">{f.name}</div>
                  <div className="text-right tabular-nums font-medium">{f.calories}</div>
                  <div className="text-right tabular-nums text-xs text-zinc-700">
                    {f.protein}g / {f.carbs}g / {f.fat}g
                  </div>
                  <form action={deleteFood.bind(null, f.id)}>
                    <button type="submit" className="text-zinc-300 hover:text-rose-500 transition-colors text-xl leading-none">×</button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    )
  }

  // ── Combos tab ──────────────────────────────────────────────────────────────
  const allCombos = await db.select({ id: combos.id, name: combos.name }).from(combos).orderBy(combos.name)

  const combosWithItems = await Promise.all(
    allCombos.map(async (combo) => {
      const items = await db
        .select({
          grams: comboItems.grams,
          foodName: foods.name,
          calories: foods.calories,
          protein: foods.protein,
          carbs: foods.carbs,
          fat: foods.fat,
        })
        .from(comboItems)
        .innerJoin(foods, eq(comboItems.foodId, foods.id))
        .where(eq(comboItems.comboId, combo.id))

      const totals = items.reduce(
        (acc, i) => {
          const f = i.grams / 100
          return {
            calories: acc.calories + i.calories * f,
            protein: acc.protein + i.protein * f,
            carbs: acc.carbs + i.carbs * f,
            fat: acc.fat + i.fat * f,
          }
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      )
      return { ...combo, items, totals }
    })
  )

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Combos</h1>
      <ComboTabNav active="combos" />

      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
        <h2 className="font-bold text-sm mb-4">Nuevo combo</h2>
        <ComboForm foods={allFoods.map(f => ({ id: f.id, name: f.name }))} />
      </div>

      {combosWithItems.length === 0 ? (
        <div className="text-center py-8 text-zinc-700 text-sm bg-white rounded-xl border border-zinc-200">
          Sin combos. Crea uno arriba.
        </div>
      ) : (
        <div className="space-y-3">
          {combosWithItems.map((combo) => (
            <div key={combo.id} className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-100">
                <div>
                  <div className="font-bold">{combo.name}</div>
                  <div className="text-xs text-zinc-700 mt-0.5 tabular-nums">
                    {Math.round(combo.totals.calories)} kcal · P {Math.round(combo.totals.protein)}g · C {Math.round(combo.totals.carbs)}g · G {Math.round(combo.totals.fat)}g
                  </div>
                </div>
                <form action={deleteCombo.bind(null, combo.id)}>
                  <button type="submit" className="text-zinc-300 hover:text-rose-500 transition-colors text-xl leading-none ml-4">×</button>
                </form>
              </div>
              <div className="px-4 py-2 flex flex-wrap gap-1.5 border-b border-zinc-100">
                {combo.items.map((item, i) => (
                  <span key={i} className="text-xs bg-violet-100 text-violet-800 rounded-full px-2.5 py-0.5 font-medium">
                    {item.foodName} {item.grams}g
                  </span>
                ))}
              </div>
              <div className="px-4 py-3">
                <AddComboBtn comboId={combo.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
