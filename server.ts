import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getProperties, getPropertyById, createProperty } from './src/db/properties.ts';
import { optionalAuth, requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());

// API: Liste des biens avec filtres (Quartier, Type, Budget max, Recherche)
app.get('/api/properties', async (req: Request, res: Response) => {
  try {
    const { district, type, maxBudget, search } = req.query;

    const dbProperties = await getProperties({
      district: typeof district === 'string' ? district : undefined,
      type: type === 'rent' || type === 'sale' ? type : undefined,
      maxBudget: maxBudget ? Number(maxBudget) : undefined,
      search: typeof search === 'string' ? search : undefined,
    });

    // Mappage vers le format Property de l'application
    const mapped = dbProperties.map((row) => ({
      id: `prop-${row.id}`,
      ref: String(row.referenceCode),
      title: row.title,
      transactionType: row.propertyType as 'rent' | 'sale',
      price: row.priceFcfa,
      pricePeriod: row.propertyType === 'rent' ? 'mois' : undefined,
      currency: 'FCFA',
      neighborhood: row.district,
      city: row.city,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      area: row.areaSqm || 75,
      imageUrl: row.imageUrl,
      whatsappNumber: row.agentWhatsapp,
      description: row.description || '',
      isVerified: row.isVerified,
      createdAt: row.createdAt,
    }));

    res.json(mapped);
  } catch (error: any) {
    console.error('Erreur API /api/properties:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur lors de la récupération des biens.' });
  }
});

// API: Détail d'un bien
app.get('/api/properties/:id', async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id.replace('prop-', '');
    const numId = Number(rawId);
    if (isNaN(numId)) {
      return res.status(400).json({ error: 'Identifiant invalide.' });
    }

    const row = await getPropertyById(numId);
    if (!row) {
      return res.status(404).json({ error: 'Bien non trouvé.' });
    }

    res.json({
      id: `prop-${row.id}`,
      ref: String(row.referenceCode),
      title: row.title,
      transactionType: row.propertyType,
      price: row.priceFcfa,
      pricePeriod: row.propertyType === 'rent' ? 'mois' : undefined,
      currency: 'FCFA',
      neighborhood: row.district,
      city: row.city,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      area: row.areaSqm,
      imageUrl: row.imageUrl,
      whatsappNumber: row.agentWhatsapp,
      description: row.description,
      isVerified: row.isVerified,
    });
  } catch (error: any) {
    console.error(`Erreur API /api/properties/${req.params.id}:`, error);
    res.status(500).json({ error: error.message || 'Erreur serveur.' });
  }
});

// API: Insertion d'un nouveau bien (AddPropertyForm)
app.post('/api/properties', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      price,
      transactionType,
      neighborhood,
      city,
      bedrooms,
      bathrooms,
      area,
      whatsappNumber,
      imageUrl,
    } = req.body;

    if (!title || !price || !transactionType || !neighborhood) {
      return res.status(400).json({ error: 'Veuillez renseigner tous les champs obligatoires.' });
    }

    const created = await createProperty({
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      priceFcfa: Number(price),
      propertyType: transactionType === 'sale' ? 'sale' : 'rent',
      district: String(neighborhood).trim(),
      city: city ? String(city).trim() : 'Pointe-Noire',
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      areaSqm: Number(area) || 75,
      agentWhatsapp: String(whatsappNumber).replace(/[^0-9]/g, ''),
      imageUrl: imageUrl || '/src/assets/images/appartement_centre_ville_1790721595684.jpg',
    });

    res.status(201).json({
      id: `prop-${created.id}`,
      ref: String(created.referenceCode),
      title: created.title,
      transactionType: created.propertyType,
      price: created.priceFcfa,
      pricePeriod: created.propertyType === 'rent' ? 'mois' : undefined,
      currency: 'FCFA',
      neighborhood: created.district,
      city: created.city,
      bedrooms: created.bedrooms,
      bathrooms: created.bathrooms,
      area: created.areaSqm,
      imageUrl: created.imageUrl,
      whatsappNumber: created.agentWhatsapp,
      description: created.description,
      isVerified: created.isVerified,
    });
  } catch (error: any) {
    console.error('Erreur API POST /api/properties:', error);
    res.status(500).json({ error: error.message || 'Échec de la publication de la fiche.' });
  }
});

// Configuration Vite Dev / Prod Middleware
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur ImmoWhats en cours d'exécution sur le port ${PORT}`);
  });
}

startServer();
