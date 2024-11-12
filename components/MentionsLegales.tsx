// components/MentionsLegales.tsx
'use client';

import Navigation from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';

export default function MentionsLegales() {
  return (
    <>
      <Navigation />
      <div className="bg-black min-h-screen pt-24">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="text-red-600 uppercase tracking-wider text-sm font-semibold">
              INFORMATIONS LÉGALES
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
              Mentions Légales
            </h1>
          </motion.div>

          {/* Contenu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 text-white/90"
          >
            <section>
              <h2 className="text-2xl font-bold text-red-500 mb-4">1. Éditeur du site</h2>
              <p className="mb-4">
                Le site bouexiere-meca-perf.fr est édité par :
              </p>
              <ul className="list-none space-y-2">
                <li><strong className="text-white">Raison sociale :</strong> Bouëxière Méca Perf</li>
                <li><strong className="text-white">Statut :</strong> Micro-entreprise</li>
                <li><strong className="text-white">SIRET :</strong> [Votre numéro SIRET]</li>
                <li><strong className="text-white">Adresse :</strong> [Votre adresse]</li>
                <li><strong className="text-white">Email :</strong> contact@bouexiere-meca-perf.fr</li>
                <li><strong className="text-white">Téléphone :</strong> 06 61 86 55 43</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-red-500 mb-4">2. Hébergeur</h2>
              <p className="mb-4">
                Ce site est hébergé par :
              </p>
              <ul className="list-none space-y-2">
                <li><strong className="text-white">Société :</strong> HOSTINGER INTERNATIONAL LTD</li>
                <li><strong className="text-white">Adresse :</strong> 61 Lordou Vironos Street, 6023 Larnaca, Chypre</li>
                <li><strong className="text-white">Email :</strong> fr@hostinger.com</li>
                <li><strong className="text-white">Site web :</strong> www.hostinger.fr</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-red-500 mb-4">3. Propriété intellectuelle</h2>
              <p className="mb-4">
                L'ensemble du contenu de ce site (textes, images, vidéos, etc.) est protégé par les lois relatives à la propriété intellectuelle.
                Toute reproduction ou représentation, intégrale ou partielle, par quelque procédé que ce soit, est strictement interdite sans autorisation préalable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-red-500 mb-4">4. Protection des données personnelles</h2>
              <p className="mb-4">
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès,
                de rectification, d'effacement et de portabilité des données vous concernant.
              </p>
              <p className="mb-4">
                Les informations collectées sur ce site sont uniquement destinées à Bouëxière Méca Perf et ne sont en aucun cas cédées à des tiers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-red-500 mb-4">5. Cookies</h2>
              <p className="mb-4">
                Ce site utilise des cookies nécessaires à son bon fonctionnement. En naviguant sur ce site,
                vous acceptez l'utilisation de ces cookies qui peuvent être désactivés à tout moment dans les paramètres de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-red-500 mb-4">6. Responsabilité</h2>
              <p className="mb-4">
                Bouëxière Méca Perf s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site.
                Cependant, elle ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-red-500 mb-4">7. Droit applicable</h2>
              <p className="mb-4">
                Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-red-500 mb-4">8. Contact</h2>
              <p className="mb-4">
                Pour toute question relative à ces mentions légales ou au site en général,
                vous pouvez nous contacter à l'adresse suivante : contact@bouexiere-meca-perf.fr
              </p>
            </section>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}