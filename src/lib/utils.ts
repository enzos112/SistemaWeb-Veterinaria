import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to parse dates from various formats
export const parseDate = (dateString?: string | Date): string | undefined => {
  if (!dateString) return undefined;
  
  if (dateString instanceof Date) {
      if (!isNaN(dateString.getTime())) {
          return dateString.toISOString().split('T')[0];
      }
      return undefined;
  }
  
  if (typeof dateString !== 'string') return undefined;

  const monthMap: { [key: string]: string } = {
    'mar': '03', 'may': '05', 'jun': '06', 'set': '09', 'nov': '11',
    'ene': '01', 'feb': '02', 'abr': '04', 'jul': '07', 'ago': '08', 'oct': '10', 'dic': '12'
  };

  // Handle 'Mmm-yy' format e.g. Mar-22
  const monthMatch = dateString.toLowerCase().match(/([a-z]{3})-(\d{2})/);
  if (monthMatch) {
    const [, monthStr, yearStr] = monthMatch;
    const month = monthMap[monthStr as keyof typeof monthMap];
    if (month && yearStr) {
      const year = `20${yearStr}`;
      const lastDay = new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate();
      return `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
    }
  }

  // Handle 'd/mm/yyyy' or 'dd/mm/yyyy' format
  const dateParts = dateString.split('/');
  if (dateParts.length === 3) {
    const [day, month, year] = dateParts;
    if (day && month && year && year.length === 4) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
     if (day && month && year && year.length === 2) {
      return `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  // Handle ISO-like dates from Excel on some systems e.g. 2022-08-25
  const isoMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
      return dateString.split('T')[0];
  }

  // Try parsing with Date object as a fallback
  const d = new Date(dateString);
  if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
  }

  return undefined;
};
