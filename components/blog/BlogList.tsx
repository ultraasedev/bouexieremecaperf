// components/blog/BlogList.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import BlogCard from './BlogCard';
import CategoryFilter from './CategoryFilter';
import { blogPosts, categories } from '@/data/blog';
import Navigation from '../layout/Navigation';
import { Footer } from '../layout/Footer';

export default function BlogList() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredPosts = selectedCategory === 'all'
    ? blogPosts
    : blogPosts.filter(post => post.category.toLowerCase() === selectedCategory);

  return (
    <>
    <Navigation/>
    <div className="bg-black min-h-screen pt-24">
      <section className="pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="text-red-600 uppercase tracking-wider text-sm font-semibold">
              BLOG
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
              ARTICLES & ACTUALITÉS
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Découvrez nos derniers articles sur la mécanique automobile,
              la performance et les conseils d'entretien.
            </p>
          </motion.div>

          {/* Filtres */}
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Liste d'articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          {/* Message si aucun article */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">
                Aucun article trouvé dans cette catégorie.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
    <Footer/>
    </>
  );
}