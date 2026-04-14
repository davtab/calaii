'use client'

import { useState, useTransition } from 'react'
import { updateLogEntry, deleteLogEntry } from '@/app/actions'

const MEALS = ['desayuno', 'comida', 'merienda', 'cena'] as const
const MEAL_LABELS: Record<string, string> = {
  desayuno: 'Desayuno',
  comida: 'Comida',
  merienda: 'Merienda',
  cena: 'Cena',
}

type Props = {
  id: number
  foodName: string
  grams: number
  meal: string
  macroLine: string
}

export default function EditEntryForm({ id, foodName, grams, meal, macroLine }: Props) {
  const [editing, setEditing] = useState(false)
  const [gramsVal, setGramsVal] = useState(String(grams))
  const [mealVal, setMealVal] = useState(meal)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    const parsed = parseFloat(gramsVal)
    startTransition(async () => {
      await updateLogEntry(id, parsed, mealVal)
      setEditing(false)
    })
  }

  if (!editing) {
    return (
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate">{foodName}</div>
          <div className="text-xs text-zinc-700 mt-0.5 tabular-nums">{macroLine}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="text-zinc-400 hover:text-zinc-700 transition-colors text-sm"
            aria-label="Editar"
          >
            ✎
          </button>
          <form action={deleteLogEntry.bind(null, id)}>
            <button type="submit" className="text-zinc-300 hover:text-rose-500 transition-colors text-xl leading-none">×</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-3 space-y-2">
      <div className="font-semibold text-sm truncate">{foodName}</div>
      <div className="flex gap-2 items-center">
        <input
          type="number"
          min="1"
          step="any"
          value={gramsVal}
          onChange={(e) => setGramsVal(e.target.value)}
          className="w-24 border border-zinc-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          placeholder="Gramos"
        />
        <span className="text-sm text-zinc-500">g</span>
        <select
          value={mealVal}
          onChange={(e) => setMealVal(e.target.value)}
          className="flex-1 border border-zinc-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 bg-white"
        >
          {MEALS.map((m) => (
            <option key={m} value={m}>{MEAL_LABELS[m]}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-3 py-1 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Guardando…' : 'Guardar'}
        </button>
        <button
          onClick={() => { setGramsVal(String(grams)); setMealVal(meal); setEditing(false) }}
          className="px-3 py-1 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
