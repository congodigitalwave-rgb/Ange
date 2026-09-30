import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  Home,
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Property, PropertyTransactionType } from '../types/property';
import { PropertyCard } from './PropertyCard';

export interface PropertyListProps {
  /** Liste des biens à afficher */
  properties: Property[];
  /** IDs des biens en favoris */
  favoriteIds?: Set<string>;
  /** Callback lors du toggle d'un favori */
  onToggleFavorite?: (propertyId: string) => void;
  /** Callback lors du clic sur un bien */
  onSelectProperty?: (property: Property) => void;
  /** Action d'ajout d'annonce (optionnel) */
  onAddPropertyClick?: () => void;
  className?: string;
}

// Filtres types d'offres demandés : "Tout", "Achat", "Location"
export type FilterType = 'all' | 'sale' | 'rent';

// Liste des quartiers de Pointe-Noire
export const NEIGHBORHOOD_FILTERS = [
  'Tous les quartiers',
  'Centre-ville',
  'Avenue de la Révolution',
  'Mpita',
  'Côte Matève',
  'Mvoutvoutou',
  'Tié-Tié',
  'Loandjili',
  'Och',
  'Songolo',
  'Ngoyo',
];

// Paliers de budget max en FCFA
const BUDGET_OPTIONS = [
  { label: 'Tous les budgets', value: 0 },
  { label: 'Moins de 200 000 FCFA', value: 200000 },
  { label: 'Moins de 350 000 FCFA', value: 350000 },
  { label: 'Moins de 500 000 FCFA', value: 500000 },
  { label: 'Moins de 1 000 000 FCFA', value: 1000000 },
  { label: 'Moins de 50 000 000 FCFA', value: 50000000 },
  { label: 'Moins de 100 000 000 FCFA', value: 100000000 },
];

export const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  favoriteIds = new Set(),
  onToggleFavorite,
  onSelectProperty,
  onAddPropertyClick,
  className = '',
}) => {
  // 1. Recherche texte (titre, quartier, réf)
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Filtre type : "Tout", "Achat", "Location"
  const [filterType, setFilterType] = useState<FilterType>('all');

  // 3. Filtre quartier
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Tous les quartiers');

  // 4. Filtre budget max
  const [maxBudget, setMaxBudget] = useState<number>(0);

  // Filtrage combiné réactif
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // Filtre Type ("all", "sale" => Achat, "rent" => Location)
      if (filterType !== 'all' && prop.transactionType !== filterType) {
        return false;
      }

      // Filtre Quartier à Pointe-Noire
      if (selectedNeighborhood !== 'Tous les quartiers') {
        const matchesNeighborhood = prop.neighborhood
          .toLowerCase()
          .includes(selectedNeighborhood.toLowerCase());
        if (!matchesNeighborhood) return false;
      }

      // Filtre Budget Max
      if (maxBudget > 0 && prop.price > maxBudget) {
        return false;
      }

      // Recherche libre (titre, quartier, référence #)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          prop.title.toLowerCase().includes(query) ||
          prop.neighborhood.toLowerCase().includes(query) ||
          String(prop.ref).toLowerCase().includes(query.replace('#', ''));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [properties, filterType, selectedNeighborhood, maxBudget, searchQuery]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    filterType !== 'all' ||
    selectedNeighborhood !== 'Tous les quartiers' ||
    maxBudget > 0;

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setSelectedNeighborhood('Tous les quartiers');
    setMaxBudget(0);
  };

  return (
    <div className={`w-full text-slate-800 ${className}`}>
      {/* 1. En-tête (Header) avec logo ImmoWhats + Slogan */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          {/* Logo textuel avec icône maison/téléphone */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-[#1E3A8A] text-white shadow-sm shrink-0">
              <Home className="w-5 h-5 text-white" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center text-white border-2 border-white shadow-xs">
                <Smartphone className="w-2.5 h-2.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1E3A8A]">
                  ImmoWhats
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-50 text-[#15803D] border border-emerald-200/60 hidden sm:inline-block">
                  Pointe-Noire
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                Votre agence immobilière dans votre téléphone.
              </p>
            </div>
          </div>

          {/* Action directe : Publier ou badge statut */}
          {onAddPropertyClick && (
            <button
              type="button"
              onClick={onAddPropertyClick}
              className="h-10 px-3.5 sm:px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <span>+ Déposer une annonce</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Barre de recherche et filtres rapides */}
      <section className="bg-white border-b border-slate-200/70 py-3 px-4 sm:px-6 shadow-2xs">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Ligne 1 : Champ de recherche avec bouton de réinitialisation */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, quartier (ex: Mpita) ou réf #..."
              className="w-full h-11 pl-10 pr-9 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 text-slate-400 hover:text-slate-600"
                aria-label="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Ligne 2 : Filtres rapides avec défilement horizontal fluide sur mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
            {/* Filtre Type : "Tout", "Achat", "Location" */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl shrink-0 border border-slate-200/70">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`h-9 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterType === 'all'
                    ? 'bg-white text-[#1E3A8A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tout
              </button>
              <button
                type="button"
                onClick={() => setFilterType('rent')}
                className={`h-9 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterType === 'rent'
                    ? 'bg-[#1E3A8A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Location
              </button>
              <button
                type="button"
                onClick={() => setFilterType('sale')}
                className={`h-9 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterType === 'sale'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Achat
              </button>
            </div>

            {/* Sélecteur de Quartier à Pointe-Noire */}
            <div className="relative shrink-0">
              <select
                value={selectedNeighborhood}
                onChange={(e) => setSelectedNeighborhood(e.target.value)}
                className={`h-9.5 pl-3 pr-8 text-xs font-bold rounded-xl border appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] ${
                  selectedNeighborhood !== 'Tous les quartiers'
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                    : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {NEIGHBORHOOD_FILTERS.map((quartier) => (
                  <option
                    key={quartier}
                    value={quartier}
                    className="bg-white text-slate-800 font-medium"
                  >
                    {quartier}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  selectedNeighborhood !== 'Tous les quartiers'
                    ? 'text-white'
                    : 'text-slate-400'
                }`}
              />
            </div>

            {/* Sélecteur de Budget Max en FCFA */}
            <div className="relative shrink-0">
              <select
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className={`h-9.5 pl-3 pr-8 text-xs font-bold rounded-xl border appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] ${
                  maxBudget > 0
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                    : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {BUDGET_OPTIONS.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-white text-slate-800 font-medium"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  maxBudget > 0 ? 'text-white' : 'text-slate-400'
                }`}
              />
            </div>

            {/* Bouton Réinitialiser si des filtres sont actifs */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-9.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                title="Effacer tous les filtres"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Section des résultats et Grille Responsive de PropertyCard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Compteur d'annonces & localisation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900">
              Biens disponibles à Pointe-Noire
            </h1>
            <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] tabular-nums">
              {filteredProperties.length}
            </span>
          </div>

          {selectedNeighborhood !== 'Tous les quartiers' && (
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>{selectedNeighborhood}</span>
            </div>
          )}
        </div>

        {/* 4. Grille de biens ou État Vide (Empty State) */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={favoriteIds.has(property.id)}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelectProperty}
              />
            ))}
          </div>
        ) : (
          /* 4. État vide (Empty State) conforme à la consigne */
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center max-w-md mx-auto my-6 shadow-xs">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-[#1E3A8A]/50" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">
              Aucun bien trouvé dans ce quartier pour le moment.
            </h3>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Essayez d&apos;élargir vos filtres (sélectionnez &quot;Tous les
              quartiers&quot; ou ajustez le budget max) pour voir plus
              d&apos;annonces disponibles.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-11 px-5 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-bold transition-all shadow-sm"
              >
                Voir tous les biens de Pointe-Noire
              </button>

              {onAddPropertyClick && (
                <button
                  type="button"
                  onClick={onAddPropertyClick}
                  className="h-11 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  Publier dans ce quartier
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PropertyList;
