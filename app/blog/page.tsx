// app/blog/page.tsx
'use client';

import BlogList from '@/components/blog/BlogList';
import { Suspense } from 'react';
import Loading from '@/components/shared/loading';

export default function BlogPage() {
  return (
    <Suspense fallback={<Loading />}>
      <BlogList />
    </Suspense>
  );
}