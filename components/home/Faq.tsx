'use client';

import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems = [
    {
      question: "Comment fonctionne le service de mécanique itinérante ?",
      answer: "Notre service de mécanique itinérante vous permet de bénéficier d'interventions mécaniques directement à votre domicile ou sur votre lieu de travail. Après votre prise de rendez-vous, nous confirmons l'intervention sous 48h et nous nous déplaçons avec tout le matériel nécessaire pour effectuer les réparations."
    },
    {
      question: "Quelles sont vos prestations de reprogrammation moteur ?",
      answer: "Nous proposons différents stages de reprogrammation moteur pour optimiser les performances de votre véhicule :\n\nStage 1 :\n- Optimisation du calculateur d'origine\n- Augmentation de puissance jusqu'à 30%\n- Amélioration du couple moteur\n- 100% réversible\n\nStage 2 :\n- Reprogrammation avancée\n- Modifications mécaniques légères nécessaires\n- Gains de puissance importants\n- Optimisation du turbo et de l'injection\n\nStage 3 :\n- Reprogrammation performance maximale\n- Modifications mécaniques importantes\n- Gains de puissance significatifs\n- Pour les passionnés exigeants"
    },
    {
      question: "Quels types de prestations mécaniques proposez-vous ?",
      answer: "Nous proposons une gamme complète de services :\n- Diagnostic mécanique complet\n- Réparations mécaniques générales\n- Montage de pièces premium\n- Reprogrammation moteur (Stage 1, 2, 3)\n- Cartographie sur mesure\n- Installation de pièces performance"
    },
    {
      question: "Comment se déroule la prise de rendez-vous ?",
      answer: "La prise de rendez-vous se fait directement sur notre site. Vous sélectionnez le type de prestation souhaitée, renseignez les informations sur votre véhicule et choisissez un créneau disponible. Nous vous confirmons le rendez-vous sous 48h par email et SMS."
    },
    {
      question: "Quelles zones géographiques couvrez-vous ?",
      answer: "Nous intervenons dans toute la région de Dinan. Contactez-nous pour vérifier si votre localisation est dans notre zone d'intervention."
    },
    {
      question: "Comment sont calculés vos tarifs ?",
      answer: "Nos tarifs sont calculés en fonction du type d'intervention et du temps estimé. Pour la reprogrammation moteur, les tarifs varient selon le stage choisi et le modèle du véhicule. Pour toute intervention, nous vous fournissons un devis détaillé avant de commencer les travaux."
    },
    {
      question: "Quels moyens de paiement acceptez-vous ?",
      answer: "Nous acceptons plusieurs moyens de paiement sécurisés via notre plateforme Stripe : carte bancaire, virement bancaire. Des facilités de paiement peuvent être proposées selon les interventions."
    },
    {
      question: "La reprogrammation moteur annule-t-elle la garantie constructeur ?",
      answer: "La reprogrammation peut effectivement affecter la garantie constructeur. Nous vous conseillons au cas par cas et proposons des solutions réversibles si nécessaire. Pour le Stage 1, la reprogrammation est 100% réversible."
    },
    {
      question: "Que faire en cas d'urgence mécanique ?",
      answer: "En cas d'urgence, contactez-nous directement par téléphone. Nous ferons notre possible pour vous proposer un créneau rapide selon nos disponibilités."
    }
  ];

  return (
    <section className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* En-tête */}
        <div className="text-center mb-16">
          <span className="text-red-600 uppercase tracking-wider text-sm font-semibold">ASSISTANCE</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-16">
            VOS QUESTIONS<br />
            FRÉQUENTES
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <div 
              key={index}
              className="bg-[#111] rounded-lg overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-6 text-white hover:text-red-600 transition-colors duration-200"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-left">{item.question}</span>
                <ChevronDownIcon 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180 text-red-600' : ''
                  }`}
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-[800px]' : 'max-h-0'
                }`}
              >
                <div className="p-6 pt-0 text-gray-400 leading-relaxed">
                  {item.answer.split('\n').map((text, i) => (
                    <p key={i} className="mb-2">{text}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-center gap-4 mt-12">
          <button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-3 font-semibold">
            PRENDRE RENDEZ-VOUS
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white rounded-full px-8 py-3 font-semibold">
            NOUS CONTACTER
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;