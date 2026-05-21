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

export const studyTests = pgTable('study_tests', {
  id: serial('id').primaryKey(),
  score: real('score').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const studyHours = pgTable('study_hours', {
  id: serial('id').primaryKey(),
  minutes: integer('minutes').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  answer0: text('answer0').notNull(),
  answer1: text('answer1').notNull(),
  answer2: text('answer2').notNull(),
  answer3: text('answer3').notNull(),
  correctIndex: integer('correct_index').notNull().default(0),
  category: text('category').notNull().default('General'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
