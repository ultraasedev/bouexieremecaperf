// src/components/home/Hero.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const slides = [
  {
    image: '/hero-1.jpg',
    title: 'Mécanique Premium',
    description: 'Excellence et précision pour votre véhicule',
  },
  {
    image: '/hero-2.jpg',
    title: 'Performance & Reprogrammation',
    description: 'Optimisation sur mesure pour votre moteur',
  },
  {
    image: '/hero-3.jpg',
    title: 'Service Itinérant',
    description: 'L\'expertise automobile à votre porte',
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: { opacity: 0, scale: 1.1 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <motion.div
          key={index}
          className={`absolute inset-0 ${
            currentSlide === index ? 'z-10' : 'z-0'
          }`}
          initial="enter"
          animate={currentSlide === index ? 'center' : 'exit'}
          variants={slideVariants}
          transition={{ duration: 0.8 }}
        >
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{
              backgroundImage: `url(${slide.image})`,
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-20 h-full flex items-center justify-center text-center px-4">
        <div className="max-w-5xl">
          <motion.h1
            key={`title-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6"
          >
            {slides[currentSlide].title}
          </motion.h1>
          <motion.p
            key={`desc-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl sm:text-2xl text-gray-200 mb-8"
          >
            {slides[currentSlide].description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-red-600 px-8 py-3 text-lg font-semibold text-white shadow-lg hover:bg-red-500 transition-colors"
            >
              Prendre RDV
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-white/10 backdrop-blur-sm px-8 py-3 text-lg font-semibold text-white shadow-lg hover:bg-white/20 transition-colors"
            >
              Nos Services
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSlide === index ? 'w-8 bg-red-600' : 'bg-white/50'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}