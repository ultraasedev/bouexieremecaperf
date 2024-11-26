// app/dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Euro, Users, Calendar, FileText } from 'lucide-react';

// Données de exemple pour le graphique
const monthlyData = [
  { name: 'Jan', value: 2400 },
  { name: 'Fév', value: 1398 },
  { name: 'Mar', value: 9800 },
  { name: 'Avr', value: 3908 },
  { name: 'Mai', value: 4800 },
  { name: 'Jun', value: 3800 },
  { name: 'Jul', value: 4300 },
];

export default function Dashboard(): JSX.Element {
  return (
    <div className="space-y-6 p-6">
      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#2B2B2B] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Chiffre d affaires</p>
                <h3 className="text-2xl font-bold text-white mt-2">24,800 €</h3>
                <p className="text-sm text-green-500 mt-1">+12% ce mois</p>
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
                <h3 className="text-2xl font-bold text-white mt-2">1,248</h3>
                <p className="text-sm text-blue-500 mt-1">+8% ce mois</p>
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
                <h3 className="text-2xl font-bold text-white mt-2">42</h3>
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
                <h3 className="text-2xl font-bold text-white mt-2">8</h3>
                <p className="text-sm text-yellow-500 mt-1">À traiter</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique */}
      <Card className="bg-[#2B2B2B] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Activité générale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <XAxis 
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}€`}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1C1C1C',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Dernières activités */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="bg-[#2B2B2B] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Derniers rendez-vous</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Jean Dupont</p>
                    <p className="text-sm text-gray-400">Diagnostic moteur</p>
                  </div>
                  <p className="text-sm text-gray-400">14:30</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2B2B2B] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Derniers devis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Devis #124{i}</p>
                    <p className="text-sm text-gray-400">Pièces premium</p>
                  </div>
                  <p className="text-sm text-green-500">1,250.00 €</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}