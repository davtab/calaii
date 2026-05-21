'use client'

import { useTransition } from 'react'
import { addStudyTime, deleteLastStudyTime } from '@/app/actions'

export default function AddTimeButtons() {
  const [pending, startTransition] = useTransition()

  function add(minutes: number) {
    startTransition(() => addStudyTime(minutes))
  }

  function undo() {
    startTransition(() => deleteLastStudyTime())
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => add(30)}
        disabled={pending}
        className="flex-1 border-2 border-orange-200 text-orange-600 text-sm font-semibold py-2 rounded-lg hover:bg-orange-50 active:bg-orange-100 disabled:opacity-40 transition-colors"
      >
        + 30 min
      </button>
      <button
        onClick={() => add(60)}
        disabled={pending}
        className="flex-1 border-2 border-orange-200 text-orange-600 text-sm font-semibold py-2 rounded-lg hover:bg-orange-50 active:bg-orange-100 disabled:opacity-40 transition-colors"
      >
        + 1 hora
      </button>
      <button
        onClick={undo}
        disabled={pending}
        title="Deshacer última entrada de horas"
        className="px-3 py-2 rounded-lg border-2 border-zinc-200 text-zinc-400 text-sm hover:border-zinc-300 hover:text-zinc-600 disabled:opacity-40 transition-colors"
      >
        ↩
      </button>
    </div>
  )
}
