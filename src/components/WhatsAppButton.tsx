import React from 'react';

export interface WhatsAppButtonProps {
  /**
   * Numéro de téléphone au format international (sans le '+', ex: 242068000000 pour le Congo)
   * Si non fourni, un numéro par défaut de l'agence ImmoWhats à Pointe-Noire est utilisé.
   */
  phoneNumber?: string;
  /**
   * Titre du bien immobilier (ex: "Appartement Standing Vue Mer")
   */
  propertyTitle: string;
  /**
   * Référence du bien (ex: 102 ou "PN-102")
   */
  propertyRef: string | number;
  /**
   * Message pré-rempli optionnel (si absent, utilise la formulation standard requise)
   */
  customMessage?: string;
  /**
   * Libellé affiché sur le bouton (défaut: "Contacter sur WhatsApp")
   */
  label?: string;
  /**
   * Classes CSS additionnelles Tailwind
   */
  className?: string;
  /**
   * Si vrai, le bouton prend 100% de la largeur du conteneur (recommandé mobile-first)
   */
  fullWidth?: boolean;
  /**
   * Taille du bouton ('sm' | 'md' | 'lg')
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Variantes visuelles
   */
  variant?: 'solid' | 'outline' | 'subtle';
  /**
   * Handler de clic optionnel (ex: analytique ou journalisation)
   */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Icône WhatsApp officielle vectorielle SVG
 */
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.34C9.36 7.34 9.08 7.4 8.84 7.66C8.6 7.93 7.92 8.57 7.92 9.87C7.92 11.17 8.87 12.42 9 12.6C9.14 12.77 10.86 15.42 13.5 16.56C14.13 16.83 14.62 16.99 15 17.11C15.63 17.31 16.2 17.28 16.65 17.21C17.15 17.14 18.19 16.58 18.41 15.96C18.63 15.34 18.63 14.81 18.56 14.7C18.49 14.59 18.31 14.52 18.05 14.4C17.78 14.27 16.48 13.63 16.24 13.54C16 13.46 15.83 13.41 15.65 13.67C15.48 13.93 14.99 14.52 14.84 14.7C14.69 14.87 14.54 14.9 14.28 14.77C14.01 14.65 12.9 14.28 11.58 13.1C10.55 12.18 9.85 11.05 9.72 10.83C9.59 10.61 9.71 10.49 9.84 10.36C9.96 10.24 10.11 10.05 10.24 9.9C10.37 9.75 10.42 9.63 10.5 9.46C10.58 9.3 10.54 9.15 10.48 9.03C10.42 8.91 9.93 7.71 9.72 7.22C9.52 6.74 9.32 6.8 9.17 6.79C9.03 6.79 8.86 6.79 8.68 6.79L9.53 7.34Z" />
  </svg>
);

/**
 * Construit l'URL WhatsApp universelle wa.me avec le message encodé pour Pointe-Noire
 */
export function buildWhatsAppUrl(
  phoneNumber: string,
  propertyTitle: string,
  propertyRef: string | number,
  customMessage?: string
): string {
  // Nettoyage du numéro : conservation des chiffres uniquement
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

  // Message pré-rempli obligatoire demandé dans le cahier des charges
  const message =
    customMessage ??
    `Bonjour, je suis intéressé par votre bien ${propertyTitle} (Réf: #${propertyRef}) à Pointe-Noire. Est-il toujours disponible ?`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Composant réutilisable WhatsAppButton
 * Mobile-first, ergonomique avec zone tactile >= 44px
 */
export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = '242068001122', // Numéro Pointe-Noire Congo par défaut (+242)
  propertyTitle,
  propertyRef,
  customMessage,
  label = 'Contacter sur WhatsApp',
  className = '',
  fullWidth = true,
  size = 'md',
  variant = 'solid',
  onClick,
}) => {
  const whatsappUrl = buildWhatsAppUrl(phoneNumber, propertyTitle, propertyRef, customMessage);

  // Tailles avec respect des zones tactiles mobiles (minimum 44px de hauteur)
  const sizeClasses = {
    sm: 'h-11 px-3.5 text-xs gap-1.5',
    md: 'h-12 px-4 text-sm gap-2',
    lg: 'h-13 px-5 text-base gap-2.5',
  }[size];

  // Variantes visuelles (fond vert vif #22C55E)
  const variantClasses = {
    solid:
      'bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-sm hover:shadow active:bg-[#15803D] focus-visible:ring-[#22C55E]',
    outline:
      'border-2 border-[#22C55E] text-[#15803D] hover:bg-[#22C55E]/10 active:bg-[#22C55E]/20 focus-visible:ring-[#22C55E]',
    subtle:
      'bg-[#22C55E]/10 text-[#15803D] hover:bg-[#22C55E]/20 active:bg-[#22C55E]/30 focus-visible:ring-[#22C55E]',
  }[variant];

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      aria-label={`${label} pour le bien ${propertyTitle} réf #${propertyRef}`}
      className={`inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 whitespace-nowrap ${
        fullWidth ? 'w-full' : 'w-auto'
      } ${sizeClasses} ${variantClasses} ${className}`}
    >
      <WhatsAppIcon className={size === 'sm' ? 'w-4 h-4 shrink-0' : 'w-5 h-5 shrink-0'} />
      <span className="truncate">{label}</span>
    </a>
  );
};

export default WhatsAppButton;
