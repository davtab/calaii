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

  const inputCls = 'w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 text-zinc-900'
  const labelCls = 'text-xs font-bold text-zinc-900 mb-1 block'

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={labelCls}>Nombre</label>
        <input type="text" name="name" required placeholder="Ej. Pechuga de pollo" className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Calorías (kcal)</label>
          <input type="number" name="calories" min="0" step="0.1" required placeholder="0" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Proteína (g)</label>
          <input type="number" name="protein" min="0" step="0.1" required placeholder="0" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Carbohidratos (g)</label>
          <input type="number" name="carbs" min="0" step="0.1" required placeholder="0" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Grasa (g)</label>
          <input type="number" name="fat" min="0" step="0.1" required placeholder="0" className={inputCls} />
        </div>
      </div>
      <button type="submit" disabled={pending}
        className="w-full bg-violet-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-violet-700 disabled:opacity-50 transition-colors">
        {pending ? 'Guardando...' : 'Guardar alimento'}
      </button>
    </form>
  )
}
