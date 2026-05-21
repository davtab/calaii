'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { label: 'Hoy', href: '/alimentacion' },
  { label: 'Registro', href: '/log' },
  { label: 'Alimentos', href: '/combos' },
  { label: 'Calendario', href: '/calendar' },
  { label: 'Metas', href: '/goals' },
]

export default function NutritionSubNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 overflow-x-auto mb-6 -mx-1 px-1">
      {ITEMS.map(({ label, href }) => {
        const isActive =
          href === '/alimentacion' ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-violet-100 text-violet-800'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
