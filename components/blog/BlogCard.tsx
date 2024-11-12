'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
// components/blog/BlogCard.tsx
interface BlogCardProps {
    post: {
      id: string;
      title: string;
      excerpt: string;
      image: string;
      category: string;
      readTime: string;
      slug: string;
      date: string;
    };
  }
  
  export default function BlogCard({ post }: BlogCardProps) {
    return (
      <motion.article
        className="bg-[#111] rounded-lg overflow-hidden group cursor-pointer"
        whileHover={{ y: -10 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href={`/blog/${post.slug}`}>
          <div className="relative h-56 w-full">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
              <time dateTime={post.date} className="text-gray-400 text-sm">
                {new Date(post.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </time>
            </div>
            <h2 className="text-white text-xl font-bold mb-2 group-hover:text-red-500 transition-colors">
              {post.title}
            </h2>
            <p className="text-gray-400 text-sm line-clamp-2">
              {post.excerpt}
            </p>
          </div>
        </Link>
      </motion.article>
    );
  }