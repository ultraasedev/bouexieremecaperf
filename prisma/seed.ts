// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

// Fonction pour générer un token unique
const generateToken = () => randomBytes(32).toString('hex');

async function cleanDatabase() {
  // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
  await prisma.quoteEvent.deleteMany();
  await prisma.emailData.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.review.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('Base de données nettoyée');
}

async function main() {
  try {
    // Nettoyer la base de données
    await cleanDatabase();

    // Créer un utilisateur admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@bmp.fr",
        hashedPassword,
        role: "admin",
        phone: "0123456789",
        address: "1 rue de la Mécanique, 35340 La Bouexière",
        emailVerified: new Date(),
      },
    });

    console.log('Utilisateur admin créé:', admin);

    // Créer un client entreprise test
    const companyClient = await prisma.client.create({
      data: {
        type: 'company',
        name: "Entreprise Test",
        email: "entreprise@test.com",
        phone: "0123456789",
        address: "123 rue du Test, 35000 Rennes",
        siret: "12345678900000",
        vatNumber: "FR12345678900",
      },
    });

    // Créer un client particulier test
    const individualClient = await prisma.client.create({
      data: {
        type: 'individual',
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean.dupont@test.com",
        phone: "0987654321",
        address: "456 avenue de l'Exemple, 35000 Rennes",
      },
    });

    console.log('Clients créés:', { companyClient, individualClient });

    // Créer un véhicule test pour le client entreprise
    const companyVehicle = await prisma.vehicle.create({
      data: {
        brand: "Renault",
        model: "Kangoo",
        year: 2020,
        type: "Utilitaire",
        plate: "AB123CD",
        vin: "VF1KC0JEF12345678",
        clientId: companyClient.id,
      },
    });

    // Créer un véhicule test pour le client particulier
    const individualVehicle = await prisma.vehicle.create({
      data: {
        brand: "Peugeot",
        model: "308",
        year: 2019,
        type: "Berline",
        plate: "EF456GH",
        vin: "VF3LCRFJT12345678",
        clientId: individualClient.id,
      },
    });

    console.log('Véhicules créés:', { companyVehicle, individualVehicle });

    // Créer des rendez-vous tests
    const appointments = await Promise.all([
      prisma.appointment.create({
        data: {
          clientId: individualClient.id,
          service: "Diagnostic",
          vehicle: {
            brand: "Peugeot",
            model: "308",
            year: 2019,
            plate: "EF456GH"
          },
          description: "Problème de démarrage",
          requestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
          status: "PENDING",
          token: generateToken(), // Ajout du token
        },
      }),
      prisma.appointment.create({
        data: {
          clientId: companyClient.id,
          service: "Mécanique",
          vehicle: {
            brand: "Renault",
            model: "Kangoo",
            year: 2020,
            plate: "AB123CD"
          },
          description: "Révision annuelle",
          requestedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
          status: "CONFIRMED",
          token: generateToken(), // Ajout du token
        },
      }),
    ]);

    console.log('Rendez-vous créés:', appointments);

    // Créer des articles de blog
    const blogPosts = await Promise.all([
      prisma.blogPost.create({
        data: {
          title: "L'importance de l'entretien régulier",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.",
          slug: "importance-entretien-regulier",
          published: true,
        },
      }),
      prisma.blogPost.create({
        data: {
          title: "Comment choisir ses pneus",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.",
          slug: "comment-choisir-pneus",
          published: true,
        },
      }),
    ]);

    console.log('Articles de blog créés:', blogPosts);

    // Créer des avis clients
    const reviews = await Promise.all([
      prisma.review.create({
        data: {
          firstName: "Pierre",
          lastName: "Martin",
          name: "Pierre Martin",
          email: "pierre.martin@test.com",
          location: "Rennes",
          service: "Diagnostic",
          rating: 5,
          text: "Excellent service, très professionnel ! Je recommande vivement.",
          image: "/reviews/default.jpg",
        },
      }),
      prisma.review.create({
        data: {
          firstName: "Marie",
          lastName: "Dubois",
          name: "Marie Dubois",
          email: "marie.dubois@test.com",
          location: "La Bouexière",
          service: "Réparation",
          rating: 4,
          text: "Très satisfaite du service et des conseils reçus.",
          image: "/reviews/default.jpg",
        },
      }),
    ]);

    console.log('Avis créés:', reviews);

  } catch (error) {
    console.error('Erreur lors du seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });