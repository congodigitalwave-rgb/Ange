import { db } from './index.ts';
import { properties } from './schema.ts';
import { desc, eq, and, ilike, lte, or } from 'drizzle-orm';

export interface PropertyFilterParams {
  district?: string;
  type?: 'rent' | 'sale' | 'all';
  maxBudget?: number;
  search?: string;
}

export async function getProperties(filters?: PropertyFilterParams) {
  try {
    const conditions = [eq(properties.isActive, true)];

    if (filters?.type && filters.type !== 'all') {
      conditions.push(eq(properties.propertyType, filters.type));
    }

    if (filters?.district && filters.district !== 'Tous les quartiers') {
      conditions.push(ilike(properties.district, `%${filters.district}%`));
    }

    if (filters?.maxBudget && filters.maxBudget > 0) {
      conditions.push(lte(properties.priceFcfa, filters.maxBudget));
    }

    if (filters?.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(properties.title, term),
          ilike(properties.district, term)
        )!
      );
    }

    const results = await db
      .select()
      .from(properties)
      .where(and(...conditions))
      .orderBy(desc(properties.createdAt));

    return results;
  } catch (error) {
    console.error('Database query failed in getProperties:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getPropertyById(id: number) {
  try {
    const results = await db
      .select()
      .from(properties)
      .where(and(eq(properties.id, id), eq(properties.isActive, true)))
      .limit(1);

    return results[0] || null;
  } catch (error) {
    console.error(`Database query failed in getPropertyById(${id}):`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export interface NewPropertyInput {
  title: string;
  description?: string;
  priceFcfa: number;
  propertyType: 'rent' | 'sale';
  district: string;
  city?: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm?: number;
  agentWhatsapp: string;
  imageUrl: string;
  referenceCode?: number;
}

export async function createProperty(input: NewPropertyInput) {
  try {
    const refCode = input.referenceCode ?? Math.floor(100 + Math.random() * 900);

    const inserted = await db
      .insert(properties)
      .values({
        referenceCode: refCode,
        title: input.title,
        description: input.description,
        priceFcfa: input.priceFcfa,
        propertyType: input.propertyType,
        district: input.district,
        city: input.city || 'Pointe-Noire',
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        areaSqm: input.areaSqm || 75,
        agentWhatsapp: input.agentWhatsapp,
        imageUrl: input.imageUrl,
        isActive: true,
        isVerified: true,
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database query failed in createProperty:', error);
    throw new Error('Database insertion failed. Please try again later.', { cause: error });
  }
}
