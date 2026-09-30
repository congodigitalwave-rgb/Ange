import { Property } from '../types/property';
import { SAMPLE_PROPERTIES } from '../data/mockProperties';

export async function fetchPropertiesFromApi(filters?: {
  district?: string;
  type?: string;
  maxBudget?: number;
  search?: string;
}): Promise<Property[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.district && filters.district !== 'Tous les quartiers') {
      params.append('district', filters.district);
    }
    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters?.maxBudget && filters.maxBudget > 0) {
      params.append('maxBudget', String(filters.maxBudget));
    }
    if (filters?.search && filters.search.trim()) {
      params.append('search', filters.search.trim());
    }

    const res = await fetch(`/api/properties?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('Backend API call failed, using local properties fallback:', error);
    return SAMPLE_PROPERTIES;
  }
}

export async function createPropertyApi(property: {
  title: string;
  description?: string;
  price: number;
  transactionType: 'rent' | 'sale';
  neighborhood: string;
  city?: string;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  whatsappNumber: string;
  imageUrl?: string;
}): Promise<Property> {
  const res = await fetch('/api/properties', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(property),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erreur lors de la création du bien');
  }

  return await res.json();
}
