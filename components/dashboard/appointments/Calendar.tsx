// components/dashboard/appointments/Calendar.tsx
'use client';

import { useEffect, useState } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppointmentData } from '@/types/appoitement';
import AppointmentModal from './AppointmentModal';
import { fr } from 'date-fns/locale';
import { format, startOfMonth, endOfMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  History
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

type StatusConfig = {
  [key: string]: {
    label: string;
    icon: typeof AlertCircle;
    color: string;
    bgColor: string;
    borderColor: string;
  };
};

const statusConfig: StatusConfig = {
  PENDING: {
    label: 'En attente',
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20'
  },
  CONFIRMED: {
    label: 'Confirmés',
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
  MODIFIED: {
    label: 'Modifiés',
    icon: History,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  CANCELLED: {
    label: 'Annulés',
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20'
  },
  COMPLETED: {
    label: 'Terminés',
    icon: Clock,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20'
  }
};

const StatusCard = ({ status, count }: { status: string; count: number }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${config.borderColor} ${config.bgColor}`}>
      <div className={`h-12 w-12 rounded-lg ${config.bgColor} flex items-center justify-center`}>
        <Icon className={`h-6 w-6 ${config.color}`} />
      </div>
      <div>
        <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
        <p className="text-2xl font-bold text-white">{count}</p>
      </div>
    </div>
  );
};

export default function Calendar({ selectedDate, onDateSelect }: CalendarProps) {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [currentMonth]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const response = await fetch(`/api/appointments/list?start=${start}&end=${end}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des rendez-vous');
      }

      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Impossible de charger les rendez-vous");
    } finally {
      setIsLoading(false);
    }
  };

  const stats = appointments.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getDayContent = (date: Date) => {
    const appsForDay = appointments.filter(app => 
      isSameDay(new Date(app.requestedDate), date)
    );

    const isCurrentDay = isToday(date);

    return (
      <div className="relative h-14 w-full flex flex-col items-center">
        <div
          className={`
            relative w-10 h-10 flex items-center justify-center rounded-full
            ${isCurrentDay ? 'bg-red-500 text-white' : 'text-white hover:bg-white/5'}
            ${appsForDay.length > 0 ? 'font-semibold' : ''}
          `}
        >
          {format(date, 'd')}
        </div>
        {appsForDay.length > 0 && (
          <div className="absolute bottom-0 flex gap-0.5 justify-center">
            {appsForDay.slice(0, 3).map((app) => (
              <div
                key={app.id}
                className={`
                  h-1.5 w-1.5 rounded-full
                  ${statusConfig[app.status].bgColor.replace('/10', '')}
                `}
                title={`${app.client.firstName} ${app.client.lastName} - ${format(new Date(app.requestedDate), 'HH:mm')}`}
              />
            ))}
            {appsForDay.length > 3 && (
              <div 
                className="h-1.5 w-1.5 rounded-full bg-white/50"
                title={`+${appsForDay.length - 3} autres rendez-vous`}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  const handleDayClick = (date: Date) => {
    onDateSelect(date);
    const appsForDay = appointments.filter(app => 
      isSameDay(new Date(app.requestedDate), date)
    );
    if (appsForDay.length === 1) {
      setSelectedAppointment(appsForDay[0]);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
            <CalendarIcon className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Calendrier des rendez-vous</h2>
            <p className="text-sm text-white/60">Gérez vos rendez-vous du mois</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="hover:bg-white/5"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-white/80 min-w-[150px] text-center font-medium">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="hover:bg-white/5"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(statusConfig).map(([status, _]) => (
          <StatusCard 
            key={status} 
            status={status} 
            count={stats[status] || 0} 
          />
        ))}
      </div>

      {/* Calendrier */}
      <Card className="p-6 bg-black/40 backdrop-blur border-white/10">
        <ScrollArea className="h-full rounded-md">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && handleDayClick(date)}
            locale={fr}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="w-full"
            classNames={{
              months: "w-full",
              month: "w-full space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium text-white",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent hover:bg-white/5 rounded-full",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "grid grid-cols-7",
              head_cell: "w-full text-white/60 rounded-md w-14 font-normal text-[0.8rem] uppercase text-center",
              row: "grid grid-cols-7 mt-2",
              cell: "w-full text-center text-sm relative p-0 focus-within:relative focus-within:z-20",
              day: "w-14 h-14 p-0 relative [&:has([aria-selected])]:bg-red-500/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:z-20",
              day_selected: "bg-red-500 text-white hover:bg-red-500/90 focus:bg-red-500",
              day_today: "bg-white/5 text-white",
              day_outside: "text-white/30 opacity-50",
              day_disabled: "text-white/20",
              day_range_middle: "aria-selected:bg-white/5",
              day_hidden: "invisible",
            }}
            components={{
              DayContent: ({ date }) => getDayContent(date),
            }}
          />
        </ScrollArea>
      </Card>

      {selectedAppointment && (
        <AppointmentModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          appointment={selectedAppointment}
          onUpdate={fetchAppointments}
        />
      )}
    </div>
  );
}