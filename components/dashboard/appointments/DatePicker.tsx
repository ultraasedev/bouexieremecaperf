// components/dashboard/appointments/DatePicker.tsx
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TimeSelector } from './TimeSelector';

interface DatePickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function DatePicker({ selectedDate, onDateSelect }: DatePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState<string>(
    format(selectedDate, 'HH:mm')
  );

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes] = selectedTime.split(':');
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      onDateSelect(newDate);
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    const [hours, minutes] = time.split(':');
    const newDate = new Date(selectedDate);
    newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    onDateSelect(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, 'PPP à HH:mm', { locale: fr })
          ) : (
            <span>Sélectionnez une date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateChange}
          locale={fr}
          initialFocus
        />
        <TimeSelector
          selectedTime={selectedTime}
          onTimeSelect={handleTimeChange}
        />
      </PopoverContent>
    </Popover>
  );
}