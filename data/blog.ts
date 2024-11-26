// data/blog.ts

export const categories = [
  { id: 'all', name: 'Tous' },
  { id: 'performance', name: 'Performance' },
  { id: 'entretien', name: 'Entretien' },
  { id: 'technologie', name: 'Technologie' },
  { id: 'diagnostic', name: 'Diagnostic' },
  { id: 'conseils', name: 'Conseils' }
];

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: string;
  slug: string;
  date: string;
  author: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: "Guide complet : La reprogrammation Stage 1",
    excerpt: "Découvrez tout ce qu'il faut savoir sur la reprogrammation Stage 1, ses avantages, et comment elle peut transformer votre véhicule tout en préservant sa fiabilité.",
    content: `
      <article>
        <p>La reprogrammation Stage 1 représente souvent le premier pas dans l'optimisation des performances de votre véhicule. Cette modification, réalisée uniquement via le logiciel, offre un excellent rapport amélioration/investissement.</p>

        <h2>Qu'est-ce que le Stage 1 ?</h2>
        <p>Le Stage 1 consiste en une optimisation du calculateur d'origine de votre véhicule. Cette modification logicielle permet d'exploiter les marges de sécurité laissées par le constructeur, sans nécessiter de modifications mécaniques.</p>

        <h2>Les avantages du Stage 1</h2>
        <ul>
          <li>Gain de puissance moyen de 15 à 30%</li>
          <li>Amélioration du couple moteur</li>
          <li>Meilleure réactivité à l'accélération</li>
          <li>Réduction possible de la consommation</li>
          <li>100% réversible</li>
        </ul>

        <h2>Pour quels véhicules ?</h2>
        <p>Le Stage 1 est particulièrement efficace sur les moteurs turbo, qu'ils soient essence ou diesel. Les gains sont variables selon les modèles, mais toujours significatifs.</p>

        <h2>Précautions et prérequis</h2>
        <p>Avant d'envisager une reprogrammation Stage 1, plusieurs points sont à vérifier :</p>
        <ul>
          <li>État mécanique général du véhicule</li>
          <li>Entretien à jour</li>
          <li>Historique des révisions</li>
          <li>État des pièces d'usure</li>
        </ul>

        <h2>Notre approche</h2>
        <p>Chez Bouëxière Méca Perf, chaque reprogrammation est précédée d'un diagnostic complet. Nous utilisons les meilleurs outils du marché et adaptons chaque cartographie aux spécificités de votre véhicule.</p>
      </article>
    `,
    image: "/blog/stage1.jpg",
    category: "Performance",
    readTime: "7 min",
    slug: "guide-reprogrammation-stage-1",
    date: "2024-03-15",
    author: "Bouëxière Méca Perf",
    tags: ["reprogrammation", "performance", "stage1", "optimisation"]
  },
  {
    id: '2',
    title: "Les signes qu'un diagnostic est nécessaire",
    excerpt: "Apprenez à reconnaître les signes avant-coureurs d'un problème mécanique et l'importance d'un diagnostic précoce pour éviter les graves pannes.",
    content: `
      <article>
        <p>Un diagnostic précoce peut vous éviter bien des désagréments et des réparations coûteuses. Voici les principaux signes qui doivent vous alerter.</p>

        <h2>Signes visuels</h2>
        <ul>
          <li>Voyants au tableau de bord</li>
          <li>Fumées anormales</li>
          <li>Traces de fuites</li>
          <li>Usure inhabituelle des pneumatiques</li>
        </ul>

        <h2>Signes auditifs</h2>
        <p>Plusieurs bruits peuvent indiquer un problème mécanique :</p>
        <ul>
          <li>Claquements au démarrage</li>
          <li>Sifflements</li>
          <li>Grondements inhabituels</li>
          <li>Bruits de frottement</li>
        </ul>

        <h2>Changements de comportement</h2>
        <ul>
          <li>Perte de puissance</li>
          <li>Consommation excessive</li>
          <li>Démarrages difficiles</li>
          <li>Vibrations anormales</li>
        </ul>

        <h2>L'importance du diagnostic électronique</h2>
        <p>Le diagnostic électronique moderne permet de détecter précisément l'origine des problèmes, même ceux qui ne sont pas encore perceptibles à la conduite.</p>

        <h2>Notre approche diagnostic</h2>
        <p>Nous utilisons les derniers outils de diagnostic pour une analyse complète de votre véhicule, permettant d'identifier avec précision tout dysfonctionnement.</p>
      </article>
    `,
    image: "/blog/diagnostic.jpg",
    category: "Diagnostic",
    readTime: "5 min",
    slug: "signes-diagnostic-necessaire",
    date: "2024-03-10",
    author: "Bouëxière Méca Perf",
    tags: ["diagnostic", "entretien", "prévention", "panne"]
  },
  {
    id: '3',
    title: "Préparation Stage 2 & 3 : Guide complet",
    excerpt: "Tout ce qu'il faut savoir sur les préparations Stage 2 et 3, des modifications nécessaires aux gains de performance attendus.",
    content: `
      <article>
        <p>Les préparations Stage 2 et 3 représentent les niveaux ultimes de la personnalisation performance. Découvrez en détail ces modifications avancées.</p>

        <h2>Le Stage 2 en détail</h2>
        <h3>Modifications nécessaires</h3>
        <ul>
          <li>Ligne d'échappement sport</li>
          <li>Admission d'air performance</li>
          <li>Échangeur optimisé</li>
          <li>Reprogrammation spécifique</li>
        </ul>

        <h3>Gains attendus</h3>
        <p>Le Stage 2 permet généralement des gains de 30 à 40% par rapport à l'origine.</p>

        <h2>Le Stage 3 : Préparation ultime</h2>
        <h3>Modifications techniques</h3>
        <ul>
          <li>Turbo hybride ou haute performance</li>
          <li>Injection renforcée</li>
          <li>Pompe à essence haute pression</li>
          <li>Embrayage renforcé</li>
        </ul>

        <h2>Considérations importantes</h2>
        <p>Ces préparations nécessitent une étude approfondie de votre projet et une réalisation par des professionnels qualifiés.</p>

        <h2>Notre expertise</h2>
        <p>Nous vous accompagnons dans toutes les étapes de votre projet performance, de la conception à la réalisation.</p>
      </article>
    `,
    image: "/blog/stage23.jpg",
    category: "Performance",
    readTime: "8 min",
    slug: "guide-stage-2-3",
    date: "2024-03-05",
    author: "Bouëxière Méca Perf",
    tags: ["stage2", "stage3", "performance", "préparation"]
  },
  {
    id: '4',
    title: "L'importance de l'entretien préventif",
    excerpt: "Découvrez pourquoi l'entretien préventif est crucial pour la longévité de votre véhicule et comment établir un programme d'entretien efficace.",
    content: `
      <article>
        <p>L'entretien préventif est la clé d'une voiture fiable et performante sur le long terme. Voici comment optimiser la durée de vie de votre véhicule.</p>

        <h2>Les points clés de l'entretien</h2>
        <ul>
          <li>Vidange moteur régulière</li>
          <li>Contrôle des filtres</li>
          <li>Vérification des freins</li>
          <li>Maintenance de la transmission</li>
        </ul>

        <h2>Fréquence des entretiens</h2>
        <p>La périodicité dépend de plusieurs facteurs :</p>
        <ul>
          <li>Kilométrage annuel</li>
          <li>Type d'utilisation</li>
          <li>Âge du véhicule</li>
          <li>Spécificités constructeur</li>
        </ul>

        <h2>Notre programme d'entretien</h2>
        <p>Nous proposons un suivi personnalisé avec des interventions adaptées à votre utilisation.</p>
      </article>
    `,
    image: "/blog/entretien.jpg",
    category: "Entretien",
    readTime: "6 min",
    slug: "importance-entretien-preventif",
    date: "2024-03-01",
    author: "Bouëxière Méca Perf",
    tags: ["entretien", "maintenance", "prévention"]
  },
  {
    id: '5',
    title: "Les dernières technologies en diagnostic",
    excerpt: "Exploration des technologies modernes de diagnostic automobile et comment elles révolutionnent la maintenance des véhicules.",
    content: `
      <article>
        <p>Le diagnostic automobile a considérablement évolué ces dernières années. Découvrez les dernières innovations technologiques dans ce domaine.</p>

        <h2>Technologies modernes</h2>
        <ul>
          <li>Diagnostic multimarque avancé</li>
          <li>Analyse en temps réel</li>
          <li>Connexion bluetooth</li>
          <li>Cartographie des défauts</li>
        </ul>

        <h2>Avantages</h2>
        <p>Ces nouvelles technologies permettent :</p>
        <ul>
          <li>Diagnostic plus précis</li>
          <li>Intervention plus rapide</li>
          <li>Prévention des pannes</li>
          <li>Suivi détaillé</li>
        </ul>
      </article>
    `,
    image: "/blog/tech-diag.jpg",
    category: "Technologie",
    readTime: "5 min",
    slug: "technologies-diagnostic-moderne",
    date: "2024-02-25",
    author: "Bouëxière Méca Perf",
    tags: ["diagnostic", "technologie", "innovation"]
  }
];

// Fonctions utilitaires pour le blog
export const getLatestPosts = (count: number = 3) => {
  return blogPosts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
};

export const getRelatedPosts = (currentPost: BlogPost, count: number = 3) => {
  return blogPosts
    .filter(post => post.id !== currentPost.id && post.category === currentPost.category)
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
};

export const getPostsByCategory = (category: string) => {
  if (category === 'all') return blogPosts;
  return blogPosts.filter(post => post.category.toLowerCase() === category.toLowerCase());
};

export const getPostBySlug = (slug: string) => {
  return blogPosts.find(post => post.slug === slug);
};

export const getAllTags = () => {
  const tags = new Set<string>();
  blogPosts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
  return Array.from(tags);
};