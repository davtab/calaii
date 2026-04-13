'use client'

import { useRouter } from 'next/navigation'

export default function CalendarNav({ year, month }: { year: number; month: number }) {
  const router = useRouter()

  function navigate(y: number, m: number) {
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    router.push(`/calendar?year=${y}&month=${m}`)
  }

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={() => navigate(year, month - 1)}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors text-lg"
      >
        ←
      </button>
      <h1 className="text-xl font-bold capitalize">{monthName}</h1>
      <button
        onClick={() => navigate(year, month + 1)}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors text-lg"
      >
        →
      </button>
    </div>
  )
}
