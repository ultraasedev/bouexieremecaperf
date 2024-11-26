// app/dashboard/reviews/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { StarIcon, TrashIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import type { Testimonial } from "@/types/testimonial";
import Image from 'next/image';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);

  // Charger les avis
  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      if (!response.ok) throw new Error('Erreur lors du chargement des avis');
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les avis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Supprimer un avis
  const handleDeleteReview = async () => {
    if (!deleteReviewId) return;

    try {
      const response = await fetch(`/api/reviews/${deleteReviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      setReviews(reviews.filter(review => review.id !== deleteReviewId));
      toast({
        title: "Succès",
        description: "L'avis a été supprimé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'avis",
        variant: "destructive",
      });
    }
    setDeleteReviewId(null);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Gestion des avis clients</h1>
        <div className="text-sm text-muted-foreground">
          {reviews.length} avis au total
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative rounded-full overflow-hidden">
                  <Image
                    src={review.image}
                    alt={review.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">
                    {review.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {review.location}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700 hover:bg-red-100"
                onClick={() => setDeleteReviewId(review.id)}
              >
                <TrashIcon className="h-5 w-5" />
              </Button>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(review.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {review.text}
              </p>
              <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
                <span>{review.service}</span>
                <span>
                  {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={!!deleteReviewId}
        onOpenChange={() => setDeleteReviewId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Êtes-vous sûr de vouloir supprimer cet avis ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'avis sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}