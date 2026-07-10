export const stepLabels = ['Info', 'Fecha y lugar', 'Revisar'];

export const overlayVariants = {
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

export default StepIndicator;
