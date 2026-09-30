import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Building,
  DollarSign,
  Phone,
  FileText,
  Bed,
  Bath,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { Property, PropertyTransactionType } from '../types/property';
import { formatFCFAPrice } from './PropertyCard';
import { createPropertyApi } from '../services/api';

export interface AddPropertyFormProps {
  /**
   * Callback déclenché lors de la soumission valide du formulaire
   */
  onSubmit?: (newProperty: Property) => void;
  /**
   * Annuler ou fermer le formulaire (optionnel pour les modales ou tiroirs)
   */
  onCancel?: () => void;
  /**
   * Numéro WhatsApp par défaut de l'agent
   */
  defaultWhatsApp?: string;
  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

// Quartiers récurrents de Pointe-Noire demandés
export const POINTE_NOIRE_NEIGHBORHOODS = [
  'Centre-ville',
  'Mpita',
  'Mvoutvoutou',
  'Tié-Tié',
  'Loandjili',
  'Och',
  'Songolo',
  'Autre',
] as const;

// Images exemples par défaut pour faciliter les tests rapides sur smartphone
const SAMPLE_PRESET_IMAGES = [
  {
    label: 'Villa avec jardin',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Appartement standing',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Studio moderne',
    url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  },
];

export const AddPropertyForm: React.FC<AddPropertyFormProps> = ({
  onSubmit,
  onCancel,
  defaultWhatsApp = '068001122',
  className = '',
}) => {
  // 1. Titre de l'annonce
  const [title, setTitle] = useState('');

  // 2. Type d'offre : "Location" ou "Vente"
  const [transactionType, setTransactionType] = useState<PropertyTransactionType>('rent');

  // 3. Prix en FCFA
  const [price, setPrice] = useState<string>('');

  // 4. Quartier à Pointe-Noire
  const [neighborhood, setNeighborhood] = useState<string>('Centre-ville');
  const [customNeighborhood, setCustomNeighborhood] = useState('');

  // 5. Nombre de chambres, salles de bain et superficie
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(1);
  const [area, setArea] = useState<string>('85');

  // 6. Numéro WhatsApp de l'agent (indicatif +242 pour le Congo)
  // L'agent saisit ses 9 chiffres locaux (ex: 06 800 11 22 ou 05 555 44 33)
  const [agentPhone, setAgentPhone] = useState(defaultWhatsApp);

  // 7. Description courte
  const [description, setDescription] = useState('');

  // 8. Zone d'import de photos (gestion locale des fichiers avec aperçu)
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // États de validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedProperty, setSubmittedProperty] = useState<Property | null>(null);

  // Gestion de la sélection de fichiers photos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPreviews: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        newPreviews.push(objectUrl);
      }
    });

    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Validation formulaire
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Le titre de l'annonce est requis";
    }

    const numPrice = Number(price.replace(/\s/g, ''));
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Veuillez saisir un prix valide en FCFA';
    }

    if (neighborhood === 'Autre' && !customNeighborhood.trim()) {
      newErrors.neighborhood = 'Veuillez préciser le quartier à Pointe-Noire';
    }

    const cleanPhone = agentPhone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      newErrors.agentPhone = 'Numéro WhatsApp invalide (minimum 8 chiffres)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const numPrice = Number(price.replace(/\s/g, ''));
    const finalNeighborhood =
      neighborhood === 'Autre'
        ? `${customNeighborhood.trim()}, Pointe-Noire`
        : `${neighborhood}, Pointe-Noire`;

    // Normalisation de l'indicatif Congo +242
    let fullWhatsApp = agentPhone.replace(/[^0-9]/g, '');
    if (!fullWhatsApp.startsWith('242')) {
      fullWhatsApp = `242${fullWhatsApp}`;
    }

    // Image principale ou image de secours stylisée
    const finalImage =
      imagePreviews.length > 0
        ? imagePreviews[0]
        : transactionType === 'rent'
        ? '/src/assets/images/appartement_centre_ville_1790721595684.jpg'
        : '/src/assets/images/villa_pointe_noire_1790721583524.jpg';

    try {
      const savedProperty = await createPropertyApi({
        title: title.trim(),
        description: description.trim(),
        price: numPrice,
        transactionType,
        neighborhood: finalNeighborhood,
        city: 'Pointe-Noire',
        bedrooms,
        bathrooms,
        area: Number(area) || 75,
        imageUrl: finalImage,
        whatsappNumber: fullWhatsApp,
      });

      setSubmittedProperty(savedProperty);
      onSubmit?.(savedProperty);
    } catch (err: any) {
      console.warn('API error, saving locally fallback:', err);
      // Fallback local si backend déconnecté
      const fallbackProperty: Property = {
        id: `prop-${Date.now()}`,
        ref: String(Math.floor(100 + Math.random() * 900)),
        title: title.trim(),
        transactionType,
        price: numPrice,
        pricePeriod: transactionType === 'rent' ? 'mois' : undefined,
        currency: 'FCFA',
        neighborhood: finalNeighborhood,
        city: 'Pointe-Noire',
        bedrooms,
        bathrooms,
        area: Number(area) || 75,
        imageUrl: finalImage,
        additionalImages: imagePreviews.slice(1),
        whatsappNumber: fullWhatsApp,
        description: description.trim(),
        isVerified: true,
      };
      setSubmittedProperty(fallbackProperty);
      onSubmit?.(fallbackProperty);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Écran de succès si fiche générée
  if (submittedProperty) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm text-center">
        <div className="w-14 h-14 bg-emerald-100 text-[#22C55E] rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-[#1E3A8A] mb-1">
          Fiche Immobilière Générée !
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Votre bien est prêt. Les clients peuvent vous contacter directement sur
          WhatsApp avec la référence <strong>#{submittedProperty.ref}</strong>.
        </p>

        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 mb-5">
          <div className="flex justify-between">
            <span className="text-slate-500">Titre :</span>
            <span className="font-semibold text-slate-800">{submittedProperty.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Prix :</span>
            <span className="font-bold text-[#1E3A8A]">
              {formatFCFAPrice(submittedProperty.price)} FCFA
              {submittedProperty.pricePeriod ? ` / ${submittedProperty.pricePeriod}` : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Localisation :</span>
            <span className="font-medium text-slate-700">{submittedProperty.neighborhood}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">WhatsApp :</span>
            <span className="font-mono text-emerald-700 font-bold">
              +{submittedProperty.whatsappNumber}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setSubmittedProperty(null);
              setTitle('');
              setPrice('');
              setDescription('');
              setImagePreviews([]);
            }}
            className="w-full h-12 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold text-sm transition-all shadow-sm active:scale-[0.98]"
          >
            Publier une autre annonce
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 text-left ${className}`}
    >
      {/* En-tête formulaire mobile */}
      <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
            Espace Agent Immobilier
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#1E3A8A]">
            Nouvelle annonce à Pointe-Noire
          </h2>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* 1. Titre de l'annonce */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            1. Titre de l&apos;annonce <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Bel appartement 3 pièces vue mer"
            className={`w-full h-12 px-3.5 text-sm bg-[#F8FAFC] border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-colors ${
              errors.title ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
            }`}
          />
          {errors.title && (
            <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.title}
            </p>
          )}
        </div>

        {/* 2. Type d'offre : Boutons radio simples "Location" ou "Vente" */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            2. Type d&apos;offre <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setTransactionType('rent')}
              className={`h-11 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                transactionType === 'rent'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>À Louer (Location)</span>
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('sale')}
              className={`h-11 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                transactionType === 'sale'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>À Vendre (Vente)</span>
            </button>
          </div>
        </div>

        {/* 3. Prix en FCFA */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700">
              3. Prix en FCFA <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">
              {transactionType === 'rent' ? 'Tarif par mois' : 'Prix net vendeur'}
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={transactionType === 'rent' ? '250000' : '45000000'}
              className={`w-full h-12 pl-3.5 pr-20 text-sm font-semibold tabular-nums bg-[#F8FAFC] border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-colors ${
                errors.price ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-xs font-bold text-[#1E3A8A]">
              <span>FCFA</span>
              {transactionType === 'rent' && (
                <span className="text-slate-400 font-normal">/ mois</span>
              )}
            </div>
          </div>
          {errors.price && (
            <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.price}
            </p>
          )}
        </div>

        {/* 4. Quartier à Pointe-Noire (Menu Déroulant) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            4. Quartier à Pointe-Noire <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full h-12 px-3.5 text-sm font-medium bg-[#F8FAFC] border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-colors appearance-none cursor-pointer"
            >
              {POINTE_NOIRE_NEIGHBORHOODS.map((q) => (
                <option key={q} value={q}>
                  {q === 'Autre' ? 'Autre quartier (préciser)...' : q}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              ▼
            </div>
          </div>

          {/* Champ quartier personnalisé si "Autre" sélectionné */}
          {neighborhood === 'Autre' && (
            <div className="mt-2">
              <input
                type="text"
                value={customNeighborhood}
                onChange={(e) => setCustomNeighborhood(e.target.value)}
                placeholder="Indiquez le nom du quartier (ex: Côte Matève, Ngoyo...)"
                className="w-full h-11 px-3.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
              {errors.neighborhood && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.neighborhood}</p>
              )}
            </div>
          )}
        </div>

        {/* 5. Chambres et Salles de bain (Compteurs tactiles ergonomiques) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            5. Pièces & Caractéristiques
          </label>
          <div className="grid grid-cols-3 gap-2">
            {/* Chambres */}
            <div className="p-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl flex flex-col items-center">
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-1.5">
                <Bed className="w-3.5 h-3.5 text-[#1E3A8A]" />
                Chambres
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBedrooms((prev) => Math.max(0, prev - 1))}
                  aria-label="Diminuer chambres"
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:bg-slate-100"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-extrabold text-sm text-slate-900 tabular-nums w-4 text-center">
                  {bedrooms}
                </span>
                <button
                  type="button"
                  onClick={() => setBedrooms((prev) => prev + 1)}
                  aria-label="Augmenter chambres"
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:bg-slate-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Salles de bain */}
            <div className="p-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl flex flex-col items-center">
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-1.5">
                <Bath className="w-3.5 h-3.5 text-[#1E3A8A]" />
                Douches
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBathrooms((prev) => Math.max(1, prev - 1))}
                  aria-label="Diminuer douches"
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:bg-slate-100"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-extrabold text-sm text-slate-900 tabular-nums w-4 text-center">
                  {bathrooms}
                </span>
                <button
                  type="button"
                  onClick={() => setBathrooms((prev) => prev + 1)}
                  aria-label="Augmenter douches"
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:bg-slate-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Surface m² */}
            <div className="p-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl flex flex-col items-center">
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                Superficie
              </span>
              <div className="relative w-full">
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="85"
                  className="w-full h-7 px-1.5 text-center font-extrabold text-sm tabular-nums bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                />
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">
                  m²
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Numéro WhatsApp de l'agent (+242 pré-rempli) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            6. Numéro WhatsApp de contact <span className="text-rose-500">*</span>
          </label>
          <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-[#F8FAFC] focus-within:ring-2 focus-within:ring-[#1E3A8A] focus-within:bg-white">
            {/* Indicatif Congo Brazzaville figé et rassurant */}
            <div className="flex items-center gap-1.5 px-3 bg-emerald-50 text-[#15803D] font-bold text-xs border-r border-slate-200 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span>+242 (Congo)</span>
            </div>
            <input
              type="tel"
              inputMode="tel"
              value={agentPhone}
              onChange={(e) => setAgentPhone(e.target.value)}
              placeholder="06 800 11 22"
              className="w-full h-12 px-3 text-sm font-mono font-medium bg-transparent focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Les clients cliqueront directement sur ce numéro pour ouvrir la discussion.
          </p>
          {errors.agentPhone && (
            <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.agentPhone}
            </p>
          )}
        </div>

        {/* 7. Description courte */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            7. Description courte (atouts du bien)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex : Forage avec surpresseur, groupe électrogène, quartier calme et sécurisé..."
            className="w-full p-3 text-xs bg-[#F8FAFC] border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-colors resize-none"
          />
        </div>

        {/* 8. Zone d'import de photos (UI d'upload épurée) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700">
              8. Photos du bien
            </label>
            <span className="text-[11px] text-slate-400">
              {imagePreviews.length} photo(s) ajoutée(s)
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />

          {/* Grille de prévisualisation des photos */}
          {imagePreviews.length > 0 ? (
            <div className="space-y-2 mb-2">
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 group bg-slate-100"
                  >
                    <img
                      src={url}
                      alt={`Photo aperçu ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#1E3A8A] text-white">
                        Principale
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Bouton d'ajout additionnel */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-300 hover:border-[#1E3A8A] flex flex-col items-center justify-center text-slate-500 hover:text-[#1E3A8A] transition-colors"
                >
                  <Plus className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-semibold">Ajouter</span>
                </button>
              </div>
            </div>
          ) : (
            /* Zone vide d'import épurée */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-[#1E3A8A] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-[#F8FAFC] hover:bg-blue-50/30 flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center mb-2">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Prendre une photo ou importer depuis la galerie
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG ou WEBP jusqu&apos;à 10 Mo
              </p>
            </div>
          )}

          {/* Raccourci de test : photos pré-enregistrées pour prototypage immédiat */}
          {imagePreviews.length === 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">Photos modèles :</span>
              {SAMPLE_PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImagePreviews([preset.url])}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bouton de validation bleu foncé requis */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-13 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] active:bg-[#0f172a] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publication en cours...
              </span>
            ) : (
              <>
                <Building className="w-4.5 h-4.5" />
                <span>Publier et générer ma fiche</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddPropertyForm;
