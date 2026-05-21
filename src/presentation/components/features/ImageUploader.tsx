import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Plus, Minus } from 'lucide-react';

interface ImageUploaderProps {
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  isSubmitting: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  imagePreview,
  onImageChange,
  onRemoveImage,
  isSubmitting
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl border border-white/50 space-y-5"
    >
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
          Foto destacada
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          <input
            type="file"
            accept="image/jpg, image/png, image/jpeg, image/webp"
            onChange={onImageChange}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center group hover:border-[#9C3FE4] hover:bg-gradient-to-br hover:from-[#F8F6FA] hover:to-[#F2EBF7] transition-all duration-300">
              {isSubmitting ? (
                <div className="w-8 h-8 border-3 border-[#9C3FE4] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Camera className="w-8 h-8 text-gray-400 group-hover:text-[#9C3FE4] group-hover:scale-110 transition-all duration-300" />
                  <span className="text-xs font-bold text-gray-400 group-hover:text-[#9C3FE4] mt-1">Añadir</span>
                </>
              )}
            </div>
          </label>
          
          {imagePreview && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-2xl overflow-hidden relative shadow-lg"
            >
              <img 
                src={imagePreview} 
                alt="Vista previa" 
                className="w-full h-full object-cover" 
              />
              <button 
                type="button"
                onClick={onRemoveImage} 
                className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-colors'
              >
                <Minus className='w-4 h-4'/>
              </button>
            </motion.div>
          )}
        </div>
        <p className="text-xs text-gray-400 font-medium">Máximo 1 foto. Formatos JPG, PNG, WEBP. Máx 5MB.</p>
      </div>
    </motion.div>
  );
};

export default ImageUploader;