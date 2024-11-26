import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Clock, 
  CalendarIcon, 
  CheckCircle, 
  Info, 
  Loader2,
  ChevronRight,
  Sun,
  Moon,
  AlertTriangle,
  XCircle,
  Edit
} from 'lucide-react';
import { fr } from 'date-fns/locale';
import { format, addMonths, startOfDay, isEqual } from 'date-fns';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
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

// Types
type PeriodType = 'morning' | 'afternoon' | 'evening';

interface TimeSlot {
  id: string;
  time: string;
  label: string;
  period: PeriodType;
}

interface Availability {
  timeSlots: string[];
  bookedSlots: string[];
}

// Constantes pour les créneaux horaires
const TIME_SLOTS: TimeSlot[] = [
  // Matin (9h-12h)
  { id: '1', time: '09:00', label: 'Début de matinée', period: 'morning' as PeriodType },
  { id: '2', time: '09:30', label: 'Début de matinée', period: 'morning' as PeriodType },
  { id: '3', time: '10:00', label: 'Milieu de matinée', period: 'morning' as PeriodType },
  { id: '4', time: '10:30', label: 'Milieu de matinée', period: 'morning' as PeriodType },
  { id: '5', time: '11:00', label: 'Fin de matinée', period: 'morning' as PeriodType },
  { id: '6', time: '11:30', label: 'Fin de matinée', period: 'morning' as PeriodType },
  
  // Après-midi (14h-17h30)
  { id: '7', time: '14:00', label: 'Début d\'après-midi', period: 'afternoon' as PeriodType },
  { id: '8', time: '14:30', label: 'Début d\'après-midi', period: 'afternoon' as PeriodType },
  { id: '9', time: '15:00', label: 'Milieu d\'après-midi', period: 'afternoon' as PeriodType },
  { id: '10', time: '15:30', label: 'Milieu d\'après-midi', period: 'afternoon' as PeriodType },
  { id: '11', time: '16:00', label: 'Fin d\'après-midi', period: 'afternoon' as PeriodType },
  { id: '12', time: '16:30', label: 'Fin d\'après-midi', period: 'afternoon' as PeriodType },
  { id: '13', time: '17:00', label: 'Fin d\'après-midi', period: 'afternoon' as PeriodType },
  { id: '14', time: '17:30', label: 'Fin d\'après-midi', period: 'afternoon' as PeriodType },
  
  // Soirée (18h-21h)
  { id: '15', time: '18:00', label: 'Début de soirée', period: 'evening' as PeriodType },
  { id: '16', time: '18:30', label: 'Début de soirée', period: 'evening' as PeriodType },
  { id: '17', time: '19:00', label: 'Milieu de soirée', period: 'evening' as PeriodType },
  { id: '18', time: '19:30', label: 'Milieu de soirée', period: 'evening' as PeriodType },
  { id: '19', time: '20:00', label: 'Fin de soirée', period: 'evening' as PeriodType },
  { id: '20', time: '20:30', label: 'Fin de soirée', period: 'evening' as PeriodType },
  { id: '21', time: '21:00', label: 'Fin de soirée', period: 'evening' as PeriodType }
];

// Composant pour un groupe de créneaux horaires
const TimeSlotGroup = ({
  title,
  icon,
  slots,
  selectedSlots,
  bookedSlots,
  onToggle,
  onEdit,
  disabled = false
}: {
  title: string;
  icon: React.ReactNode;
  slots: TimeSlot[];
  selectedSlots: string[];
  bookedSlots: string[];
  onToggle: (time: string) => void;
  onEdit: (time: string) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-2">
        {icon}
        <h3 className="text-white/70 text-sm font-medium">{title}</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedSlots.includes(slot.time);
          const isBooked = bookedSlots.includes(slot.time);
          
          return (
            <div
              key={slot.id}
              className={cn(
                "p-3 rounded-lg transition-all",
                isBooked && "bg-yellow-500/20 border-yellow-500/20",
                isSelected && !isBooked && "bg-red-500/20 border-red-500/20",
                !isSelected && !isBooked && "bg-white/5 border-white/10",
                (disabled || isBooked) && "opacity-50"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-white font-medium">{slot.time}</p>
                  {isBooked && (
                    <p className="text-xs text-yellow-500">Réservé</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isBooked && (
                    <button
                      onClick={() => onEdit(slot.time)}
                      className="p-1 hover:bg-white/10 rounded-md transition-colors"
                      title="Modifier le créneau"
                    >
                      <Edit className="h-4 w-4 text-yellow-500" />
                    </button>
                  )}
                  <Switch
                    checked={isSelected}
                    onCheckedChange={() => !disabled && onToggle(slot.time)}
                    disabled={disabled}
                    className={cn(
                      "data-[state=checked]:bg-red-500",
                      isBooked && "data-[state=checked]:bg-yellow-500"
                    )}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default function AvailabilitySettings() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [allAvailabilities, setAllAvailabilities] = useState<Record<string, Availability>>({});
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSlotToEdit, setSelectedSlotToEdit] = useState<string | null>(null);

  const maxDate = addMonths(new Date(), 2);

  // Charger toutes les disponibilités pour 2 mois
  const loadAllAvailabilities = async () => {
    try {
      const start = startOfDay(new Date());
      const end = maxDate;
      const response = await fetch(
        `/api/availability?start=${format(start, 'yyyy-MM-dd')}&end=${format(end, 'yyyy-MM-dd')}`
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des disponibilités');
      }

      const data = await response.json();
      setAllAvailabilities(data);
      
      // Définir les créneaux pour la date sélectionnée
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      if (data[formattedDate]) {
        setSelectedSlots(data[formattedDate].timeSlots || []);
        setBookedSlots(data[formattedDate].bookedSlots || []);
      } else {
        setSelectedSlots([]);
        setBookedSlots([]);
      }
    } catch (error) {
      toast.error("Impossible de charger les disponibilités", {
        description: "Une erreur est survenue lors du chargement des données."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllAvailabilities();
  }, []);

  useEffect(() => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const availability = allAvailabilities[formattedDate];
    
    if (availability) {
      setSelectedSlots(availability.timeSlots || []);
      setBookedSlots(availability.bookedSlots || []);
    } else {
      setSelectedSlots([]);
      setBookedSlots([]);
    }
  }, [selectedDate, allAvailabilities]);

  const handleSaveAvailability = async () => {
    try {
      setIsSaving(true);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx');

      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formattedDate,
          timeSlots: selectedSlots
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la sauvegarde');
      }

      toast.success('Disponibilités enregistrées', {
        description: `Les créneaux pour le ${format(selectedDate, 'dd MMMM yyyy', { locale: fr })} ont été mis à jour.`
      });
      
      setHasUnsavedChanges(false);
      await loadAllAvailabilities();

    } catch (error) {
      toast.error('Erreur lors de la sauvegarde', {
        description: error instanceof Error ? error.message : 'Veuillez réessayer'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAvailability = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/availability?date=${format(selectedDate, 'yyyy-MM-dd')}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      toast.success('Disponibilités supprimées', {
        description: `Les créneaux pour le ${format(selectedDate, 'dd MMMM yyyy', { locale: fr })} ont été supprimés.`
      });

      setSelectedSlots([]);
      await loadAllAvailabilities();

    } catch (error) {
      toast.error('Erreur lors de la suppression', {
        description: "Une erreur est survenue lors de la suppression des créneaux."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSlotToggle = (time: string) => {
    setSelectedSlots(prev => {
      const newSlots = prev.includes(time)
        ? prev.filter(s => s !== time)
        : [...prev, time].sort();
      
      setHasUnsavedChanges(true);
      return newSlots;
    });
  };

  const handleEditSlot = async (time: string) => {
    setSelectedSlotToEdit(time);
    setShowEditDialog(true);
  };

  const handleConfirmEdit = async () => {
    if (!selectedSlotToEdit) return;

    try {
      setIsSaving(true);
      
      // Retirer le créneau des créneaux réservés
      const updatedBookedSlots = bookedSlots.filter(slot => slot !== selectedSlotToEdit);
      setBookedSlots(updatedBookedSlots);

      // Retirer également le créneau des créneaux sélectionnés si présent
      const updatedSelectedSlots = selectedSlots.filter(slot => slot !== selectedSlotToEdit);
      setSelectedSlots(updatedSelectedSlots);

      // Mettre à jour en base de données
      await handleSaveAvailability();

      toast.success('Créneau modifié', {
        description: `Le créneau de ${selectedSlotToEdit} a été libéré`
      });

      setShowEditDialog(false);
      setSelectedSlotToEdit(null);
      
    } catch (error) {
      toast.error('Erreur lors de la modification', {
        description: "Une erreur est survenue lors de la modification du créneau."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // État de chargement
  if (isLoading) {
    return (
      <Card className="p-6 bg-black/40 backdrop-blur-sm border-white/10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            <p className="text-white/70">Chargement des disponibilités...</p>
          </div>
        </div>
      </Card>
    );
  }

  const morningSlots = TIME_SLOTS.filter(slot => slot.period === 'morning');
  const afternoonSlots = TIME_SLOTS.filter(slot => slot.period === 'afternoon');
  const eveningSlots = TIME_SLOTS.filter(slot => slot.period === 'evening');

  // Vérifier si la date a des créneaux réservés
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  const hasBookedSlots = bookedSlots.length > 0;

  return (
    <>
      <Card className="bg-black/40 backdrop-blur-sm border-white/10">
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Disponibilités</h2>
                <p className="text-sm text-white/60">Configuration sur 2 mois</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
              <CalendarIcon className="h-4 w-4 text-red-500" />
              <span className="text-white/80">
                {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </span>
            </div>
          </div>

          {hasUnsavedChanges && (
            <Alert className="border-yellow-500/20 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-200 text-sm">
                Vous avez des modifications non enregistrées
              </AlertDescription>
            </Alert>
          )}

          {hasBookedSlots && (
            <Alert className="border-orange-500/20 bg-orange-500/10">
              <Info className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-orange-200 text-sm">
                {`Cette journée contient ${bookedSlots.length} créneau${bookedSlots.length > 1 ? 'x' : ''} déjà réservé${bookedSlots.length > 1 ? 's' : ''}`}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6">
          {/* Calendrier */}
          <div className="bg-white/5 rounded-xl p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={fr}
              fromDate={startOfDay(new Date())}
              toDate={maxDate}
              className="text-white"
              modifiers={{
                booked: (date) => {
                  const formatted = format(date, 'yyyy-MM-dd');
                  return allAvailabilities[formatted]?.bookedSlots?.length > 0;
                },
                available: (date) => {
                  const formatted = format(date, 'yyyy-MM-dd');
                  return allAvailabilities[formatted]?.timeSlots?.length > 0;
                },
              }}
              modifiersClassNames={{
                booked: "bg-yellow-500/20 text-yellow-200",
                available: "bg-red-500/20 text-white",
              }}
              classNames={{
                head_cell: "text-white/60 font-medium",
                cell: "text-center text-white/90 relative p-0",
                day: "h-9 w-9 p-0 font-normal aria-selected:bg-red-500 hover:bg-white/10 rounded-lg",
                day_range_middle: "rounded-none",
                day_selected: "bg-red-500 text-white hover:bg-red-600 rounded-lg",
                day_today: "bg-white/5 text-white font-bold",
                day_outside: "text-white/30",
              }}
            />
          </div>

          {/* Créneaux horaires */}
          <div className="space-y-4">
            <Alert className="border-blue-500/20 bg-blue-500/10">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-200 text-sm">
                Configuration pour le {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </AlertDescription>
            </Alert>

            <ScrollArea className="h-[calc(100vh-24rem)] sm:h-[500px] bg-white/5 rounded-xl px-4">
              <div className="space-y-6 py-4">
                {/* Matin */}
                <TimeSlotGroup
                  title="Matin"
                  icon={<Sun className="h-4 w-4 text-yellow-500" />}
                  slots={morningSlots}
                  selectedSlots={selectedSlots}
                  bookedSlots={bookedSlots}
                  onToggle={handleSlotToggle}
                  onEdit={handleEditSlot}
                />

                <Separator className="bg-white/10" />

                {/* Après-midi */}
                <TimeSlotGroup
                  title="Après-midi"
                  icon={<Sun className="h-4 w-4 text-orange-500" />}
                  slots={afternoonSlots}
                  selectedSlots={selectedSlots}
                  bookedSlots={bookedSlots}
                  onToggle={handleSlotToggle}
                  onEdit={handleEditSlot}
                />

                <Separator className="bg-white/10" />

                {/* Soirée */}
                <TimeSlotGroup
                  title="Soirée"
                  icon={<Moon className="h-4 w-4 text-blue-500" />}
                  slots={eveningSlots}
                  selectedSlots={selectedSlots}
                  bookedSlots={bookedSlots}
                  onToggle={handleSlotToggle}
                  onEdit={handleEditSlot}
                />
              </div>
            </ScrollArea>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleDeleteAvailability}
                disabled={selectedSlots.length === 0 && bookedSlots.length === 0}
                className="border-red-500/10 hover:bg-red-500/5 w-full sm:w-auto order-2 sm:order-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Supprimer les créneaux
              </Button>
              <Button
                onClick={handleSaveAvailability}
                disabled={isSaving || !hasUnsavedChanges}
                className="bg-red-500 hover:bg-red-600 w-full sm:w-auto order-1 sm:order-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Dialog de confirmation pour la modification d'un créneau */}
      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifier le créneau</AlertDialogTitle>
            <AlertDialogDescription>
            Êtes-vous sûr de vouloir libérer le créneau de {selectedSlotToEdit} ?
              Cette action annulera la réservation existante.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmEdit}
              className="bg-red-500 hover:bg-red-600"
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}