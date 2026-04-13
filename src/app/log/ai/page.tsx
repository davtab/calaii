import AiForm from './ai-form'
import Link from 'next/link'

export default function AiPage() {
  const today = new Date().toISOString().split('T')[0]

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/log" className="text-zinc-400 hover:text-zinc-700 transition-colors">
          ← Registro
        </Link>
        <h1 className="text-2xl font-bold">Registrar con IA</h1>
      </div>

<div className="bg-white rounded-xl border border-zinc-200 p-6">
        <AiForm today={today} />
      </div>
    </main>
  )
}
