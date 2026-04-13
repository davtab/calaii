'use client'

import { useRouter } from 'next/navigation'

export default function ComboTabNav({ active }: { active: 'alimentos' | 'combos' }) {
  const router = useRouter()

  const base = 'flex-1 py-2 text-sm font-bold rounded-lg transition-colors'
  const activeClass = `${base} bg-white text-zinc-900 shadow-sm`
  const inactiveClass = `${base} text-zinc-700 hover:text-zinc-900`

  return (
    <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl mb-6">
      <button onClick={() => router.push('/combos')} className={active === 'alimentos' ? activeClass : inactiveClass}>
        Alimentos
      </button>
      <button onClick={() => router.push('/combos?tab=combos')} className={active === 'combos' ? activeClass : inactiveClass}>
        Combos
      </button>
    </div>
  )
}
