import React, { lazy, Suspense, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Locate, Loader2 } from 'lucide-react';
import AddressAutocomplete from '@presentation/components/ui/address/AddressAutocomplete';
import { reverseGeocode } from '@lib/geocoding/geocodingService';
import type { GeoResult } from '@lib/geocoding/geocodingService';
import { ImageUploader } from '@presentation/components/reusables';
import FieldError from './FieldError';
import type { PlaceFormData, ValidationErrors } from '../../../../pages/Places/formAddNewPlace/types';

const MapPicker = lazy(() => import('@presentation/components/features/events/formNewEvent/MapPicker'));

interface LocationStepProps {
  formData: PlaceFormData;
  handleInputChange: (e: any) => void;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  handleBlur: (field: string) => void;
  handleCoordsChange: (lat: number, lng: number) => void;
  imagePreviews: string[];
  setImagePreviews: (imgs: string[]) => void;
  imageFiles: File[];
  setImageFiles: (files: File[]) => void;
  isSubmitting: boolean;
}

const LocationStep: React.FC<LocationStepProps> = ({
  formData, handleInputChange, errors, touched, handleBlur,
  handleCoordsChange, imagePreviews, setImagePreviews, imageFiles, setImageFiles, isSubmitting,
}) => {
  const reverseTimer = useRef<ReturnType<typeof setTimeout>>()

  const handleAddressSelect = useCallback((result: GeoResult) => {
    handleCoordsChange(result.lat, result.lng)
  }, [handleCoordsChange])

  const handleCoordChangeWithReverse = useCallback((lat: number, lng: number) => {
    handleCoordsChange(lat, lng)
    clearTimeout(reverseTimer.current)
    reverseTimer.current = setTimeout(async () => {
      const addr = await reverseGeocode(lat, lng)
      if (addr) {
        // Dispatch a synthetic event to update the address field
        handleInputChange({ target: { name: 'address', value: addr } } as any)
      }
    }, 600)
  }, [handleCoordsChange, handleInputChange])

  return (
    <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-5">
        <h2 className="text-base font-bold text-stone-800">Ubicación</h2>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-500 uppercase">Dirección</label>
          <AddressAutocomplete
            value={formData.address}
            onChange={(val) => handleInputChange({ target: { name: 'address', value: val } } as any)}
            onSelect={handleAddressSelect}
            onBlur={() => handleBlur('address')}
            placeholder="Calle, número, ciudad..."
            hasError={!!(touched.address && errors.address)}
          />
          <FieldError message={touched.address ? errors.address : null} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-500 uppercase">Selecciona en el mapa</label>
          <Suspense fallback={
            <div className="aspect-video bg-stone-100 rounded-xl flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          }>
            <MapPicker
              initialCoords={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : []}
              onCoordsChange={handleCoordChangeWithReverse}
            />
          </Suspense>
          {formData.latitude && formData.longitude && (
            <div className="flex items-center gap-2 text-xs text-stone-500 bg-primary-50 px-3 py-2 rounded-xl">
              <Locate className="w-3.5 h-3.5 text-primary-500" />
              <span>{formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</span>
            </div>
          )}
        </div>
      </div>

      <ImageUploader
        images={imagePreviews} onImagesChange={setImagePreviews}
        files={imageFiles} onFilesChange={setImageFiles}
        isSubmitting={isSubmitting} maxFiles={5} maxTotalMB={10}
      />
      <FieldError message={touched.images ? errors.images : null} />
    </motion.div>
  )
}

export default LocationStep;
