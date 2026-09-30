import { Property } from '../types/property';
import villaImg from '../assets/images/villa_pointe_noire_1790721583524.jpg';
import aptImg from '../assets/images/appartement_centre_ville_1790721595684.jpg';
import duplexImg from '../assets/images/duplex_cote_mateve_1790721605772.jpg';
import studioImg from '../assets/images/studio_meuble_mpita_1790721616068.jpg';

export const SAMPLE_PROPERTIES: Property[] = [
  {
    id: 'prop-102',
    ref: '102', // Spécifié explicitement dans la consigne de l'utilisateur
    title: 'Appartement Haut Standing Vue Mer',
    transactionType: 'rent',
    price: 250000,
    pricePeriod: 'mois',
    currency: 'FCFA',
    neighborhood: 'Avenue de la Révolution, Pointe-Noire',
    city: 'Pointe-Noire',
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    imageUrl: aptImg,
    isFeatured: true,
    isVerified: true,
    whatsappNumber: '242068001122',
    description:
      'Superbe appartement lumineux rénové avec balcon, cuisine équipée moderne, groupe électrogène et réserve d’eau avec surpresseur.',
  },
  {
    id: 'prop-103',
    ref: '103',
    title: 'Grande Villa Contemporaine avec Jardin',
    transactionType: 'rent',
    price: 650000,
    pricePeriod: 'mois',
    currency: 'FCFA',
    neighborhood: 'Mpita (Zone Résidentielle), Pointe-Noire',
    city: 'Pointe-Noire',
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
    imageUrl: villaImg,
    isFeatured: true,
    isVerified: true,
    whatsappNumber: '242068001122',
    description:
      'Villa de maître clôturée avec grand séjour, jardin tropical arboré, dépendance gardien, forage et bâche à eau.',
  },
  {
    id: 'prop-104',
    ref: '104',
    title: 'Duplex Neuf avec Grande Terrasse Privative',
    transactionType: 'sale',
    price: 68000000,
    currency: 'FCFA',
    neighborhood: 'Côte Matève, Pointe-Noire',
    city: 'Pointe-Noire',
    bedrooms: 3,
    bathrooms: 3,
    area: 165,
    imageUrl: duplexImg,
    isFeatured: false,
    isVerified: true,
    whatsappNumber: '242068001122',
    description:
      'Opportunité d’achat dans un secteur calme et recherché en bordure côtière. Titre foncier disponible.',
  },
  {
    id: 'prop-105',
    ref: '105',
    title: 'Studio Cosy Entièrement Meublé & Équipé',
    transactionType: 'rent',
    price: 180000,
    pricePeriod: 'mois',
    currency: 'FCFA',
    neighborhood: 'Centre-ville (Près du Grand Marché), Pointe-Noire',
    city: 'Pointe-Noire',
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    imageUrl: studioImg,
    isFeatured: false,
    isVerified: true,
    whatsappNumber: '242068001122',
    description:
      'Idéal cadre ou expatrié en mission, studio prêt à habiter avec climatisation, Canal+, WiFi fibre et sécurité 24h/24.',
  },
];
