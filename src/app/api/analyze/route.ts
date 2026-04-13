import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Falta ANTHROPIC_API_KEY' }, { status: 500 })
  }

  let text = ''
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any[] = []

  try {
    const formData = await req.formData()
    text = ((formData.get('text') as string | null) ?? '').trim()
    const imageFiles = formData.getAll('images') as File[]

    if (!text && imageFiles.length === 0) {
      return NextResponse.json({ error: 'Ingresa texto o una imagen' }, { status: 400 })
    }

    for (const file of imageFiles) {
      if (!file.size) continue
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const mediaType = (file.type as ImageMediaType) || 'image/jpeg'
      content.push({
        type: 'image' as const,
        source: { type: 'base64' as const, media_type: mediaType, data: base64 },
      })
    }
  } catch {
    return NextResponse.json({ error: 'Error al procesar la petición' }, { status: 400 })
  }

  const prompt = `Analiza los alimentos${text ? ` descritos: "${text}"` : ' en la imagen'}.

Para cada alimento identificado, estima los valores nutricionales de la PORCIÓN TOTAL que se ve/describe.

Responde SOLO con JSON válido, sin texto adicional:
{
  "items": [
    {
      "name": "nombre del alimento en español",
      "grams": número estimado de gramos de la porción,
      "calories": kcal totales de esa porción,
      "protein": gramos de proteína de esa porción,
      "carbs": gramos de carbohidratos de esa porción,
      "fat": gramos de grasa de esa porción
    }
  ]
}

Sé realista con las porciones. Usa valores de bases nutricionales estándar.`

  content.push({ type: 'text', text: prompt })

  try {
    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'No se pudo interpretar la respuesta' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json({ items: parsed.items ?? [] })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    return NextResponse.json({ error: `Error al contactar la IA: ${msg}` }, { status: 500 })
  }
}
