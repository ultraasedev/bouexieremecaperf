// components/dashboard/appointments/AppointmentsList.tsx
'use client';

import { useEffect, useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AppointmentData } from '@/types/appoitement';
import AppointmentModal from './AppointmentModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format as formatDate, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AppointmentsListProps {
  selectedDate: Date;
}

const statusOptions = {
  ALL: 'Tous les statuts',
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  CANCELLED: 'Annulé',
  MODIFIED: 'Modifié',
  COMPLETED: 'Terminé'
};

const getStatusBadge = (status: string) => {
  const variants = {
    PENDING: { color: 'bg-yellow-500', text: 'En attente' },
    CONFIRMED: { color: 'bg-green-500', text: 'Confirmé' },
    CANCELLED: { color: 'bg-red-500', text: 'Annulé' },
    MODIFIED: { color: 'bg-blue-500', text: 'Modifié' },
    COMPLETED: { color: 'bg-gray-500', text: 'Terminé' }
  };

  const statusInfo = variants[status as keyof typeof variants] || variants.PENDING;

  return (
    <Badge className={`${statusInfo.color} text-white`}>
      {statusInfo.text}
    </Badge>
  );
};

export default function AppointmentsList({ selectedDate }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentData[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  useEffect(() => {
    filterAppointments();
  }, [searchTerm, statusFilter, appointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const month = format(selectedDate, 'yyyy-MM');
      const response = await fetch('/api/appointments/list');
      if (!response.ok) throw new Error('Erreur lors de la récupération des données');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (searchTerm) {
      filtered = filtered.filter(app => 
        `${app.client.firstName} ${app.client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${app.vehicle.brand} ${app.vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  };

  const handleRowClick = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  return (
    <Card className="p-6 bg-black/40 backdrop-blur border-white/10">
      <div className="space-y-6">
        {/* En-tête avec filtres */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-semibold text-white">
              Rendez-vous du mois
            </h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                className="pl-10 bg-white/5 border-white/10 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusOptions).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tableau des rendez-vous */}
        <ScrollArea className="h-[calc(100vh-15rem)] rounded-md border border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/5">
                <TableHead className="text-white font-semibold">Date</TableHead>
                <TableHead className="text-white font-semibold">Client</TableHead>
                <TableHead className="text-white font-semibold">Service</TableHead>
                <TableHead className="text-white font-semibold hidden md:table-cell">Véhicule</TableHead>
                <TableHead className="text-white font-semibold">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-white/60 py-8">
                    Chargement des rendez-vous...
                  </TableCell>
                </TableRow>
              ) : filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-white/60 py-8">
                    Aucun rendez-vous trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment) => (
                  <TableRow
                    key={appointment.id}
                    className="cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => handleRowClick(appointment)}
                  >
                    <TableCell className="text-white/90 font-medium">
                      {format(new Date(appointment.requestedDate), 'Pp', { locale: fr })}
                    </TableCell>
                    <TableCell className="text-white/90">
                      {appointment.client.firstName} {appointment.client.lastName}
                    </TableCell>
                    <TableCell className="text-white/90">
                      {appointment.service}
                    </TableCell>
                    <TableCell className="text-white/90 hidden md:table-cell">
                      {appointment.vehicle.brand} {appointment.vehicle.model} ({appointment.vehicle.year})
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(appointment.status)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {selectedAppointment && (
        <AppointmentModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          appointment={selectedAppointment}
          onUpdate={fetchAppointments}
        />
      )}
    </Card>
  );
}