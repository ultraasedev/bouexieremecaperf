// components/dashboard/appointments/TimeSelector.tsx
import { Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimeSelectorProps {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  disabled?: boolean;
}

const timeSlots = [
  { time: '09:00', label: '09:00 - Début de matinée' },
  { time: '09:30', label: '09:30' },
  { time: '10:00', label: '10:00' },
  { time: '10:30', label: '10:30' },
  { time: '11:00', label: '11:00' },
  { time: '11:30', label: '11:30' },
  { time: '14:00', label: '14:00 - Début d\'après-midi' },
  { time: '14:30', label: '14:30' },
  { time: '15:00', label: '15:00' },
  { time: '15:30', label: '15:30' },
  { time: '16:00', label: '16:00' },
  { time: '16:30', label: '16:30' },
  { time: '17:00', label: '17:00 - Fin de journée' },
  { time: '17:30', label: '17:30' },
  { time: '18:00', label: '18:00' }
];

export function TimeSelector({ selectedTime, onTimeSelect, disabled = false }: TimeSelectorProps) {
  return (
    <div className="w-full p-3 border-t border-white/10">
      <Select
        value={selectedTime}
        onValueChange={onTimeSelect}
        disabled={disabled}
      >
        <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-red-500" />
            <SelectValue placeholder="Sélectionnez une heure" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-white/10">
          <div className="max-h-[300px] overflow-auto">
            {timeSlots.map(({ time, label }) => (
              <SelectItem 
                key={time} 
                value={time}
                className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white"
              >
                {label}
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}