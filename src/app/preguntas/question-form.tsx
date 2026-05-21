'use client'

import { useEffect, useRef, useState } from 'react'
import { saveQuestion } from '@/app/actions'
import { useRouter } from 'next/navigation'

type Extracted = {
  question: string
  answers: [string, string, string, string]
  correctIndex: number
  category: string
}

const LETTER = ['A', 'B', 'C', 'D'] as const

export default function QuestionForm() {
  const router = useRouter()
  const pasteZoneRef = useRef<HTMLDivElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const [data, setData] = useState<Extracted | null>(null)

  function updateAnswer(index: number, value: string) {
    if (!data) return
    const next = [...data.answers] as [string, string, string, string]
    next[index] = value
    setData({ ...data, answers: next })
  }

  async function analyzeImage(file: File) {
    setAnalyzing(true)
    setError('')
    setData(null)
    setSaved(false)

    const fd = new FormData()
    fd.set('image', file)

    try {
      const res = await fetch('/api/analyze-question', { method: 'POST', body: fd })
      const result = await res.json()
      if (result.error) {
        setError(result.error)
      } else {
        setData({
          question: result.question ?? '',
          answers: [
            result.answers?.[0] ?? '',
            result.answers?.[1] ?? '',
            result.answers?.[2] ?? '',
            result.answers?.[3] ?? '',
          ],
          correctIndex: result.correctIndex ?? 0,
          category: result.category ?? 'General',
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado')
    } finally {
      setAnalyzing(false)
    }
  }

  function handlePaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (!file) continue
        setPreview(URL.createObjectURL(file))
        analyzeImage(file)
        break
      }
    }
  }

  useEffect(() => {
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    analyzeImage(file)
  }

  async function handleSave() {
    if (!data) return
    setSaving(true)
    await saveQuestion(data)
    router.refresh()
    setSaving(false)
    setSaved(true)
    setData(null)
    setPreview(null)
  }

  const inputCls =
    'w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300'

  return (
    <div className="space-y-4">
      {/* Paste zone */}
      <div
        ref={pasteZoneRef}
        className="relative border-2 border-dashed border-amber-300 rounded-2xl bg-amber-50 flex flex-col items-center justify-center gap-2 py-8 px-4 text-center cursor-pointer"
        tabIndex={0}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="max-h-48 rounded-xl object-contain border border-zinc-200" />
        ) : (
          <>
            <span className="text-3xl select-none">📋</span>
            <p className="text-sm font-medium text-amber-800">
              Pega una foto con <kbd className="bg-amber-100 border border-amber-300 rounded px-1 py-0.5 text-xs font-mono">Ctrl+V</kbd>
            </p>
            <p className="text-xs text-amber-600">o selecciona un archivo</p>
          </>
        )}
        <label className="mt-1 cursor-pointer text-xs text-amber-700 underline underline-offset-2">
          Seleccionar imagen
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      </div>

      {analyzing && (
        <div className="flex items-center gap-2 text-sm text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3">
          <span className="inline-block w-4 h-4 border-2 border-zinc-300 border-t-amber-500 rounded-full animate-spin" />
          Analizando con IA...
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
          Pregunta guardada correctamente
        </div>
      )}

      {data && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-4">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Editar antes de guardar</p>

          {/* Question text */}
          <div>
            <label className="text-xs text-zinc-600 mb-1 block">Pregunta</label>
            <textarea
              rows={3}
              value={data.question}
              onChange={(e) => setData({ ...data, question: e.target.value })}
              className={inputCls}
            />
          </div>

          {/* Answers */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-600 block">Respuestas — marca la correcta</label>
            {data.answers.map((answer, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setData({ ...data, correctIndex: i })}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                    data.correctIndex === i
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-zinc-300 text-zinc-400 hover:border-zinc-400'
                  }`}
                >
                  {LETTER[i]}
                </button>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => updateAnswer(i, e.target.value)}
                  placeholder={`Opción ${LETTER[i]}`}
                  className={`flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 ${
                    data.correctIndex === i
                      ? 'border-emerald-300 bg-emerald-50 focus:ring-emerald-200'
                      : 'border-zinc-200 focus:ring-zinc-200'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-zinc-600 mb-1 block">Categoría</label>
            <input
              type="text"
              value={data.category}
              onChange={(e) => setData({ ...data, category: e.target.value })}
              placeholder="Ej: Derecho Administrativo, Constitución..."
              className={inputCls}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !data.question.trim() || data.answers.some((a) => !a.trim())}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar pregunta'}
          </button>
        </div>
      )}
    </div>
  )
}
