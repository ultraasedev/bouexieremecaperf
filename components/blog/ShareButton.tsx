// components/blog/ShareButtons.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { 
  FacebookIcon, 
  TwitterIcon, 
  LinkedinIcon, 
  LinkIcon 
} from 'lucide-react';

interface ShareButtonsProps {
  post: {
    title: string;
    slug: string;
  };
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ post }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://bouexiere-meca-perf.fr/blog/${post.slug}`;
  const shareText = `${post.title} | Bouëxière Méca Perf`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const shareButtons = [
    {
      name: 'Facebook',
      icon: FacebookIcon,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:text-[#1877f2]'
    },
    {
      name: 'Twitter',
      icon: TwitterIcon,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      color: 'hover:text-[#1da1f2]'
    },
    {
      name: 'LinkedIn',
      icon: LinkedinIcon,
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
      color: 'hover:text-[#0077b5]'
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-2 font-semibold transition-colors flex items-center gap-2"
      >
        <ShareIcon className="h-5 w-5" />
        Partager
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 bottom-full mb-2 bg-[#111] border border-white/10 rounded-lg shadow-xl p-2 z-50 min-w-[200px]"
            >
              <div className="flex flex-col">
                {shareButtons.map((button) => (
                  <a
                    key={button.name}
                    href={button.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 px-4 py-2 text-white hover:bg-white/5 rounded-lg transition-colors ${button.color}`}
                  >
                    <button.icon className="h-5 w-5" />
                    {button.name}
                  </a>
                ))}

                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-3 px-4 py-2 text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-5 w-5 text-green-500" />
                      <span className="text-green-500">Copié !</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-5 w-5" />
                      Copier le lien
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareButtons;