// components/rdv/RendezVous.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import ContactForm from "./ContactForm";
import VehicleForm from "./VehicleForm";
import ServiceForm from "./ServiceForm";
import DateTimeForm from "./DateTimeForm";
import ConfirmationStep from "./ConfirmationStep";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

type FormData = {
  // Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string; // Ajout du champ adresse
  // Informations véhicule
  brand: string;
  model: string;
  year: string;
  trim: string;
  // Service
  serviceType: "diagnostic" | "mecanique" | "pieces-premium" | "reprog";
  description: string;
  // Date et heure
  date: string;
  time: string;
};

const steps = [
  { id: 1, name: "Contact", description: "Vos informations" },
  { id: 2, name: "Véhicule", description: "Détails du véhicule" },
  { id: 3, name: "Service", description: "Type d'intervention" },
  { id: 4, name: "Date & Heure", description: "Choix du créneau" },
  { id: 5, name: "Confirmation", description: "Validation finale" },
];

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  brand: "",
  model: "",
  year: "",
  trim: "",
  serviceType: "diagnostic",
  description: "",
  date: "",
  time: "",
};

export default function RendezVous() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const router = useRouter();
  const { toast } = useToast();

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
    // Scroll to top on step change
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
    // Scroll to top on step change
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleComplete = () => {
    // Réinitialiser le formulaire
    setFormData(initialFormData);
    setCurrentStep(1);

    // Redirection vers la page d'accueil avec un délai
    setTimeout(() => {
      router.push("/");
    }, 3000);
  };

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

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
              RÉSERVATION
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
              Prendre Rendez-vous
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Réservez votre créneau en quelques étapes simples. Nous vous
              confirmerons votre rendez-vous sous 48h.
            </p>
          </motion.div>

          {/* Progression */}
          <div className="mb-12">
            <div className="relative">
              {/* Ligne de progression */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-700">
                <div
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{
                    width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Points et labels */}
              <div className="relative flex justify-between">
                {steps.map((step) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors duration-200 z-10 
                        ${step.id <= currentStep ? "bg-red-600" : "bg-gray-700"}`}
                    >
                      <span className="text-white text-sm font-medium">
                        {step.id}
                      </span>
                    </div>
                    <span
                      className={`text-sm transition-colors duration-200 whitespace-nowrap
                        ${step.id <= currentStep ? "text-white" : "text-gray-500"}`}
                    >
                      {step.name}
                    </span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {step.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111] rounded-lg p-8"
          >
            {currentStep === 1 && (
              <ContactForm
                data={formData}
                updateData={updateFormData}
                onNext={handleNext}
              />
            )}
            {currentStep === 2 && (
              <VehicleForm
                data={formData}
                updateData={updateFormData}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            )}
            {currentStep === 3 && (
              <ServiceForm
                data={formData}
                updateData={updateFormData}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            )}
            {currentStep === 4 && (
              <DateTimeForm
                data={formData}
                updateData={updateFormData}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            )}
            {currentStep === 5 && (
              <ConfirmationStep 
                data={formData}
                onPrevious={handlePrevious}
                onComplete={handleComplete}
              />
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}