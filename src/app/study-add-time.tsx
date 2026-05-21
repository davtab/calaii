'use client'

import { useTransition } from 'react'
import { addStudyTime } from '@/app/actions'

export default function AddTimeButtons() {
  const [pending, startTransition] = useTransition()

  function add(minutes: number) {
    startTransition(() => addStudyTime(minutes))
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => add(30)}
        disabled={pending}
        className="flex-1 border-2 border-indigo-200 text-indigo-700 text-sm font-semibold py-2 rounded-lg hover:bg-indigo-50 active:bg-indigo-100 disabled:opacity-40 transition-colors"
      >
        + 30 min
      </button>
      <button
        onClick={() => add(60)}
        disabled={pending}
        className="flex-1 border-2 border-indigo-200 text-indigo-700 text-sm font-semibold py-2 rounded-lg hover:bg-indigo-50 active:bg-indigo-100 disabled:opacity-40 transition-colors"
      >
        + 1 hora
      </button>
    </div>
  )
}
