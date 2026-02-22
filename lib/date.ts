// lib/date.ts
import { format as fnsFormat } from 'date-fns';
import { fr } from 'date-fns/locale';

const FORMATS = {
  short: 'dd/MM/yyyy',
  long: 'dd MMMM yyyy',
  time: 'HH:mm',
  datetime: 'dd/MM/yyyy HH:mm'
} as const;

type FormatType = keyof typeof FORMATS;

export const formatDate = (
  date: Date | string, 
  formatType: FormatType = 'short'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return fnsFormat(dateObj, FORMATS[formatType], { locale: fr });
};