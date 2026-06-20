import React, { lazy, Suspense, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Locate } from 'lucide-react';
import { reverseGeocode } from '@lib/geocoding/geocodingService';
import { ValidationErrors } from './EventFormTypes';

const MapPicker = lazy(() => import('./MapPicker'));

interface Props {
  coords: number[];
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  onCoordsChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
}

const MapSection: React.FC<Props> = ({ coords, errors, touched, onCoordsChange, onAddressChange }) => {
  const revTimer = useRef<ReturnType<typeof setTimeout>>()

  const handleCoordsChangeWithReverse = useCallback((lat: number, lng: number) => {
    onCoordsChange(lat, lng)
    clearTimeout(revTimer.current)
    revTimer.current = setTimeout(async () => {
      const addr = await reverseGeocode(lat, lng)
      if (addr) onAddressChange?.(addr)
    }, 600)
  }, [onCoordsChange, onAddressChange])

  return (
    <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h3 className="text-base font-bold text-stone-800">Ubicación en el mapa</h3>
      <p className="text-xs text-stone-500">Haz clic en el mapa para marcar la ubicación. Arrastra el marcador para ajustar.</p>
      <Suspense fallback={
        <div className="aspect-video bg-stone-100 rounded-xl flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
        </div>
      }>
        <MapPicker initialCoords={coords} onCoordsChange={handleCoordsChangeWithReverse} />
      </Suspense>
      {touched.coords && errors.coords && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
          <span className="w-3 h-3 inline-flex items-center justify-center rounded-full bg-red-100 text-red-500 text-[8px] font-bold">!</span>
          {errors.coords}
        </p>
      )}
      {coords.length === 2 && (
        <div className="flex items-center gap-2 text-xs text-stone-500 bg-primary-50 px-3 py-2 rounded-xl">
          <Locate className="w-3.5 h-3.5 text-primary-500" />
          <span>{coords[0].toFixed(6)}, {coords[1].toFixed(6)}</span>
        </div>
      )}
    </motion.div>
  )
}

export default MapSection;
