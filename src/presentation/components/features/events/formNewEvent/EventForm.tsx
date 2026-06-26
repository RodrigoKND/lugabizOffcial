import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { EventFormProps } from './EventFormTypes';
import { useEventForm } from './useEventForm';
import BasicInfoSection from './BasicInfoSection';
import DateTimeLocationSection from './DateTimeLocationSection';
import ReviewSection from './ReviewSection';
import FormNavigation from './FormNavigation';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';

const stepLabels = ['Info', 'Fecha y lugar', 'Revisar'];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const StepIndicator = ({ step }: { step: number }) => (
  <div className="flex items-center gap-2">
    {stepLabels.map((label, i) => (
      <div key={i} className="flex items-center gap-2">
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg transition-all duration-300 ${
          i === step ? 'bg-primary-100' : i < step ? 'bg-primary-50' : 'bg-transparent'
        }`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
            i <= step ? 'bg-primary-500 text-white' : 'bg-stone-200 text-stone-400'
          }`}>
            {i < step ? '✓' : i + 1}
          </div>
          <span className={`text-[11px] font-semibold hidden sm:inline transition-colors duration-300 ${
            i === step ? 'text-primary-800' : i < step ? 'text-primary-600' : 'text-stone-300'
          }`}>
            {label}
          </span>
        </div>
        {i < stepLabels.length - 1 && (
          <div className={`w-4 h-px transition-colors duration-300 ${i < step ? 'bg-primary-300' : 'bg-stone-200'}`} />
        )}
      </div>
    ))}
  </div>
);

const EventForm: React.FC<EventFormProps> = ({ isOpen, onClose }) => {
  const {
    step, formData, imageFiles, imagePreviews, isSubmitting, errors, touched, categories,
    handleChange, handleBlur, handleImage, removeImage, handleCoordsChange,
    handleSubmit, goNext, goBack,
  } = useEventForm(onClose);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  const handlePublishRequest = () => setShowPublishConfirm(true);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="bg-white rounded-3xl w-full max-w-2xl my-4 sm:my-0 shadow-2xl border border-white/10 overflow-hidden"
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="px-5 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-stone-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold text-stone-800 tracking-tight">Crear Evento</h2>
                  <p className="text-[11px] text-stone-400 mt-0.5">Comparte tu evento con la comunidad</p>
                </div>
                <button onClick={onClose}
                  className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
                  <X className="w-4 h-4 text-stone-400" />
                </button>
              </div>
              <StepIndicator step={step} />
            </div>

            {/* Content */}
            <form
              onSubmit={e => { e.preventDefault(); handlePublishRequest(); }}
              onKeyDown={e => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') e.preventDefault(); }}
              className="px-5 sm:px-6 py-5 space-y-5 overflow-y-auto max-h-[60vh] sm:max-h-[65vh] pb-20 md:pb-5 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent"
            >
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="s0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>
                    <BasicInfoSection
                      formData={formData} errors={errors} touched={touched}
                      categories={categories} onChange={handleChange} onBlur={handleBlur}
                    />
                  </motion.div>
                )}
                {step === 1 && (
                  <motion.div key="s1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>
                    <DateTimeLocationSection
                      formData={formData} errors={errors} touched={touched}
                      imagePreviews={imagePreviews} onChange={handleChange} onBlur={handleBlur}
                      onImage={handleImage} onRemoveImage={removeImage}
                      onCoordsChange={handleCoordsChange}
                    />
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div key="s2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>
                    <ReviewSection
                      formData={formData} categories={categories} imageFiles={imageFiles}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <FormNavigation
                step={step} isSubmitting={isSubmitting}
                onBack={goBack} onNext={goNext}
              />
            </form>
          </motion.div>
        </motion.div>
      )}
      <ConfirmDialog
        open={showPublishConfirm}
        onClose={() => setShowPublishConfirm(false)}
        onConfirm={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
        title="¿Publicar evento?"
        message="Tu evento será visible para toda la comunidad. ¿Estás seguro de que todo está correcto?"
        confirmLabel="Publicar"
        variant="info"
      />
    </AnimatePresence>
  );
};

export default EventForm;
