'use client'

import { useRouter } from 'next/navigation'

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export default function DateNav({ date }: { date: string }) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const isToday = date === today

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={() => router.push(`/log?date=${addDays(date, -1)}`)}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors text-lg"
      >
        ←
      </button>
      <div className="text-center">
        <div className="font-semibold capitalize">{formatDate(date)}</div>
        {isToday && <div className="text-xs text-zinc-400 mt-0.5">Hoy</div>}
      </div>
      <button
        onClick={() => router.push(`/log?date=${addDays(date, 1)}`)}
        disabled={isToday}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors text-lg disabled:opacity-30 disabled:cursor-not-allowed"
      >
        →
      </button>
    </div>
  )
}
