import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'TOTY',
  description: 'Tu reto de estudio y control de nutrición',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 font-[family-name:var(--font-geist)]">
        <nav className="bg-zinc-900 sticky top-0 z-10 shadow-lg">
          <div className="max-w-2xl mx-auto px-4 flex items-center gap-2 h-14">
            <Link href="/" className="font-black text-xl tracking-tight text-white mr-3">
              TOTY
            </Link>
            <Link
              href="/alimentacion"
              className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
            >
              Alimentación
            </Link>
            <Link
              href="/preguntas"
              className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
            >
              Preguntas
            </Link>
          </div>
        </nav>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  )
}
