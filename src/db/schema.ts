import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  referenceCode: integer('reference_code').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  priceFcfa: integer('price_fcfa').notNull(),
  propertyType: text('property_type').notNull().default('rent'), // 'rent' | 'sale'
  district: text('district').notNull(),
  city: text('city').notNull().default('Pointe-Noire'),
  bedrooms: integer('bedrooms').notNull().default(1),
  bathrooms: integer('bathrooms').notNull().default(1),
  areaSqm: integer('area_sqm').default(75),
  agentWhatsapp: text('agent_whatsapp').notNull(),
  imageUrl: text('image_url').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  isVerified: boolean('is_verified').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
