import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endDate: Date;
}

export function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const distance = endDate.getTime() - now;
      if (distance <= 0) {
        setExpired(true);
        return;
      }
      setExpired(false);
      setTimeLeft({
        days: Math.floor(distance / 86400000),
        hours: Math.floor((distance % 86400000) / 3600000),
        minutes: Math.floor((distance % 3600000) / 60000),
      });
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (expired) return null;

  return (
    <div>
      <p className="text-white/80 text-xs mb-2 font-medium">Comienza en:</p>
      <div className="flex gap-1.5">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-9.5 text-center">
          <div className="text-base font-bold text-white">{timeLeft.days}</div>
          <div className="text-[9px] text-white/80 font-medium">días</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-9.5 text-center">
          <div className="text-base font-bold text-white">{timeLeft.hours}</div>
          <div className="text-[9px] text-white/80 font-medium">hrs</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-9.5 text-center">
          <div className="text-base font-bold text-white">{timeLeft.minutes}</div>
          <div className="text-[9px] text-white/80 font-medium">min</div>
        </div>
      </div>
    </div>
  );
}
