'use client'

import { useState } from 'react'
import { createCombo } from '@/app/actions'

type Food = { id: number; name: string }

export default function ComboForm({ foods }: { foods: Food[] }) {
  const [name, setName] = useState('')
  const [items, setItems] = useState([{ foodId: foods[0]?.id ?? 0, grams: 100 }])
  const [pending, setPending] = useState(false)

  function addItem() {
    setItems((prev) => [...prev, { foodId: foods[0]?.id ?? 0, grams: 100 }])
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateItem(i: number, field: 'foodId' | 'grams', value: number) {
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || items.length === 0) return
    setPending(true)
    await createCombo(name, items)
    setName('')
    setItems([{ foodId: foods[0]?.id ?? 0, grams: 100 }])
    setPending(false)
  }

  if (foods.length === 0) {
    return (
      <p className="text-zinc-400 text-sm">
        Primero agrega alimentos en <a href="/foods" className="underline text-zinc-600">Alimentos</a>.
      </p>
    )
  }

  const inputCls = 'border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300'

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs text-zinc-700 mb-1 block">Nombre de la combinación</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Ej. Yogur con arándanos"
          className={`w-full ${inputCls}`}
        />
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="flex-1">
              {i === 0 && <label className="text-xs text-zinc-700 mb-1 block">Alimento</label>}
              <select
                value={item.foodId}
                onChange={(e) => updateItem(i, 'foodId', parseInt(e.target.value))}
                className={`w-full ${inputCls}`}
              >
                {foods.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div className="w-24">
              {i === 0 && <label className="text-xs text-zinc-700 mb-1 block">Gramos</label>}
              <input
                type="number"
                min="1"
                step="1"
                value={item.grams}
                onChange={(e) => updateItem(i, 'grams', parseFloat(e.target.value))}
                className={inputCls}
              />
            </div>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="pb-2 text-zinc-300 hover:text-rose-500 transition-colors text-xl leading-none"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="text-sm text-zinc-700 hover:text-zinc-800 transition-colors"
      >
        + Añadir ingrediente
      </button>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-violet-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
      >
        {pending ? 'Guardando...' : 'Guardar combinación'}
      </button>
    </form>
  )
}
