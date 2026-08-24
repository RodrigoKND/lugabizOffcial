import { useEffect, useState } from 'react';

const COCHABAMBA = { lat: -17.3935, lng: -66.157 };
const CACHE_KEY = '_lugabiz_weather_cache';
const CACHE_MS = 10 * 60 * 1000;

interface WeatherCache {
  tempC: number;
  ts: number;
}

export function useHomeWeather(lat?: number, lng?: number) {
  const [tempC, setTempC] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached: WeatherCache = JSON.parse(raw);
        if (Date.now() - cached.ts < CACHE_MS) {
          setTempC(cached.tempC);
          return;
        }
      }
    } catch { /* ignore */ }

    const latitude = lat ?? COCHABAMBA.lat;
    const longitude = lng ?? COCHABAMBA.lng;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

    fetch(url)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (cancelled || !data?.current_weather) return;
        const temp = Math.round(data.current_weather.temperature);
        setTempC(temp);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ tempC: temp, ts: Date.now() } as WeatherCache));
        } catch { /* ignore */ }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [lat, lng]);

  return tempC;
}
