// components/home/Testimonials.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StarIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import Image from "next/image";
import { ReviewModal } from "@/components/ui/ReviewModal";
import type { Testimonial } from "@/types/testimonial";
import { generateGravatar } from "@/lib/gravatar";

export function Testimonials() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews");
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Animation pour le défilement
  useEffect(() => {
    const interval = setInterval(() => {
      setReviews((prev) => {
        const topRow = prev.slice(0, 3);
        const bottomRow = prev.slice(3);
        const firstTop = topRow.shift();
        const lastBottom = bottomRow.pop();

        if (firstTop && lastBottom) {
          return [...topRow, lastBottom, ...bottomRow, firstTop];
        }
        return prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-4">
        <span className="text-red-600 uppercase tracking-wider text-sm font-semibold">
          TÉMOIGNAGES
        </span>
        <div className="flex justify-between items-start mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-2">
            CE QUE NOS CLIENTS
            <br />
            DISENT DE NOUS
          </h2>
          <div className="hidden md:flex gap-4">
            <Link
              href="/rdv"
              className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-3 font-semibold transition-colors"
            >
              PRENDRE RENDEZ-VOUS →
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white rounded-full px-8 py-3 font-semibold transition-colors"
            >
              PUBLIER UN AVIS
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#111] p-8 rounded-lg animate-pulse">
                <div className="h-40 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="bg-[#111] p-8 rounded-lg"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 relative rounded-full overflow-hidden">
                      <Image
                        src={generateGravatar(review.name)}
                        alt={review.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{review.name}</h3>
                      <p className="text-gray-400 text-sm">{review.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-red-600" />
                    ))}
                  </div>
                  <p className="text-gray-400 leading-relaxed">{review.text}</p>
                  <p className="text-sm text-gray-500 mt-4">{review.service}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-8 md:hidden">
          <Link
            href="/rdv"
            className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-3 font-semibold transition-colors text-sm"
          >
            PRENDRE RENDEZ-VOUS →
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full px-6 py-3 font-semibold transition-colors text-sm"
          >
            PUBLIER UN AVIS
          </button>
        </div>
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewAdded={() => fetchReviews()} // Rafraîchit la liste des avis
      />
    </section>
  );
}
