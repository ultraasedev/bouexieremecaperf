// app/dashboard/quotes/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Quote } from '@/types/quote';
import { QuoteForm } from '@/components/quotes/QuoteForm';
import Loading from '@/components/shared/loading';

export default function EditQuotePage() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch(`/api/quotes/${params.id}`);
        if (!response.ok) throw new Error('Erreur lors du chargement du devis');
        const data = await response.json();
        setQuote(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchQuote();
    }
  }, [params.id]);

  if (isLoading) {
    return <Loading />;
  }

  if (!quote) {
    return <div>Devis non trouvé</div>;
  }

  return <QuoteForm initialData={quote} mode="edit" />;
}