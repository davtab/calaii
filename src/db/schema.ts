import { pgTable, serial, text, real, integer, date, timestamp } from 'drizzle-orm/pg-core'

export const foods = pgTable('foods', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  calories: real('calories').notNull(),
  protein: real('protein').notNull(),
  carbs: real('carbs').notNull(),
  fat: real('fat').notNull(),
  servingSize: real('serving_size').default(100),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const logEntries = pgTable('log_entries', {
  id: serial('id').primaryKey(),
  foodId: integer('food_id')
    .references(() => foods.id, { onDelete: 'cascade' })
    .notNull(),
  date: date('date').notNull(),
  meal: text('meal').notNull(),
  grams: real('grams').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const combos = pgTable('combos', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const comboItems = pgTable('combo_items', {
  id: serial('id').primaryKey(),
  comboId: integer('combo_id')
    .references(() => combos.id, { onDelete: 'cascade' })
    .notNull(),
  foodId: integer('food_id')
    .references(() => foods.id, { onDelete: 'cascade' })
    .notNull(),
  grams: real('grams').notNull(),
})

export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  calories: real('calories').notNull(),
  protein: real('protein').notNull(),
  carbs: real('carbs').notNull(),
  fat: real('fat').notNull(),
})
