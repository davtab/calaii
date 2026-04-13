import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Calaii',
  description: 'Control personal de macros y calorías',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-violet-50 text-zinc-900 font-[family-name:var(--font-geist)]">
        <nav className="bg-gradient-to-r from-violet-600 to-indigo-500 sticky top-0 z-10 shadow-md">
          <div className="max-w-2xl mx-auto px-4 flex items-center gap-1 h-14 overflow-x-auto">
            <Link href="/" className="font-bold text-base tracking-tight mr-3 flex-shrink-0 text-white">Calaii</Link>
            <Link href="/" className="flex-shrink-0 px-3 py-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors text-sm">Hoy</Link>
            <Link href="/log" className="flex-shrink-0 px-3 py-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors text-sm">Registro</Link>
            <Link href="/combos" className="flex-shrink-0 px-3 py-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors text-sm">Alimentos</Link>
            <Link href="/calendar" className="flex-shrink-0 px-3 py-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors text-sm">Calendario</Link>
            <Link href="/goals" className="flex-shrink-0 px-3 py-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors text-sm">Metas</Link>
          </div>
        </nav>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  )
}
