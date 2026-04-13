import { db } from '@/db'
import { foods } from '@/db/schema'
import { deleteFood } from '@/app/actions'
import FoodForm from './food-form'

export default async function FoodsPage() {
  const allFoods = await db.select().from(foods).orderBy(foods.name)

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Alimentos</h1>

      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
        <h2 className="font-semibold text-sm mb-4">Agregar alimento</h2>
        <FoodForm />
      </div>

      {allFoods.length === 0 ? (
        <div className="text-center py-8 text-zinc-600 text-sm bg-white rounded-xl border border-zinc-200">
          Sin alimentos. Agrega uno arriba.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] px-4 py-2.5 text-xs font-medium text-zinc-600 border-b border-zinc-100 bg-zinc-50 gap-4">
            <div>Alimento</div>
            <div className="text-right">Kcal</div>
            <div className="text-right">P / C / G</div>
            <div />
          </div>
          <div className="divide-y divide-zinc-100">
            {allFoods.map((f) => (
              <div key={f.id} className="grid grid-cols-[1fr_auto_auto_auto] px-4 py-3 items-center gap-4 text-sm">
                <div className="font-medium truncate">{f.name}</div>
                <div className="text-right tabular-nums text-zinc-600">{f.calories}</div>
                <div className="text-right tabular-nums text-xs text-zinc-600">
                  {f.protein}g / {f.carbs}g / {f.fat}g
                </div>
                <form action={deleteFood.bind(null, f.id)}>
                  <button
                    type="submit"
                    className="text-zinc-300 hover:text-rose-500 transition-colors text-xl leading-none"
                  >
                    ×
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
