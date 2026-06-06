import { useState, useEffect, useRef } from 'react';
import { XCircle } from 'lucide-react';

interface CountdownTimerProps {
  endDate: Date;
  onExpired?: () => void;
}

export function CountdownTimer({ endDate, onExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;

    const tick = () => {
      const distance = endDate.getTime() - Date.now();
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
  }, [endDate, onExpired]);

  if (expired) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-500/20">
        <XCircle className="w-3.5 h-3.5 text-red-400" />
        <span className="text-[11px] font-bold text-red-400">Evento Finalizado</span>
      </div>
    );
  }

  return (
    <div className="bg-white/20 ">
      <p className="text-black text-xs mb-2 font-medium text-center">Comienza en:</p>
      <div className="flex justify-center gap-1.5">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-9.5 text-center">
          <div className="text-base font-bold text-black">{timeLeft.days}</div>
          <div className="text-[9px] text-black font-medium">días</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-9.5 text-center">
          <div className="text-base font-bold text-black">{timeLeft.hours}</div>
          <div className="text-[9px] text-black font-medium">hrs</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-9.5 text-center">
          <div className="text-base font-bold text-black">{timeLeft.minutes}</div>
          <div className="text-[9px] text-black font-medium">min</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-9.5 text-center">
          <div className="text-base font-bold text-black">
            {Math.max(0, Math.floor((endDate.getTime() - Date.now()) / 1000) % 60)}
          </div>
          <div className="text-[9px] text-black font-medium">seg</div>
        </div>
      </div>
    </div>
  );
}
