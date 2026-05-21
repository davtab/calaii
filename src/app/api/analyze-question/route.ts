import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Falta ANTHROPIC_API_KEY' }, { status: 500 })
  }

  let base64 = ''
  let mediaType: ImageMediaType = 'image/jpeg'

  try {
    const formData = await req.formData()
    const imageFile = formData.get('image') as File | null
    if (!imageFile || !imageFile.size) {
      return NextResponse.json({ error: 'Se requiere una imagen' }, { status: 400 })
    }
    const buffer = await imageFile.arrayBuffer()
    base64 = Buffer.from(buffer).toString('base64')
    mediaType = (imageFile.type as ImageMediaType) || 'image/jpeg'
  } catch {
    return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 400 })
  }

  const prompt = `Analiza esta imagen que contiene una pregunta tipo test de oposición.

Extrae la pregunta, las 4 opciones de respuesta, cuál es la correcta y sugiere una categoría temática.

Responde SOLO con JSON válido, sin texto adicional:
{
  "question": "texto completo de la pregunta",
  "answers": ["opción A", "opción B", "opción C", "opción D"],
  "correctIndex": 0,
  "category": "categoría temática sugerida"
}

Donde correctIndex es el índice (0-3) de la respuesta correcta. Si no está claramente marcada, usa 0.
Las opciones deben ir sin prefijo de letra (sin "A)", "B)", etc.).`

  try {
    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'No se pudo interpretar la respuesta de la IA' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json({
      question: parsed.question ?? '',
      answers: parsed.answers ?? ['', '', '', ''],
      correctIndex: parsed.correctIndex ?? 0,
      category: parsed.category ?? 'General',
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    return NextResponse.json({ error: `Error al contactar la IA: ${msg}` }, { status: 500 })
  }
}
