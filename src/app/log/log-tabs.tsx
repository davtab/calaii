'use client'

import { useState } from 'react'

export default function LogTabs({
  manualForm,
  aiForm,
}: {
  manualForm: React.ReactNode
  aiForm: React.ReactNode
}) {
  const [tab, setTab] = useState<'manual' | 'ia'>('manual')

  const base = 'flex-1 py-2 text-sm font-bold rounded-lg transition-colors'
  const active = `${base} bg-white text-zinc-900 shadow-sm`
  const inactive = `${base} text-zinc-700 hover:text-zinc-900`

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <div className="m-4 mb-0 flex gap-1 p-1 bg-zinc-100 rounded-xl">
        <button onClick={() => setTab('manual')} className={tab === 'manual' ? active : inactive}>
          A mano
        </button>
        <button onClick={() => setTab('ia')} className={tab === 'ia' ? active : inactive}>
          IA
        </button>
      </div>
      <div className="p-6">
        <div className={tab !== 'manual' ? 'hidden' : ''}>{manualForm}</div>
        <div className={tab !== 'ia' ? 'hidden' : ''}>{aiForm}</div>
      </div>
    </div>
  )
}
