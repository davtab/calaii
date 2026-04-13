'use server'

import { db } from '@/db'
import { foods, logEntries, goals, combos, comboItems } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

// ─── Foods ────────────────────────────────────────────────────────────────────

export async function addFood(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const calories = parseFloat(formData.get('calories') as string)
  const protein = parseFloat(formData.get('protein') as string)
  const carbs = parseFloat(formData.get('carbs') as string)
  const fat = parseFloat(formData.get('fat') as string)
  const servingSize = parseFloat(formData.get('servingSize') as string) || 100

  if (!name || isNaN(calories) || isNaN(protein) || isNaN(carbs) || isNaN(fat)) return

  await db.insert(foods).values({ name, calories, protein, carbs, fat, servingSize })
  revalidatePath('/foods')
}

export async function deleteFood(id: number) {
  await db.delete(foods).where(eq(foods.id, id))
  revalidatePath('/foods')
  revalidatePath('/')
  revalidatePath('/log')
}

// ─── Log entries ──────────────────────────────────────────────────────────────

export async function addLogEntry(formData: FormData) {
  const foodId = parseInt(formData.get('foodId') as string)
  const date = formData.get('date') as string
  const meal = formData.get('meal') as string
  const gramsRaw = parseFloat(formData.get('grams') as string)
  const grams = isNaN(gramsRaw) || gramsRaw <= 0 ? 100 : gramsRaw

  if (isNaN(foodId) || !date || !meal) return

  await db.insert(logEntries).values({ foodId, date, meal, grams })
  revalidatePath('/log')
  revalidatePath('/')
}

export async function deleteLogEntry(id: number) {
  await db.delete(logEntries).where(eq(logEntries.id, id))
  revalidatePath('/log')
  revalidatePath('/')
}

// ─── Combos ───────────────────────────────────────────────────────────────────

export async function createCombo(name: string, items: { foodId: number; grams: number }[]) {
  if (!name.trim() || items.length === 0) return
  const [combo] = await db.insert(combos).values({ name: name.trim() }).returning({ id: combos.id })
  await db.insert(comboItems).values(items.map((i) => ({ comboId: combo.id, foodId: i.foodId, grams: i.grams })))
  revalidatePath('/combos')
}

export async function deleteCombo(id: number) {
  await db.delete(combos).where(eq(combos.id, id))
  revalidatePath('/combos')
}

export async function addComboToLog(comboId: number, meal: string, date: string) {
  const items = await db
    .select({ foodId: comboItems.foodId, grams: comboItems.grams })
    .from(comboItems)
    .where(eq(comboItems.comboId, comboId))

  if (items.length === 0) return

  await db.insert(logEntries).values(items.map((i) => ({ foodId: i.foodId, date, meal, grams: i.grams })))
  revalidatePath('/log')
  revalidatePath('/')
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export async function updateGoals(formData: FormData) {
  const calories = parseFloat(formData.get('calories') as string)
  const protein = parseFloat(formData.get('protein') as string)
  const carbs = parseFloat(formData.get('carbs') as string)
  const fat = parseFloat(formData.get('fat') as string)

  if (isNaN(calories) || isNaN(protein) || isNaN(carbs) || isNaN(fat)) return

  const existing = await db.select({ id: goals.id }).from(goals).limit(1)
  if (existing.length > 0) {
    await db.update(goals).set({ calories, protein, carbs, fat }).where(eq(goals.id, existing[0].id))
  } else {
    await db.insert(goals).values({ calories, protein, carbs, fat })
  }
  revalidatePath('/')
  revalidatePath('/goals')
}

// ─── AI food analysis ─────────────────────────────────────────────────────────

export type AiItem = {
  name: string
  grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

export async function analyzeFood(formData: FormData): Promise<{ items: AiItem[]; error?: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { items: [], error: 'Falta ANTHROPIC_API_KEY en .env.local' }

  const text = (formData.get('text') as string | null)?.trim() ?? ''
  const imageFiles = formData.getAll('images') as File[]

  if (!text && imageFiles.length === 0) return { items: [], error: 'Ingresa texto o una imagen' }

  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic({ apiKey })

  type ContentBlock =
    | { type: 'text'; text: string }
    | { type: 'image'; source: { type: 'base64'; media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'; data: string } }

  const content: ContentBlock[] = []

  for (const file of imageFiles) {
    if (!file.size) continue
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: file.type as 'image/jpeg', data: base64 },
    })
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
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { items: [], error: 'No se pudo interpretar la respuesta' }

    const parsed = JSON.parse(jsonMatch[0])
    return { items: parsed.items ?? [] }
  } catch (e) {
    return { items: [], error: 'Error al contactar la IA' }
  }
}

export async function logAiItems(items: AiItem[], meal: string, date: string) {
  for (const item of items) {
    const grams = isNaN(item.grams) || item.grams <= 0 ? 100 : item.grams
    if (!item.name) continue

    // Use 100g as base, calculate per-100g values
    const factor = 100 / grams
    const cal100 = (item.calories || 0) * factor
    const pro100 = (item.protein || 0) * factor
    const car100 = (item.carbs || 0) * factor
    const fat100 = (item.fat || 0) * factor

    // Find or create food entry (case-insensitive match)
    const existing = await db
      .select({ id: foods.id })
      .from(foods)
      .where(sql`lower(${foods.name}) = lower(${item.name})`)
      .limit(1)
    let foodId: number

    if (existing.length > 0) {
      foodId = existing[0].id
    } else {
      const [created] = await db
        .insert(foods)
        .values({ name: item.name, calories: cal100, protein: pro100, carbs: car100, fat: fat100 })
        .returning({ id: foods.id })
      foodId = created.id
    }

    await db.insert(logEntries).values({ foodId, date, meal, grams })
  }

  revalidatePath('/log')
  revalidatePath('/')
  revalidatePath('/foods')
}
