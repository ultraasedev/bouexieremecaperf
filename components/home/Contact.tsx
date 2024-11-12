// components/home/Contact.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: "contact" | "devis";
  service: string;
  message: string;
  vehicle?: {
    brand: string;
    model: string;
    year: string;
  };
};

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "contact",
    service: "",
    message: "",
    vehicle: {
      brand: "",
      model: "",
      year: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Ici, ajoutez la logique d'envoi du formulaire

    setIsSubmitting(false);
  };

  return (
    <section className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-red-600 uppercase tracking-wider text-sm font-semibold">
            CONTACT
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
            Contactez-nous
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Pour toute demande de devis ou d'information, n'hésitez pas à nous
            contacter. Nous vous répondrons dans les plus brefs délais.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Formulaire */}
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Sujet *
              </label>
              <select
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 [&>option]:text-black"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subject: e.target.value as "contact" | "devis",
                  })
                }
              >
                <option value="contact">Contact</option>
                <option value="devis">Demande de devis</option>
              </select>
            </div>

            {formData.subject === "devis" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Marque du véhicule *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    value={formData.vehicle?.brand}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vehicle: {
                          ...formData.vehicle!,
                          brand: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                {/* Ajoutez les champs modèle et année similairement */}
              </div>
            )}

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Message *
              </label>
              <textarea
                required
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full py-3 font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Envoi en cours..." : "Envoyer"}
            </button>
          </motion.form>

          {/* Informations de contact */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Coordonnées</h3>
              <div className="space-y-4 text-gray-400">
                <p>📍 Dinan et ses environs</p>
                <p>📱 06 61 86 55 43</p>
                <p>✉️ contact@bouexiere-meca-perf.fr</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Horaires</h3>
              <div className="space-y-2 text-gray-400">
                <p>Lundi - Vendredi : 9h - 19h</p>
                <p>Samedi : Sur rendez-vous</p>
                <p>Dimanche : Fermé</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
