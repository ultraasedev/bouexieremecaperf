// components/home/Blog.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { blogPosts } from '@/data/blog';

export function Blog() {
  const [currentPage, setCurrentPage] = useState(0);
  const postsPerPage = 4;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % (Math.ceil(blogPosts.length / postsPerPage)));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-red-600 uppercase tracking-wider text-sm font-semibold">BLOG</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-2">
            CONSEILS & ACTUALIT&Eacute;S
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {blogPosts.slice(currentPage * postsPerPage, (currentPage + 1) * postsPerPage).map((post) => (
            <motion.article
              key={post.id}
              className="bg-[#111] rounded-lg overflow-hidden group cursor-pointer"
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="relative h-48 w-full">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRightIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-red-600 text-sm">{post.readTime} de lecture</span>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2 group-hover:text-red-500 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>

        <div className="flex justify-center mt-8">
          {[...Array(Math.ceil(blogPosts.length / postsPerPage))].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`w-2 h-2 rounded-full mx-1 transition-all ${
                currentPage === idx ? 'w-8 bg-red-600' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link
            href="/blog"
            className="bg-white/10 hover:bg-white/20 text-white rounded-full px-8 py-3 font-semibold transition-colors"
          >
            VOIR TOUS LES ARTICLES
          </Link>
        </div>
      </div>
    </section>
  );
}
