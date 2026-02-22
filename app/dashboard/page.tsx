// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Euro, Users, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DashboardStats {
  stats: {
    revenue: number;
    revenueMonth: number;
    clients: number;
    appointmentsWeek: number;
    pendingQuotes: number;
  };
  recentAppointments: Array<{
    id: string;
    clientName: string;
    service: string;
    date: string;
    status: string;
  }>;
  recentQuotes: Array<{
    id: string;
    number: string;
    clientName: string;
    totalTTC: number;
    status: string;
    date: string;
  }>;
  monthlyRevenue: Array<{ name: string; value: number }>;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);

export default function Dashboard(): JSX.Element {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  const stats = data?.stats || { revenue: 0, revenueMonth: 0, clients: 0, appointmentsWeek: 0, pendingQuotes: 0 };
  const monthlyRevenue = data?.monthlyRevenue || [];
  const recentAppointments = data?.recentAppointments || [];
  const recentQuotes = data?.recentQuotes || [];

  return (
    <div className="space-y-6 p-6">
      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#2B2B2B] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Chiffre d&apos;affaires</p>
                <h3 className="text-2xl font-bold text-white mt-2">{formatPrice(stats.revenue)}</h3>
                <p className="text-sm text-green-500 mt-1">{formatPrice(stats.revenueMonth)} ce mois</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Euro className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2B2B2B] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Clients</p>
                <h3 className="text-2xl font-bold text-white mt-2">{stats.clients}</h3>
                <p className="text-sm text-blue-500 mt-1">Total inscrits</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2B2B2B] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Rendez-vous</p>
                <h3 className="text-2xl font-bold text-white mt-2">{stats.appointmentsWeek}</h3>
                <p className="text-sm text-purple-500 mt-1">Cette semaine</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2B2B2B] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Devis en attente</p>
                <h3 className="text-2xl font-bold text-white mt-2">{stats.pendingQuotes}</h3>
                <p className="text-sm text-yellow-500 mt-1">À traiter</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique revenus mensuels */}
      <Card className="bg-[#2B2B2B] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Chiffre d&apos;affaires mensuel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] mt-4">
            {monthlyRevenue.some(m => m.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenue}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}
                    tickFormatter={(value) => `${value}€`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1C1C1C', border: 'none', borderRadius: '8px', color: '#fff' }}
                    formatter={(value: number) => [`${value.toFixed(2)} €`, 'CA']}
                  />
                  <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Aucune donnée de revenus pour le moment
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dernières activités */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="bg-[#2B2B2B] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Prochains rendez-vous</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.length > 0 ? (
                recentAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-black/40 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{apt.clientName}</p>
                      <p className="text-sm text-gray-400">{apt.service}</p>
                    </div>
                    <p className="text-sm text-gray-400">
                      {format(new Date(apt.date), 'dd/MM HH:mm', { locale: fr })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun rendez-vous à venir</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2B2B2B] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Derniers devis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuotes.length > 0 ? (
                recentQuotes.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-4 bg-black/40 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{quote.number}</p>
                      <p className="text-sm text-gray-400">{quote.clientName}</p>
                    </div>
                    <p className="text-sm text-green-500">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(quote.totalTTC)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun devis récent</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
