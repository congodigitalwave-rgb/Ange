export type PropertyTransactionType = 'rent' | 'sale';

export interface Property {
  id: string;
  ref: string | number; // Ex: '102'
  title: string; // Ex: "Villa Moderne avec Jardin"
  transactionType: PropertyTransactionType; // 'rent' -> "À Louer", 'sale' -> "À Vendre"
  price: number; // Ex: 250000
  pricePeriod?: string; // Ex: "mois" pour location, undefined pour vente
  currency?: string; // Ex: "FCFA"
  neighborhood: string; // Ex: "Avenue de la Révolution, Pointe-Noire"
  city?: string; // Default: "Pointe-Noire"
  bedrooms: number; // Chambres
  bathrooms: number; // Douches / Salles de bain
  area: number; // Superficie en m²
  imageUrl: string;
  additionalImages?: string[];
  description?: string;
  whatsappNumber?: string; // Ex: "242068000000" (Indicatif Congo +242)
  isFeatured?: boolean;
  isVerified?: boolean;
}
