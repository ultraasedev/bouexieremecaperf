// app/dashboard/appointments/page.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Calendar from "@/components/dashboard/appointments/Calendar";
import AppointmentsList from "@/components/dashboard/appointments/AppointmentsList";
import AvailabilitySettings from "@/components/dashboard/appointments/AvailabilitySettings";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const formattedMonth = format(selectedDate, 'MMMM yyyy', { locale: fr });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Gestion des Rendez-vous</h1>
        <div className="text-lg text-gray-300">{formattedMonth}</div>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="availability">Disponibilités</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <Calendar 
            selectedDate={selectedDate} 
            onDateSelect={setSelectedDate} 
          />
        </TabsContent>

        <TabsContent value="list">
          <AppointmentsList selectedDate={selectedDate} />
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilitySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}