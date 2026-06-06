import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Locate, Loader2 } from 'lucide-react';
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
}) => (
  <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
    <div className="bg-white rounded-2xl p-6 border border-stone-200 space-y-5">
      <h2 className="text-base font-bold text-stone-800">Ubicación</h2>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-stone-500 uppercase">Dirección</label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
          <input
            type="text" name="address" value={formData.address}
            onChange={handleInputChange} onBlur={() => handleBlur('address')}
            className={`w-full pl-11 pr-4 py-3.5 bg-stone-50 border rounded-xl focus:ring-0 text-sm outline-none ${
              touched.address && errors.address ? 'border-red-300' : 'border-stone-200 focus:border-amber-400'
            }`}
            placeholder="Calle, número, ciudad..."
          />
        </div>
        <FieldError message={touched.address ? errors.address : null} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-stone-500 uppercase">Selecciona en el mapa</label>
        <Suspense fallback={
          <div className="aspect-video bg-stone-100 rounded-xl flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        }>
          <MapPicker
            initialCoords={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : []}
            onCoordsChange={handleCoordsChange}
          />
        </Suspense>
        {formData.latitude && formData.longitude && (
          <div className="flex items-center gap-2 text-xs text-stone-500 bg-amber-50 px-3 py-2 rounded-xl">
            <Locate className="w-3.5 h-3.5 text-amber-500" />
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
);

export default LocationStep;
