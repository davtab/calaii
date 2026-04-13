'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { analyzeFood, logAiItems, type AiItem } from '@/app/actions'

const MEALS = [
  { value: 'desayuno', label: 'Desayuno' },
  { value: 'comida',   label: 'Comida' },
  { value: 'merienda', label: 'Merienda' },
  { value: 'cena',     label: 'Cena' },
]

export default function AiForm({ today }: { today: string }) {
  const [text, setText] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [logging, setLogging] = useState(false)
  const router = useRouter()
  const [error, setError] = useState('')
  const [items, setItems] = useState<AiItem[]>([])
  const [meal, setMeal] = useState('desayuno')
  const [done, setDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setImages(files)
    setPreviews(files.map((f) => URL.createObjectURL(f)))
  }

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() && images.length === 0) return
    setAnalyzing(true)
    setError('')
    setItems([])
    setDone(false)

    const fd = new FormData()
    fd.set('text', text)
    for (const img of images) fd.append('images', img)

    const result = await analyzeFood(fd)
    setAnalyzing(false)

    if (result.error) {
      setError(result.error)
    } else {
      setItems(result.items)
    }
  }

  function updateItem(i: number, field: keyof AiItem, value: string | number) {
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)))
  }

  async function handleLog() {
    setLogging(true)
    await logAiItems(items, meal, today)
    router.refresh()
    setLogging(false)
    setDone(true)
    setItems([])
    setText('')
    setImages([])
    setPreviews([])
    if (fileRef.current) fileRef.current.value = ''
  }

  const inputCls = 'w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300'

  return (
    <div className="space-y-6">
      {/* Input form */}
      <form onSubmit={handleAnalyze} className="space-y-4">
        <div>
          <label className="text-xs text-zinc-700 mb-1.5 block">
            Foto(s) — cámara o galería
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={handleImageChange}
            className="w-full text-sm text-zinc-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
          />
          {previews.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {previews.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" className="h-20 w-20 object-cover rounded-lg border border-zinc-200" />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs text-zinc-700 mb-1.5 block">
            O describe lo que comiste
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ej: un plato de pasta boloñesa con ensalada y un vaso de leche"
            rows={3}
            className={inputCls}
          />
        </div>

        <button
          type="submit"
          disabled={analyzing || (!text.trim() && images.length === 0)}
          className="w-full bg-violet-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {analyzing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analizando...
            </span>
          ) : (
            'Analizar con IA'
          )}
        </button>
      </form>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {done && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700">
          ✓ Registrado correctamente
        </div>
      )}

      {/* Results */}
      {items.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Alimentos identificados — revisa y ajusta</h3>

          {items.map((item, i) => (
            <div key={i} className="bg-zinc-50 rounded-xl border border-zinc-200 p-4 space-y-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(i, 'name', e.target.value)}
                className="font-medium text-sm bg-transparent border-b border-zinc-200 focus:outline-none focus:border-zinc-500 w-full pb-0.5"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-600 block mb-0.5">Gramos</label>
                  <input
                    type="number"
                    min="1"
                    value={item.grams}
                    onChange={(e) => updateItem(i, 'grams', parseFloat(e.target.value))}
                    className="w-full border border-zinc-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-600 block mb-0.5">Calorías</label>
                  <input
                    type="number"
                    min="0"
                    value={item.calories}
                    onChange={(e) => updateItem(i, 'calories', parseFloat(e.target.value))}
                    className="w-full border border-zinc-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-blue-400 block mb-0.5">Proteína (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={item.protein}
                    onChange={(e) => updateItem(i, 'protein', parseFloat(e.target.value))}
                    className="w-full border border-zinc-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-emerald-400 block mb-0.5">Carbos (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={item.carbs}
                    onChange={(e) => updateItem(i, 'carbs', parseFloat(e.target.value))}
                    className="w-full border border-zinc-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-rose-400 block mb-0.5">Grasa (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={item.fat}
                    onChange={(e) => updateItem(i, 'fat', parseFloat(e.target.value))}
                    className="w-full border border-zinc-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-xs text-zinc-600 hover:text-rose-500 transition-colors"
              >
                Eliminar este ítem
              </button>
            </div>
          ))}

          {/* Totals summary */}
          <div className="bg-white border border-zinc-200 rounded-xl p-3 text-sm flex flex-wrap gap-x-4 gap-y-1">
            {(() => {
              const t = items.reduce((a, i) => ({
                calories: a.calories + (i.calories || 0),
                protein: a.protein + (i.protein || 0),
                carbs: a.carbs + (i.carbs || 0),
                fat: a.fat + (i.fat || 0),
              }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
              return (
                <>
                  <span><span className="text-zinc-600">Total: </span><strong>{Math.round(t.calories)} kcal</strong></span>
                  <span><span className="text-blue-400">P </span><strong>{Math.round(t.protein)}g</strong></span>
                  <span><span className="text-emerald-400">C </span><strong>{Math.round(t.carbs)}g</strong></span>
                  <span><span className="text-rose-400">G </span><strong>{Math.round(t.fat)}g</strong></span>
                </>
              )
            })()}
          </div>

          {/* Meal selector + log button */}
          <div className="flex gap-3 items-center">
            <select
              value={meal}
              onChange={(e) => setMeal(e.target.value)}
              className="flex-1 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
            >
              {MEALS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <button
              onClick={handleLog}
              disabled={logging || items.length === 0}
              className="flex-1 bg-violet-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {logging ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
