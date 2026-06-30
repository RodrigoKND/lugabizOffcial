import { useState, useEffect, useRef, useMemo } from 'react';
import { XCircle } from 'lucide-react';

interface CountdownTimerProps {
  endDate: Date;
  time?: string;
  onExpired?: () => void;
  /** 'light' for white/light surfaces (dark text), 'dark' for dark surfaces (light text) */
  variant?: 'light' | 'dark';
}

export function CountdownTimer({ endDate, time, onExpired, variant = 'light' }: CountdownTimerProps) {
  const isDark = variant === 'dark';
  const labelClass = isDark ? 'text-white/55' : 'text-stone-500';
  const numberClass = isDark ? 'text-white' : 'text-stone-800';
  const unitClass = isDark ? 'text-white/40' : 'text-stone-400';
  const targetDate = useMemo(() => {
    if (!time) return endDate;
    const d = new Date(endDate);
    const parts = time.split(':').map(Number);
    d.setHours(parts[0] || 0, parts[1] || 0, 0, 0);
    return d;
  }, [endDate, time]);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;

    const tick = () => {
      const distance = targetDate.getTime() - Date.now();
      if (distance <= 0) {
        setExpired(true);
        if (!firedRef.current && onExpired) {
          firedRef.current = true;
          onExpired();
        }
        return;
      }
      setExpired(false);
      setTimeLeft({
        days: Math.floor(distance / 86400000),
        hours: Math.floor((distance % 86400000) / 3600000),
        minutes: Math.floor((distance % 3600000) / 60000),
        seconds: Math.floor((distance % 60000) / 1000),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate, onExpired]);

  if (expired) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-500/20">
        <XCircle className="w-3.5 h-3.5 text-red-400" />
        <span className="text-[11px] font-bold text-red-400">Evento Finalizado</span>
      </div>
    );
  }

  return (
    <div>
      <p className={`${labelClass} text-xs mb-2 font-medium text-center`}>Comienza en:</p>
      <div className="flex justify-center gap-1.5">
        <div className="rounded-lg px-2 py-1.5 min-w-9.5 text-center">
          <div className={`text-base font-bold ${numberClass}`}>{timeLeft.days}</div>
          <div className={`text-[9px] ${unitClass} font-medium`}>días</div>
        </div>
        <div className="rounded-lg px-2 py-1.5 min-w-9.5 text-center">
          <div className={`text-base font-bold ${numberClass}`}>{timeLeft.hours}</div>
          <div className={`text-[9px] ${unitClass} font-medium`}>hrs</div>
        </div>
        <div className="rounded-lg px-2 py-1.5 min-w-9.5 text-center">
          <div className={`text-base font-bold ${numberClass}`}>{timeLeft.minutes}</div>
          <div className={`text-[9px] ${unitClass} font-medium`}>min</div>
        </div>
        <div className="rounded-lg px-2 py-1.5 min-w-9.5 text-center">
          <div className={`text-base font-bold ${numberClass}`}>
            {Math.max(0, Math.floor((targetDate.getTime() - Date.now()) / 1000) % 60)}
          </div>
          <div className={`text-[9px] ${unitClass} font-medium`}>seg</div>
        </div>
      </div>
    </div>
  );
}
