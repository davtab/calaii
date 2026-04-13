import { db } from '@/db'
import { goals } from '@/db/schema'
import GoalsForm from './goals-form'

export default async function GoalsPage() {
  const rows = await db.select().from(goals).limit(1)
  const current = rows[0] ?? { calories: 2330, protein: 175, carbs: 250, fat: 70 }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Metas diarias</h1>
      <p className="text-zinc-600 text-sm mb-6">Tus objetivos de macros y calorías por día.</p>
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <GoalsForm current={current} />
      </div>
    </main>
  )
}
