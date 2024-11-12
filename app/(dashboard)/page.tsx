// app/(dashboard)/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';

// Types
interface AppointmentData {
  id: string;
  date: string;
  clientName: string;
  service: string;
  vehicleBrand: string;
  vehicleModel: string;
  status: 'pending' | 'confirmed' | 'completed';
}

interface QuoteData {
  id: string;
  date: string;
  clientName: string;
  amount: number;
  service: string;
  status: 'pending' | 'accepted' | 'rejected';
  vehicleInfo: string;
}

// Exemple de données
const revenueData = [
  { name: 'Jan', value: 12500 },
  { name: 'Fév', value: 15800 },
  { name: 'Mar', value: 18200 },
  { name: 'Avr', value: 17500 },
  { name: 'Mai', value: 21000 },
  { name: 'Juin', value: 19800 },
];

const nextAppointments: AppointmentData[] = [
  {
    id: '1',
    date: '2024-03-20T10:00:00',
    clientName: 'Jean Martin',
    service: 'Reprogrammation Stage 1',
    vehicleBrand: 'Volkswagen',
    vehicleModel: 'Golf 7 GTI',
    status: 'confirmed'
  },
  {
    id: '2',
    date: '2024-03-21T14:30:00',
    clientName: 'Sophie Dubois',
    service: 'Diagnostic complet',
    vehicleBrand: 'BMW',
    vehicleModel: 'M340i',
    status: 'pending'
  },
  {
    id: '3',
    date: '2024-03-22T09:00:00',
    clientName: 'Pierre Durant',
    service: 'Installation pièces performance',
    vehicleBrand: 'Audi',
    vehicleModel: 'S3 8V',
    status: 'confirmed'
  }
];

const recentQuotes: QuoteData[] = [
  {
    id: '1',
    date: '2024-03-19',
    clientName: 'Thomas Bernard',
    amount: 850,
    service: 'Reprogrammation Stage 2',
    status: 'pending',
    vehicleInfo: 'Mercedes A45 AMG'
  },
  {
    id: '2',
    date: '2024-03-18',
    clientName: 'Julie Leroy',
    amount: 450,
    service: 'Reprogrammation Stage 1',
    status: 'accepted',
    vehicleInfo: 'VW Tiguan 2.0 TDI'
  },
  {
    id: '3',
    date: '2024-03-17',
    clientName: 'Marc Petit',
    amount: 1200,
    service: 'Package performance complet',
    status: 'pending',
    vehicleInfo: 'BMW M135i'
  }
];

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('3 Mois');

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-6"
        >
          <h3 className="text-emerald-500 text-sm font-semibold mb-2">RDV ce mois</h3>
          <div className="text-3xl font-bold text-white">24</div>
          <div className="text-emerald-500 text-sm mt-1">+15% vs mois dernier</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-red-500/20 border border-red-500/30 rounded-lg p-6"
        >
          <h3 className="text-red-500 text-sm font-semibold mb-2">Devis en attente</h3>
          <div className="text-3xl font-bold text-white">8</div>
          <div className="text-red-500 text-sm mt-1">Valeur: 6 450€</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-6"
        >
          <h3 className="text-blue-500 text-sm font-semibold mb-2">CA du mois</h3>
          <div className="text-3xl font-bold text-white">21 000€</div>
          <div className="text-blue-500 text-sm mt-1">+8% vs mois dernier</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-6"
        >
          <h3 className="text-purple-500 text-sm font-semibold mb-2">Taux conversion</h3>
          <div className="text-3xl font-bold text-white">82%</div>
          <div className="text-purple-500 text-sm mt-1">+5% vs mois dernier</div>
        </motion.div>
      </div>

      {/* Graphique CA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1a1a1a] rounded-lg p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-semibold">Évolution du CA</h2>
          <div className="flex gap-2">
            {['1 An', '6 Mois', '3 Mois'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-full text-sm ${
                  timeRange === range
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => [`${value}€`, 'CA']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#dc2626"
                fillOpacity={1}
                fill="url(#revenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* RDV et Devis récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1a1a1a] rounded-lg p-6"
        >
          <h2 className="text-white font-semibold mb-4">Prochains rendez-vous</h2>
          <div className="space-y-4">
            {nextAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-black/50 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{appointment.clientName}</p>
                  <p className="text-sm text-gray-400">{appointment.vehicleBrand} {appointment.vehicleModel}</p>
                  <p className="text-sm text-gray-400">{appointment.service}</p>
                </div>
                <div className="text-right">
                  <p className="text-white">
                    {format(new Date(appointment.date), 'dd MMM yyyy', { locale: fr })}
                  </p>
                  <p className="text-sm text-gray-400">
                    {format(new Date(appointment.date), 'HH:mm')}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    appointment.status === 'confirmed' 
                      ? 'bg-emerald-500/20 text-emerald-500' 
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {appointment.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1a1a1a] rounded-lg p-6"
        >
          <h2 className="text-white font-semibold mb-4">Derniers devis</h2>
          <div className="space-y-4">
            {recentQuotes.map((quote) => (
              <div
                key={quote.id}
                className="flex items-center justify-between p-4 bg-black/50 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{quote.clientName}</p>
                  <p className="text-sm text-gray-400">{quote.vehicleInfo}</p>
                  <p className="text-sm text-gray-400">{quote.service}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{quote.amount}€</p>
                  <p className="text-sm text-gray-400">
                    {format(new Date(quote.date), 'dd MMM yyyy', { locale: fr })}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    quote.status === 'accepted'
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : quote.status === 'rejected'
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {quote.status === 'accepted' ? 'Accepté' : quote.status === 'rejected' ? 'Refusé' : 'En attente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}