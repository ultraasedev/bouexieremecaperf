// components/blog/BlogPost.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import ShareButtons from './ShareButton';

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-invert prose-red max-w-none
              prose-h1:text-red-500 prose-h2:text-red-500 prose-h3:text-red-500 
              prose-p:text-white/90 prose-strong:text-white
              prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl"
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