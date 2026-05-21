import { db } from '@/db'
import { questions } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { deleteQuestion } from '@/app/actions'
import QuestionForm from './question-form'

const LETTER = ['A', 'B', 'C', 'D'] as const

export default async function PreguntasPage() {
  const rows = await db.select().from(questions).orderBy(desc(questions.createdAt))

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black">Banco de preguntas</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Pega una foto de una pregunta tipo test para guardarla</p>
      </div>

      <QuestionForm />

      {rows.length > 0 && (
        <section className="space-y-3">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
            {rows.length} pregunta{rows.length !== 1 ? 's' : ''} guardada{rows.length !== 1 ? 's' : ''}
          </p>

          {rows.map((q) => {
            const answers = [q.answer0, q.answer1, q.answer2, q.answer3]
            return (
              <div key={q.id} className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-snug flex-1">{q.question}</p>
                  <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 flex-shrink-0">
                    {q.category}
                  </span>
                </div>

                <div className="space-y-1">
                  {answers.map((answer, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm ${
                        i === q.correctIndex
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'text-zinc-600'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                          i === q.correctIndex
                            ? 'bg-emerald-500 text-white'
                            : 'bg-zinc-100 text-zinc-400'
                        }`}
                      >
                        {LETTER[i]}
                      </span>
                      <span>{answer}</span>
                    </div>
                  ))}
                </div>

                <form
                  action={async () => {
                    'use server'
                    await deleteQuestion(q.id)
                  }}
                >
                  <button
                    type="submit"
                    className="text-[11px] text-zinc-400 hover:text-rose-500 transition-colors"
                  >
                    Eliminar
                  </button>
                </form>
              </div>
            )
          })}
        </section>
      )}
    </div>
  )
}
