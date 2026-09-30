import React, { useState, useMemo, useEffect } from 'react';
import {
  Smartphone,
  Search,
  CheckCircle2,
  Copy,
  MessageCircle,
  Building2,
  Code2,
  X,
  Heart,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { PropertyCard } from './components/PropertyCard';
import { WhatsAppButton, buildWhatsAppUrl, WhatsAppIcon } from './components/WhatsAppButton';
import { AddPropertyForm } from './components/AddPropertyForm';
import { PropertyList } from './components/PropertyList';
import { SAMPLE_PROPERTIES } from './data/mockProperties';
import { Property } from './types/property';
import { fetchPropertiesFromApi } from './services/api';

export default function App() {
  const [properties, setProperties] = useState<Property[]>(SAMPLE_PROPERTIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'rent' | 'sale'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['prop-102']));
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(SAMPLE_PROPERTIES[0]);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalog' | 'add' | 'inspector' | 'code'>('catalog');
  const [mobileTab, setMobileTab] = useState<'catalog' | 'add' | 'inspector'>('catalog');
  const [testPhoneNumber, setTestPhoneNumber] = useState('242068001122');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState<string | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Chargement des données réelles depuis le backend PostgreSQL
  useEffect(() => {
    async function loadBackendProperties() {
      try {
        const data = await fetchPropertiesFromApi();
        if (data && data.length > 0) {
          setProperties(data);
          setSelectedProperty(data[0]);
        }
      } catch (err) {
        console.warn('Utilisation des données locales initiales:', err);
      }
    }
    loadBackendProperties();
  }, []);

  // Toggle favoris
  const handleToggleFavorite = (propertyId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) {
        next.delete(propertyId);
      } else {
        next.add(propertyId);
      }
      return next;
    });
  };

  // Ajout d'une nouvelle annonce par l'agent
  const handleAddProperty = (newProperty: Property) => {
    setProperties((prev) => [newProperty, ...prev]);
    setSelectedProperty(newProperty);
    setRecentlyAddedId(newProperty.id);
  };

  // Filtrage des biens
  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      const matchesType =
        filterType === 'all' ? true : item.transactionType === filterType;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(item.ref).includes(searchQuery);
      return matchesType && matchesSearch;
    });
  }, [properties, filterType, searchQuery]);

  // Génération de l'URL WhatsApp active pour le composant inspecteur
  const activeWhatsAppUrl = useMemo(() => {
    if (!selectedProperty) return '';
    return buildWhatsAppUrl(
      testPhoneNumber,
      selectedProperty.title,
      selectedProperty.ref
    );
  }, [selectedProperty, testPhoneNumber]);

  const activeMessageText = useMemo(() => {
    if (!selectedProperty) return '';
    return `Bonjour, je suis intéressé par votre bien ${selectedProperty.title} (Réf: #${selectedProperty.ref}) à Pointe-Noire. Est-il toujours disponible ?`;
  }, [selectedProperty]);

  const handleCopyUrl = () => {
    if (activeWhatsAppUrl) {
      navigator.clipboard?.writeText(activeWhatsAppUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleCopyCode = (snippet: string, name: string) => {
    navigator.clipboard?.writeText(snippet);
    setCopiedCodeSnippet(name);
    setTimeout(() => setCopiedCodeSnippet(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col">
      {/* Barre Supérieure Contractuelle : Marque & Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Marque ImmoWhats */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] flex items-center justify-center text-white shadow-sm shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-[#1E3A8A]">
                  ImmoWhats
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#22C55E]/15 text-[#15803D]">
                  Pointe-Noire
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Votre agence immobilière dans votre téléphone
              </p>
            </div>
          </div>

          {/* Sélecteur d'onglets */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'catalog'
                    ? 'bg-white text-[#1E3A8A] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Catalogue ({properties.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('add')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'add'
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'text-[#1E3A8A] hover:bg-slate-200/60'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Publier un bien</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inspector')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'inspector'
                    ? 'bg-white text-[#1E3A8A] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Générateur WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-md transition-colors hidden md:block ${
                  activeTab === 'code'
                    ? 'bg-white text-[#1E3A8A] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Code Components
              </button>
            </div>

            {/* Toggle simulateur smartphone */}
            <button
              type="button"
              onClick={() => setIsMobilePreview(!isMobilePreview)}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors hidden sm:flex items-center gap-1.5 ${
                isMobilePreview
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Basculer entre la vue responsive et le cadre mobile"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden lg:inline">Vue Smartphone</span>
            </button>
          </div>
        </div>
      </header>

      {/* Bannière d'introduction avec Slogan */}
      <section className="bg-gradient-to-r from-[#1E3A8A] to-[#172554] text-white py-6 px-4 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                Immobilier 2.0 à Pointe-Noire (Congo)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Votre agence immobilière dans votre téléphone.
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Consultez les meilleures annonces vérifiées et contactez directement
              l’agent sur WhatsApp avec un message pré-rempli contenant la référence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span>Contact direct wa.me</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
              Devise : FCFA (XAF)
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
              Quartiers : Révolution, Mpita, Côte Matève, etc.
            </div>
          </div>
        </div>
      </section>

      {/* Contenu Principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Onglet 1 : Catalogue des biens */}
        {activeTab === 'catalog' && (
          <div>
            {/* Barre de Recherche et Filtres */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Champ Recherche */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par quartier (ex: Révolution), titre ou Réf #..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:bg-white transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filtres Type de Transaction */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    filterType === 'all'
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tous ({properties.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('rent')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    filterType === 'rent'
                      ? 'bg-[#1E3A8A] text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  À Louer
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('sale')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    filterType === 'sale'
                      ? 'bg-amber-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  À Vendre
                </button>
              </div>
            </div>

            {/* Disposition conditionnelle : Simulateur Mobile vs Grille Responsive */}
            {isMobilePreview ? (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="text-xs text-slate-500 mb-2 font-medium flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Rendu Mobile-First 390px (Pointe-Noire Smartphone View)</span>
                </div>

                {/* Cadre de Smartphone ergonomique */}
                <div className="w-[390px] max-w-full bg-slate-900 p-3 rounded-[40px] shadow-2xl border-4 border-slate-800">
                  <div className="bg-[#F8FAFC] rounded-[32px] overflow-hidden min-h-[680px] max-h-[780px] flex flex-col border border-slate-200">
                    {/* Encoche Smartphone */}
                    <div className="bg-white h-7 flex items-center justify-between px-6 border-b border-slate-100">
                      <span className="text-[11px] font-bold text-slate-700">12:30</span>
                      <div className="w-16 h-4 bg-slate-900 rounded-full" />
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                        <span>4G</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Header application mobile */}
                    <div className="bg-white px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-base font-extrabold text-[#1E3A8A]">
                          ImmoWhats
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          Pointe-Noire, Congo
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#22C55E] flex items-center justify-center font-bold text-xs">
                        WA
                      </div>
                    </div>

                    {/* Flux défilable de cartes de biens ou formulaire selon l'onglet mobile */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-4">
                      {mobileTab === 'add' ? (
                        <div>
                          <AddPropertyForm
                            onSubmit={(newProp) => {
                              handleAddProperty(newProp);
                              setMobileTab('catalog');
                            }}
                            onCancel={() => setMobileTab('catalog')}
                          />
                        </div>
                      ) : mobileTab === 'inspector' && selectedProperty ? (
                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-left text-xs space-y-3">
                          <div className="flex items-center gap-2 text-emerald-600 font-bold">
                            <WhatsAppIcon className="w-5 h-5 text-[#22C55E]" />
                            <span>Test WhatsApp Mobile</span>
                          </div>
                          <p className="text-slate-600">
                            Message pour &quot;{selectedProperty.title}&quot; (Réf: #{selectedProperty.ref}) :
                          </p>
                          <div className="p-2.5 bg-emerald-50 rounded-lg text-slate-800 text-[11px]">
                            &quot;{activeMessageText}&quot;
                          </div>
                          <WhatsAppButton
                            phoneNumber={testPhoneNumber}
                            propertyTitle={selectedProperty.title}
                            propertyRef={selectedProperty.ref}
                            size="sm"
                          />
                        </div>
                      ) : filteredProperties.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-sm">
                          Aucun bien correspondant trouvé.
                        </div>
                      ) : (
                        filteredProperties.map((prop) => (
                          <PropertyCard
                            key={prop.id}
                            property={prop}
                            isFavorite={favorites.has(prop.id)}
                            onToggleFavorite={handleToggleFavorite}
                            onSelect={setSelectedProperty}
                            contactPhoneNumber={testPhoneNumber}
                          />
                        ))
                      )}
                    </div>

                    {/* Barre de navigation basse ergonomique (Thumb-Zone) */}
                    <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around text-[10px] font-medium text-slate-600">
                      <button
                        type="button"
                        onClick={() => setMobileTab('catalog')}
                        className={`flex flex-col items-center ${mobileTab === 'catalog' ? 'text-[#1E3A8A] font-bold' : 'hover:text-[#1E3A8A]'}`}
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Explorer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobileTab('add')}
                        className={`flex flex-col items-center ${mobileTab === 'add' ? 'text-[#1E3A8A] font-bold' : 'text-[#1E3A8A] hover:opacity-80'}`}
                      >
                        <div className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center -mt-2 shadow-sm">
                          <PlusCircle className="w-4 h-4" />
                        </div>
                        <span className="mt-0.5">Publier</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobileTab('inspector')}
                        className={`flex flex-col items-center ${mobileTab === 'inspector' ? 'text-[#15803D] font-bold' : 'hover:text-[#15803D]'}`}
                      >
                        <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Vue Grille Responsive Mobile-First avec le composant PropertyList */
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-2 sm:p-4">
                <PropertyList
                  properties={properties}
                  favoriteIds={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectProperty={(p) => {
                    setSelectedProperty(p);
                  }}
                  onAddPropertyClick={() => setActiveTab('add')}
                />
              </div>
            )}
          </div>
        )}

        {/* Onglet : Publier un bien (AddPropertyForm) */}
        {activeTab === 'add' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Formulaire Principal Mobile-First */}
              <div className="flex-1 w-full">
                <AddPropertyForm
                  onSubmit={(newProp) => {
                    handleAddProperty(newProp);
                  }}
                  onCancel={() => setActiveTab('catalog')}
                />
              </div>

              {/* Aperçu Dynamique de la fiche générée */}
              <div className="w-full lg:w-80 space-y-4 shrink-0">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#1E3A8A]">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Aperçu de la fiche publiée</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Dès publication, la fiche devient disponible dans le catalogue et le
                    lien WhatsApp direct est opérationnel.
                  </p>

                  {selectedProperty && (
                    <div className="pointer-events-auto">
                      <PropertyCard
                        property={selectedProperty}
                        isFavorite={favorites.has(selectedProperty.id)}
                        onToggleFavorite={handleToggleFavorite}
                        contactPhoneNumber={testPhoneNumber}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet 2 : Inspecteur & Générateur de Liens WhatsApp wa.me */}
        {activeTab === 'inspector' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 flex items-center justify-center text-[#15803D]">
                  <WhatsAppIcon className="w-6 h-6 text-[#22C55E]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Générateur de Lien WhatsApp (wa.me)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Validation du format de message pré-rempli exigé pour Pointe-Noire
                  </p>
                </div>
              </div>

              {/* Sélection du bien à tester */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Bien sélectionné
                  </label>
                  <select
                    value={selectedProperty?.id || ''}
                    onChange={(e) => {
                      const found = properties.find((p) => p.id === e.target.value);
                      if (found) setSelectedProperty(found);
                    }}
                    className="w-full p-2.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} (Réf #{p.ref}) - {p.neighborhood}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Numéro de l&apos;agence ou propriétaire (Congo +242)
                  </label>
                  <input
                    type="text"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    placeholder="242068001122"
                    className="w-full p-2.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Format standard : indicatif 242 suivi des 9 chiffres (ex: 242068001122)
                  </p>
                </div>
              </div>

              {/* Message Pré-rempli Exact Spécifié */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Message pré-rempli généré
                  </label>
                  <span className="text-[11px] font-semibold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded">
                    Conforme au cahier des charges
                  </span>
                </div>
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-sm text-slate-800 font-medium">
                  &quot;{activeMessageText}&quot;
                </div>
              </div>

              {/* URL finale wa.me */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  URL WhatsApp wa.me encodée
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={activeWhatsAppUrl}
                    className="flex-1 p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    {copiedUrl ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Bouton de test direct */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Cliquez ci-contre pour tester l&apos;ouverture dans WhatsApp Web ou Mobile :
                </div>
                <div className="w-full sm:w-auto">
                  {selectedProperty && (
                    <WhatsAppButton
                      phoneNumber={testPhoneNumber}
                      propertyTitle={selectedProperty.title}
                      propertyRef={selectedProperty.ref}
                      fullWidth={false}
                      size="md"
                      label="Ouvrir la discussion WhatsApp"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Aperçu du composant PropertyCard en isolé */}
            {selectedProperty && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Rendu isolé de la PropertyCard pour ce bien :
                </h3>
                <div className="max-w-sm mx-auto">
                  <PropertyCard
                    property={selectedProperty}
                    isFavorite={favorites.has(selectedProperty.id)}
                    onToggleFavorite={handleToggleFavorite}
                    contactPhoneNumber={testPhoneNumber}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet 3 : Code source prêt à l'emploi */}
        {activeTab === 'code' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Guide d'intégration */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#1E3A8A]" />
                Composants React & Tailwind pour ImmoWhats
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Voici le code source modulaire, propre et documenté des deux composants
                demandés : <code className="text-[#1E3A8A] font-bold">PropertyCard</code> et{' '}
                <code className="text-[#15803D] font-bold">WhatsAppButton</code>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-slate-200">
                  <span className="font-bold text-[#1E3A8A] block mb-1">
                    1. PropertyCard.tsx
                  </span>
                  Image 4:3, badges &quot;À Louer / À Vendre&quot;, prix en FCFA avec
                  séparateur, quartier Pointe-Noire, caractéristiques et bouton WhatsApp.
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-slate-200">
                  <span className="font-bold text-[#15803D] block mb-1">
                    2. WhatsAppButton.tsx
                  </span>
                  Génère l&apos;URL wa.me avec message pré-rempli pour Pointe-Noire et
                  référence Réf #.
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-slate-200">
                  <span className="font-bold text-[#1E3A8A] block mb-1">
                    3. AddPropertyForm.tsx
                  </span>
                  Formulaire mobile pour agents : titre, type radio, prix FCFA, quartiers
                  Pointe-Noire, contact +242, upload et publication.
                </div>
              </div>
            </div>

            {/* Code Snippet 1 : PropertyCard */}
            <div className="bg-slate-900 text-slate-100 rounded-xl overflow-hidden shadow-lg border border-slate-800">
              <div className="px-4 py-3 bg-slate-800/80 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="ml-2 font-bold text-white">src/components/PropertyCard.tsx</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyCode(
                      `// Code du composant PropertyCard disponible dans le projet sous /src/components/PropertyCard.tsx`,
                      'card'
                    )
                  }
                  className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  {copiedCodeSnippet === 'card' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono overflow-x-auto text-slate-300 leading-relaxed max-h-96">
{`import React, { useState } from 'react';
import { Bed, Bath, Maximize2, MapPin, Heart, Share2, ShieldCheck } from 'lucide-react';
import { Property } from '../types/property';
import { WhatsAppButton } from './WhatsAppButton';

export interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  onToggleFavorite?: (propertyId: string) => void;
  onSelect?: (property: Property) => void;
  className?: string;
  contactPhoneNumber?: string;
}

export function formatFCFAPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount);
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavorite = false,
  onToggleFavorite,
  onSelect,
  className = '',
  contactPhoneNumber,
}) => {
  const [imageError, setImageError] = useState(false);
  const { ref, title, transactionType, price, pricePeriod, currency = 'FCFA', neighborhood, bedrooms, bathrooms, area, imageUrl, whatsappNumber } = property;
  const isRent = transactionType === 'rent';
  const phone = contactPhoneNumber || whatsappNumber || '242068001122';

  return (
    <article className={\`group flex flex-col bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden \${className}\`}>
      {/* Zone Image avec Ratio 4:3 et Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={\`\${title} - \${neighborhood}\`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={\`px-2.5 py-1 text-xs font-bold uppercase rounded-lg shadow-sm \${isRent ? 'bg-[#1E3A8A] text-white' : 'bg-amber-600 text-white'}\`}>
            {isRent ? 'À Louer' : 'À Vendre'}
          </span>
          <span className="px-2 py-1 text-[11px] font-semibold text-slate-900 bg-white/95 rounded-lg shadow-sm">
            Réf #{ref}
          </span>
        </div>
      </div>

      {/* Détails du bien */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline gap-1 mb-1.5">
          <span className="text-xl font-extrabold text-[#1E3A8A] tabular-nums">
            {formatFCFAPrice(price)}
          </span>
          <span className="text-sm font-semibold text-[#1E3A8A]">{currency}</span>
          {pricePeriod && <span className="text-xs text-slate-500">/ {pricePeriod}</span>}
        </div>

        <h3 className="text-base font-bold text-slate-900 line-clamp-1 mb-1">{title}</h3>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{neighborhood}</span>
        </div>

        {/* Caractéristiques */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 mb-4 rounded-lg bg-[#F8FAFC] border border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 justify-center"><Bed className="w-4 h-4 text-[#1E3A8A]" /> <span className="font-semibold">{bedrooms}</span> ch.</div>
          <div className="flex items-center gap-1.5 justify-center border-x border-slate-200"><Bath className="w-4 h-4 text-[#1E3A8A]" /> <span className="font-semibold">{bathrooms}</span> sdb.</div>
          <div className="flex items-center gap-1.5 justify-center"><Maximize2 className="w-3.5 h-3.5 text-[#1E3A8A]" /> <span className="font-semibold">{area}</span> m²</div>
        </div>

        {/* Bouton WhatsApp */}
        <div className="mt-auto pt-1">
          <WhatsAppButton phoneNumber={phone} propertyTitle={title} propertyRef={ref} fullWidth size="md" />
        </div>
      </div>
    </article>
  );
};`}
              </pre>
            </div>

            {/* Code Snippet 2 : WhatsAppButton */}
            <div className="bg-slate-900 text-slate-100 rounded-xl overflow-hidden shadow-lg border border-slate-800">
              <div className="px-4 py-3 bg-slate-800/80 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="ml-2 font-bold text-white">src/components/WhatsAppButton.tsx</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyCode(
                      `// Code du composant WhatsAppButton disponible sous /src/components/WhatsAppButton.tsx`,
                      'wa'
                    )
                  }
                  className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  {copiedCodeSnippet === 'wa' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono overflow-x-auto text-slate-300 leading-relaxed max-h-96">
{`export function buildWhatsAppUrl(
  phoneNumber: string,
  propertyTitle: string,
  propertyRef: string | number,
  customMessage?: string
): string {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const message =
    customMessage ??
    \`Bonjour, je suis intéressé par votre bien \${propertyTitle} (Réf: #\${propertyRef}) à Pointe-Noire. Est-il toujours disponible ?\`;

  const encodedMessage = encodeURIComponent(message);
  return \`https://wa.me/\${cleanPhone}?text=\${encodedMessage}\`;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = '242068001122',
  propertyTitle,
  propertyRef,
  customMessage,
  label = 'Contacter sur WhatsApp',
  className = '',
  fullWidth = true,
  size = 'md',
  onClick,
}) => {
  const whatsappUrl = buildWhatsAppUrl(phoneNumber, propertyTitle, propertyRef, customMessage);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={\`inline-flex items-center justify-center font-semibold rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-sm active:scale-[0.98] transition-all h-12 px-4 text-sm gap-2 whitespace-nowrap \${
        fullWidth ? 'w-full' : 'w-auto'
      } \${className}\`}
    >
      <WhatsAppIcon className="w-5 h-5 shrink-0" />
      <span className="truncate">{label}</span>
    </a>
  );
};`}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Footer sobre et élégant */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1E3A8A]">ImmoWhats</span>
            <span>·</span>
            <span>Votre agence immobilière dans votre téléphone à Pointe-Noire (Congo)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Marché : Pointe-Noire</span>
            <span>·</span>
            <span>WhatsApp API : wa.me</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
