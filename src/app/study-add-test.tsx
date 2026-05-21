'use client'

import { useState, useTransition } from 'react'
import { addStudyTest } from '@/app/actions'

export default function AddTestForm() {
  const [score, setScore] = useState('')
  const [pending, startTransition] = useTransition()
  const [last, setLast] = useState<number | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const s = parseFloat(score)
    if (isNaN(s) || s < 0 || s > 100) return
    startTransition(async () => {
      await addStudyTest(s)
      setLast(s)
      setScore('')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        type="number"
        min="0"
        max="100"
        step="0.1"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="Nota (0–100)"
        className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-zinc-50"
        required
      />
      <button
        type="submit"
        disabled={pending || !score}
        className="bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-40 transition-colors whitespace-nowrap"
      >
        {pending ? '···' : '+ Test'}
      </button>
      {last !== null && !pending && (
        <span className="text-xs text-zinc-400 whitespace-nowrap">✓ {last}/100</span>
      )}
    </form>
  )
}
