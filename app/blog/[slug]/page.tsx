// app/blog/[slug]/page.tsx
import { generateArticleMetadata } from '../metadata';
import { notFound } from 'next/navigation';
import BlogPost from '@/components/blog/BlogPost';
import { blogPosts } from '@/data/blog';

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const post = blogPosts.find(post => post.slug === params.slug);
  
  if (!post) {
    return {
      title: 'Article non trouvé | Bouëxière Méca Perf',
    };
  }

  return generateArticleMetadata(
    post.title,
    post.excerpt,
    post.image,
    post.date
  );
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPostPage({ params }: Props) {
  const post = blogPosts.find(post => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return <BlogPost post={post} />;
}