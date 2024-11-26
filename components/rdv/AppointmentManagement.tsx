// components/rdv/AppointmentManagement.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react';
import { AppointmentData } from '@/types/appoitement';

interface AppointmentManagementProps {
  appointment: AppointmentData;
}

const availableTimeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

export default function AppointmentManagement({ appointment }: AppointmentManagementProps) {
  const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(appointment.requestedDate));
  const [selectedTime, setSelectedTime] = useState(format(appointment.requestedDate, 'HH:mm'));
  const { toast } = useToast();
  const router = useRouter();

  const handleModifyAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date et une heure",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestedDate: new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}`),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification du rendez-vous');
      }

      toast({
        title: "Rendez-vous modifié",
        description: "Votre demande de modification a bien été prise en compte. Vous recevrez une confirmation par email.",
      });

      setIsModifyDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rendez-vous. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/appointments/${appointment.id}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'annulation du rendez-vous');
      }

      toast({
        title: "Rendez-vous annulé",
        description: "Votre rendez-vous a bien été annulé. Un email de confirmation vous sera envoyé.",
      });

      setIsCancelDialogOpen(false);
      router.push('/');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler le rendez-vous. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gray-900 rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-white mb-6">Gérer votre rendez-vous</h1>

          {/* Détails du rendez-vous */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Détails du rendez-vous</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 text-sm">Date et heure</p>
                  <p className="text-white">
                    {format(appointment.requestedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                    <br />
                    {format(appointment.requestedDate, 'HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Service demandé</p>
                  <p className="text-white">{appointment.service}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Véhicule</p>
                  <p className="text-white">
                    {appointment.vehicle.brand} {appointment.vehicle.model} ({appointment.vehicle.year})
                  </p>
                </div>
                {appointment.description && (
                  <div className="col-span-2">
                    <p className="text-gray-400 text-sm">Description</p>
                    <p className="text-white">{appointment.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="flex-1"
                onClick={() => setIsModifyDialogOpen(true)}
                disabled={appointment.status === 'CANCELLED'}
              >
                <Clock className="w-4 h-4 mr-2" />
                Modifier l'horaire
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setIsCancelDialogOpen(true)}
                disabled={appointment.status === 'CANCELLED'}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Annuler le rendez-vous
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de modification */}
      <Dialog open={isModifyDialogOpen} onOpenChange={setIsModifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'horaire</DialogTitle>
            <DialogDescription>
              Choisissez une nouvelle date et un nouveau créneau horaire pour votre rendez-vous.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={fr}
              disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
              className="rounded-md border"
            />

            <div className="grid grid-cols-4 gap-2">
              {availableTimeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => setSelectedTime(time)}
                  className="text-sm"
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModifyDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleModifyAppointment} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                'Confirmer la modification'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'annulation */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler le rendez-vous</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Retour
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Annulation...
                </>
              ) : (
                'Confirmer l\'annulation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}