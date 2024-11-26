// app/blog/layout.tsx
import { metadata } from './metadata';

export { metadata };

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen">
      {children}
    </section>
  );
}