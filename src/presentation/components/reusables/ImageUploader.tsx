import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, AlertCircle } from 'lucide-react';
import { storageService } from '@lib/supabase';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  isSubmitting: boolean;
  maxFiles?: number;
  maxTotalMB?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images, onImagesChange, files, onFilesChange,
  isSubmitting, maxFiles = 5, maxTotalMB = 10
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const allFiles = [...files, ...selected];

    const validation = storageService.validateMultipleFiles(allFiles, maxFiles, maxTotalMB);
    if (!validation.valid) {
      setError(validation.error || 'Error de validación');
      return;
    }

    setError(null);
    onFilesChange(allFiles);

    const newPreviews = selected.map(f => URL.createObjectURL(f));
    onImagesChange([...images, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newFiles = files.filter((_, i) => i !== index);
    onImagesChange(newImages);
    onFilesChange(newFiles);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Imágenes ({images.length}/{maxFiles})
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.length < maxFiles && (
            <label className="cursor-pointer">
              <div className="aspect-square bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center group hover:border-amber-400 hover:bg-amber-50/30 transition-all">
                {isSubmitting ? (
                  <div className="w-6 h-6 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Camera className="w-7 h-7 text-stone-400 group-hover:text-amber-500 group-hover:scale-110 transition-all" />
                    <span className="text-[10px] font-semibold text-stone-400 group-hover:text-amber-500 mt-1">Agregar</span>
                  </>
                )}
                <input ref={inputRef} type="file" accept="image/*"
                  onChange={handleSelect} className="hidden" multiple />
              </div>
            </label>
          )}

          {images.map((src, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-2xl overflow-hidden relative shadow-xs group">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 bg-black/40 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <p className="text-[11px] text-stone-400 font-medium">
          JPG, PNG, WEBP. Máx {maxFiles} imágenes, {maxTotalMB}MB total.
        </p>
      </div>
    </motion.div>
  );
};

export default ImageUploader;
