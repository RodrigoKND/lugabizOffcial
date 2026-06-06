import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const SuccessScreen: React.FC = () => (
  <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-sm border border-stone-200"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5"
      >
        <Check className="w-8 h-8 text-white" />
      </motion.div>
      <h2 className="text-xl font-bold text-stone-800 mb-2">¡Lugar publicado!</h2>
      <p className="text-stone-500 text-sm mb-5">Tu recomendación ha sido añadida exitosamente.</p>
      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2 }}
          className="bg-green-500 h-full"
        />
      </div>
      <p className="text-xs text-stone-400 mt-3 font-medium">Redirigiendo...</p>
    </motion.div>
  </div>
);

export default SuccessScreen;
