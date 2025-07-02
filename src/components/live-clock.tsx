"use client";

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function LiveClock() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // This runs only on the client, after hydration
    setCurrentTime(new Date()); 
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedTime = currentTime 
    ? currentTime.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  return (
    <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span className="font-mono w-[5ch] text-center">{formattedTime}</span>
    </div>
  );
}
