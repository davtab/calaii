'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addComboToLog } from '@/app/actions'

const MEALS = [
  { value: 'desayuno', label: 'Desayuno' },
  { value: 'comida',   label: 'Comida' },
  { value: 'merienda', label: 'Merienda' },
  { value: 'cena',     label: 'Cena' },
]

export default function AddComboBtn({ comboId }: { comboId: number }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleAdd(meal: string) {
    setPending(true)
    const today = new Date().toISOString().split('T')[0]
    await addComboToLog(comboId, meal, today)
    router.refresh()
    setOpen(false)
    setPending(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
      >
        + Agregar a hoy
      </button>
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      <span className="text-xs text-zinc-400">¿Cuándo?</span>
      {MEALS.map((m) => (
        <button
          key={m.value}
          onClick={() => handleAdd(m.value)}
          disabled={pending}
          className="text-xs font-medium px-2.5 py-1 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {m.label}
        </button>
      ))}
      <button
        onClick={() => setOpen(false)}
        className="text-xs text-zinc-400 hover:text-zinc-700 px-1"
      >
        cancelar
      </button>
    </div>
  )
}
