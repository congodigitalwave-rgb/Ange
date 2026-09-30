import React, { useState } from 'react';
import { Bed, Bath, Maximize2, MapPin, Heart, Share2, ShieldCheck } from 'lucide-react';
import { Property } from '../types/property';
import { WhatsAppButton } from './WhatsAppButton';

export interface PropertyCardProps {
  /**
   * Données complètes du bien immobilier
   */
  property: Property;
  /**
   * État du favori
   */
  isFavorite?: boolean;
  /**
   * Callback lors du clic sur le favori
   */
  onToggleFavorite?: (propertyId: string) => void;
  /**
   * Callback lors du clic sur la carte ou le détail
   */
  onSelect?: (property: Property) => void;
  /**
   * Classes CSS additionnelles
   */
  className?: string;
  /**
   * Numéro WhatsApp de contact prioritaire (optionnel)
   */
  contactPhoneNumber?: string;
}

/**
 * Formate un nombre au format monétaire FCFA standard (ex: 250 000)
 */
export function formatFCFAPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Composant PropertyCard
 * Carte immobilière mobile-first pour le marché de Pointe-Noire (Congo)
 * Charte: Blanc/Gris clair, Bleu immobilier (#1E3A8A), Vert WhatsApp (#22C55E)
 */
export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavorite = false,
  onToggleFavorite,
  onSelect,
  className = '',
  contactPhoneNumber,
}) => {
  const [imageError, setImageError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const {
    id,
    ref,
    title,
    transactionType,
    price,
    pricePeriod,
    currency = 'FCFA',
    neighborhood,
    bedrooms,
    bathrooms,
    area,
    imageUrl,
    isVerified = true,
    whatsappNumber,
  } = property;

  const isRent = transactionType === 'rent';
  const badgeLabel = isRent ? 'À Louer' : 'À Vendre';
  const phone = contactPhoneNumber || whatsappNumber || '242068001122';

  // Format du prix lisible (ex: "250 000 FCFA / mois")
  const formattedPrice = `${formatFCFAPrice(price)} ${currency}${
    pricePeriod ? ` / ${pricePeriod}` : ''
  }`;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: `${title} - ImmoWhats Pointe-Noire`,
      text: `Découvrez ce bien à Pointe-Noire (${neighborhood}) : ${formattedPrice} (Réf #${ref})`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Ignorer l'annulation de partage
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <article
      onClick={() => onSelect?.(property)}
      className={`group relative flex flex-col bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden text-left ${className}`}
    >
      {/* Zone Image avec Ratio 4:3 et Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {!imageError ? (
          <img
            src={imageUrl}
            alt={`${title} - ${neighborhood}`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4">
            <MapPin className="w-8 h-8 text-slate-300 mb-1" />
            <span className="text-xs font-medium text-slate-500 text-center">
              Image non disponible
            </span>
          </div>
        )}

        {/* Dégradé supérieur pour lisibilité des badges */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 via-black/10 to-transparent" />

        {/* Badge Transaction ("À Louer" ou "À Vendre") */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span
            className={`inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm backdrop-blur-md ${
              isRent
                ? 'bg-[#1E3A8A] text-white' // Bleu Immobilier #1E3A8A
                : 'bg-amber-600 text-white'
            }`}
          >
            {badgeLabel}
          </span>

          {/* Badge Référence pour repérage rapide WhatsApp */}
          <span className="inline-flex items-center px-2 py-1 text-[11px] font-semibold text-slate-900 bg-white/95 rounded-lg shadow-sm backdrop-blur-md">
            Réf #{ref}
          </span>
        </div>

        {/* Actions Flottantes Droite : Partage et Favori */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Partager ce bien"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm transition-transform active:scale-90 hover:bg-white hover:text-slate-900"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(id);
            }}
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform active:scale-90 hover:bg-white"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-slate-700 hover:text-rose-500'
              }`}
            />
          </button>
        </div>

        {/* Notification de copie discrète */}
        {copiedLink && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-slate-900/90 text-white text-xs rounded-full shadow-md animate-fade-in">
            Lien copié !
          </div>
        )}
      </div>

      {/* Corps de la Carte */}
      <div className="flex flex-1 flex-col p-4">
        {/* Prix mis en avant de façon claire */}
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold tracking-tight text-[#1E3A8A] tabular-nums">
              {formatFCFAPrice(price)}
            </span>
            <span className="text-sm font-semibold text-[#1E3A8A]">
              {currency}
            </span>
            {pricePeriod && (
              <span className="text-xs font-medium text-slate-500">
                / {pricePeriod}
              </span>
            )}
          </div>

          {/* Indicateur de vérification par l'agence */}
          {isVerified && (
            <span
              title="Bien vérifié sur place par ImmoWhats"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
              <span className="hidden sm:inline">Vérifié</span>
            </span>
          )}
        </div>

        {/* Titre du bien */}
        <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-[#1E3A8A] transition-colors mb-1">
          {title}
        </h3>

        {/* Quartier / Localisation à Pointe-Noire */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{neighborhood}</span>
        </div>

        {/* Caractéristiques avec icônes (Chambres, Douches, Superficie) */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 mb-4 rounded-lg bg-[#F8FAFC] border border-slate-100 text-xs text-slate-700">
          {/* Chambres */}
          <div className="flex items-center gap-1.5 justify-center">
            <Bed className="w-4 h-4 text-[#1E3A8A] shrink-0" />
            <span className="font-semibold tabular-nums">{bedrooms}</span>
            <span className="text-slate-500 font-normal">ch.</span>
          </div>

          {/* Douches */}
          <div className="flex items-center gap-1.5 justify-center border-x border-slate-200">
            <Bath className="w-4 h-4 text-[#1E3A8A] shrink-0" />
            <span className="font-semibold tabular-nums">{bathrooms}</span>
            <span className="text-slate-500 font-normal">sdb.</span>
          </div>

          {/* Superficie */}
          <div className="flex items-center gap-1.5 justify-center">
            <Maximize2 className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
            <span className="font-semibold tabular-nums">{area}</span>
            <span className="text-slate-500 font-normal">m²</span>
          </div>
        </div>

        {/* Bouton d'action principal WhatsApp */}
        <div className="mt-auto pt-1">
          <WhatsAppButton
            phoneNumber={phone}
            propertyTitle={title}
            propertyRef={ref}
            fullWidth={true}
            size="md"
            label="Contacter sur WhatsApp"
          />
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
