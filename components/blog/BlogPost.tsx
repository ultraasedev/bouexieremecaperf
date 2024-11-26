// components/blog/BlogPost.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import ShareButtons from './ShareButton';
import { useEffect, useRef } from 'react';

interface BlogPost {
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

interface BlogPostProps {
  post: BlogPost;
}

export default function BlogPost({ post }: BlogPostProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Sélectionner et styler les éléments du contenu
      const content = contentRef.current;

      // Styler l'article parent
      const articles = content.getElementsByTagName('article');
      for (const article of articles) {
        article.classList.add('text-white');
      }

      // Styler les titres h2
      const h2s = content.getElementsByTagName('h2');
      for (const h2 of h2s) {
        h2.classList.add('text-red-500', 'text-2xl', 'font-bold', 'mt-8', 'mb-4');
      }

      // Styler les paragraphes
      const paragraphs = content.getElementsByTagName('p');
      for (const p of paragraphs) {
        p.classList.add('mb-4', 'text-white/90');
      }

      // Styler les listes
      const uls = content.getElementsByTagName('ul');
      for (const ul of uls) {
        ul.classList.add('list-disc', 'list-inside', 'mb-4', 'space-y-2', 'text-white/90');
      }

      // Styler les éléments de liste
      const lis = content.getElementsByTagName('li');
      for (const li of lis) {
        li.classList.add('text-white/90');
      }

      // Styler les titres h3
      const h3s = content.getElementsByTagName('h3');
      for (const h3 of h3s) {
        h3.classList.add('text-white', 'text-xl', 'font-bold', 'mt-6', 'mb-3');
      }
    }
  }, [post.content]);

  return (
    <>
      <Navigation />
      <article className="bg-black min-h-screen pt-24">
        {/* Hero de l'article */}
        <div className="relative h-[60vh] min-h-[400px]">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto px-4 pb-12 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="bg-red-600 text-white text-sm px-4 py-1 rounded-full">
                  {post.category}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
                  {post.title}
                </h1>
                <div className="flex items-center gap-4 text-gray-300">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </time>
                  <span>•</span>
                  <span>{post.readTime} de lecture</span>
                  <span>•</span>
                  <span>Par {post.author}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Contenu de l'article */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          {/* Tags */}
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-white/10 text-white text-sm px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Navigation et partage */}
          <div className="mt-12 flex justify-between items-center">
            <Link
              href="/blog"
              className="bg-white/10 hover:bg-white/20 text-white rounded-full px-6 py-2 font-semibold transition-colors"
            >
              ← Retour aux articles
            </Link>
            <ShareButtons post={post} />
          </div>
        </div>
      </article>
      <Footer />
    </>
  );
}