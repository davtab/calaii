'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { addLogEntry } from '@/app/actions'

type Food = { id: number; name: string; servingSize: number | null }

export default function AddEntryForm({ foods, date }: { foods: Food[]; date: string }) {
  const [pending, setPending] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const formData = new FormData(e.currentTarget)
    await addLogEntry(formData)
    formRef.current?.reset()
    router.refresh()
    setPending(false)
  }

  if (foods.length === 0) {
    return (
      <p className="text-zinc-900 text-sm">
        Primero agrega alimentos en <a href="/combos" className="underline text-violet-600 font-medium">Alimentos</a>.
      </p>
    )
  }

  const inputCls = 'w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 text-zinc-900'
  const labelCls = 'text-xs font-bold text-zinc-900 mb-1 block'

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      <input type="hidden" name="date" value={date} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Alimento</label>
          <select name="foodId" required className={inputCls}>
            {foods.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Comida</label>
          <select name="meal" required className={inputCls}>
            <option value="desayuno">Desayuno</option>
            <option value="comida">Comida</option>
            <option value="merienda">Merienda</option>
            <option value="cena">Cena</option>
          </select>
        </div>
      </div>

      <button type="submit" disabled={pending}
        className="w-full bg-violet-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-violet-700 disabled:opacity-50 transition-colors">
        {pending ? 'Agregando...' : 'Agregar entrada'}
      </button>
    </form>
  )
}
