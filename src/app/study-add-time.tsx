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
    </div>
  )
}
