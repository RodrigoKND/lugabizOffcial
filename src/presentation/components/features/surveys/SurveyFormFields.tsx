import type { SurveyFormData } from './CreateSurveyModal.types';

interface SurveyFormFieldsProps {
  form: SurveyFormData;
  onChange: (field: keyof SurveyFormData, value: string) => void;
}

const SurveyFormFields: React.FC<SurveyFormFieldsProps> = ({ form, onChange }) => (
  <div className="space-y-4">
    <div>
      <label htmlFor="survey-title" className="text-xs font-semibold text-white/50 uppercase tracking-wider">
        Título del proyecto
      </label>
      <input
        id="survey-title"
        type="text"
        value={form.title}
        onChange={(e) => onChange('title', e.target.value)}
        className="w-full mt-1.5 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 outline-none focus:border-primary-400/50 focus:ring-1 focus:ring-primary-400/20 transition-all"
        placeholder="Ej. Nueva app de delivery"
        required
      />
    </div>

    <div>
      <label htmlFor="survey-desc" className="text-xs font-semibold text-white/50 uppercase tracking-wider">
        Descripción breve
      </label>
      <textarea
        id="survey-desc"
        value={form.description}
        onChange={(e) => onChange('description', e.target.value)}
        className="w-full mt-1.5 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 outline-none focus:border-primary-400/50 focus:ring-1 focus:ring-primary-400/20 transition-all resize-none"
        rows={2}
        placeholder="Describe tu proyecto en pocas palabras"
      />
    </div>

    <div>
      <label htmlFor="survey-about" className="text-xs font-semibold text-white/50 uppercase tracking-wider">
        ¿De qué se trata?
      </label>
      <textarea
        id="survey-about"
        value={form.about}
        onChange={(e) => onChange('about', e.target.value)}
        className="w-full mt-1.5 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 outline-none focus:border-primary-400/50 focus:ring-1 focus:ring-primary-400/20 transition-all resize-none"
        rows={2}
        placeholder="Explica de qué va tu proyecto"
      />
    </div>

    <div>
      <label htmlFor="survey-problem" className="text-xs font-semibold text-white/50 uppercase tracking-wider">
        ¿Qué problema resuelve?
      </label>
      <textarea
        id="survey-problem"
        value={form.problemSolved}
        onChange={(e) => onChange('problemSolved', e.target.value)}
        className="w-full mt-1.5 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 outline-none focus:border-primary-400/50 focus:ring-1 focus:ring-primary-400/20 transition-all resize-none"
        rows={2}
        placeholder="¿Qué necesidad cubre?"
      />
    </div>
  </div>
);

export default SurveyFormFields;
