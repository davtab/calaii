'use client'

import { useState } from 'react'
import { updateGoals } from '@/app/actions'

type Goals = { calories: number; protein: number; carbs: number; fat: number }

export default function GoalsForm({ current }: { current: Goals }) {
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setSaved(false)
    await updateGoals(new FormData(e.currentTarget))
    setPending(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const inputCls = 'w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 text-zinc-900'
  const labelCls = 'text-sm font-bold text-zinc-900 mb-1.5 block'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Calorías diarias (kcal)</label>
        <input type="number" name="calories" min="1" step="1" defaultValue={current.calories} required className={inputCls} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Proteína (g)</label>
          <input type="number" name="protein" min="1" step="1" defaultValue={current.protein} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Carbos (g)</label>
          <input type="number" name="carbs" min="1" step="1" defaultValue={current.carbs} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Grasa (g)</label>
          <input type="number" name="fat" min="1" step="1" defaultValue={current.fat} required className={inputCls} />
        </div>
      </div>
      <button type="submit" disabled={pending}
        className="w-full bg-violet-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-violet-700 disabled:opacity-50 transition-colors">
        {saved ? '✓ Guardado' : pending ? 'Guardando...' : 'Guardar metas'}
      </button>
    </form>
  )
}
