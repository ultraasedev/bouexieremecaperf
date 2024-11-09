// app/api/reviews/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Avis par défaut
const defaultReviews = [
  {
    firstName: "Thomas",
    lastName: "Martin",
    name: "Thomas Martin",
    email: "thomas.martin@exemple.fr",
    location: "DINAN",
    service: "Reprogrammation",
    rating: 5,
    text: "Service exceptionnel ! La reprogrammation de mon véhicule a été faite avec professionnalisme. Les performances sont au rendez-vous et la consommation a vraiment baissé.",
    image: "https://ui-avatars.com/api/?name=TM&background=111111&color=ffffff"
  },
  {
    firstName: "Marie",
    lastName: "Dubois",
    name: "Marie Dubois",
    email: "marie.dubois@exemple.fr",
    location: "LANVALLAY",
    service: "Diagnostic",
    rating: 5,
    text: "Très satisfaite du service. Le diagnostic a été fait rapidement et directement à mon domicile. Les explications étaient claires et les solutions proposées adaptées.",
    image: "https://ui-avatars.com/api/?name=MD&background=111111&color=ffffff"
  },
  {
    firstName: "Pierre",
    lastName: "Lefort",
    name: "Pierre Lefort",
    email: "pierre.lefort@exemple.fr",
    location: "TADEN",
    service: "Mécanique",
    rating: 5,
    text: "Excellent travail sur ma voiture. Le fait qu'il se déplace est vraiment pratique. Les réparations ont été faites rapidement et efficacement.",
    image: "https://ui-avatars.com/api/?name=PL&background=111111&color=ffffff"
  },
  {
    firstName: "Sophie",
    lastName: "Moreau",
    name: "Sophie Moreau",
    email: "sophie.moreau@exemple.fr",
    location: "QUÉVERT",
    service: "Pièces Premium",
    rating: 5,
    text: "Installation de pièces performance sur ma voiture, le résultat est bluffant ! Le conseil était parfait et le travail très propre.",
    image: "https://ui-avatars.com/api/?name=SM&background=111111&color=ffffff"
  },
  {
    firstName: "Lucas",
    lastName: "Bernard",
    name: "Lucas Bernard",
    email: "lucas.bernard@exemple.fr",
    location: "LÉHON",
    service: "Entretien",
    rating: 5,
    text: "Service impeccable pour l'entretien de mon véhicule. La prestation à domicile est vraiment un plus, tout est fait dans les règles de l'art.",
    image: "https://ui-avatars.com/api/?name=LB&background=111111&color=ffffff"
  },
  {
    firstName: "Emma",
    lastName: "Laurent",
    name: "Emma Laurent",
    email: "emma.laurent@exemple.fr",
    location: "TRÉLIVAN",
    service: "Reprogrammation",
    rating: 5,
    text: "Super expérience pour la reprogrammation de ma voiture. Les gains en performance sont bien présents et la consommation est optimisée.",
    image: "https://ui-avatars.com/api/?name=EL&background=111111&color=ffffff"
  }
];

// Fonction pour initialiser les avis par défaut
async function initializeDefaultReviews() {
  const existingReviews = await prisma.review.count();
  
  if (existingReviews === 0) {
    for (const review of defaultReviews) {
      await prisma.review.create({
        data: {
          ...review,
          createdAt: new Date()
        }
      });
    }
  }
}

export async function GET() {
  try {
    // Initialiser les avis par défaut si nécessaire
    await initializeDefaultReviews();
    
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des avis' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, location, service, rating, text } = body;

    // Validation basique
    if (!firstName || !lastName || !email || !location || !service || !rating || !text) {
      return NextResponse.json(
        { message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a déjà laissé un avis
    const existingReview = await prisma.review.findFirst({
      where: { email }
    });

    if (existingReview) {
      return NextResponse.json(
        { message: 'Vous avez déjà publié un avis' },
        { status: 400 }
      );
    }

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        location,
        service,
        rating,
        text,
        image: `https://ui-avatars.com/api/?name=${firstName[0]}${lastName[0]}&background=111111&color=ffffff`,
        createdAt: new Date()
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de l\'avis' },
      { status: 500 }
    );
  }
}