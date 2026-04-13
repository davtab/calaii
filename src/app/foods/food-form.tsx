'use client'

import { useRef, useState } from 'react'
import { addFood } from '@/app/actions'

export default function FoodForm() {
  const [pending, setPending] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    await addFood(new FormData(e.currentTarget))
    formRef.current?.reset()
    setPending(false)
  }

  const inputCls =
    'w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300'

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs text-zinc-700 mb-1 block">Nombre</label>
        <input type="text" name="name" required placeholder="Ej. Pechuga de pollo" className={inputCls} />
      </div>
      <p className="text-xs text-zinc-400 pt-1">Valores por 100g</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-700 mb-1 block">Calorías (kcal)</label>
          <input type="number" name="calories" min="0" step="0.1" required placeholder="0" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-zinc-700 mb-1 block">Proteína (g)</label>
          <input type="number" name="protein" min="0" step="0.1" required placeholder="0" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-zinc-700 mb-1 block">Carbohidratos (g)</label>
          <input type="number" name="carbs" min="0" step="0.1" required placeholder="0" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-zinc-700 mb-1 block">Grasa (g)</label>
          <input type="number" name="fat" min="0" step="0.1" required placeholder="0" className={inputCls} />
        </div>
      </div>
      <div>
        <label className="text-xs text-zinc-700 mb-1 block">Porción habitual (g)</label>
        <input type="number" name="servingSize" min="1" step="1" placeholder="100" className={inputCls} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-violet-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
      >
        {pending ? 'Guardando...' : 'Guardar alimento'}
      </button>
    </form>
  )
}
