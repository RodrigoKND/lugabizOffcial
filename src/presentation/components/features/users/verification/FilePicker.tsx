import { useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';

const FilePicker: React.FC<{
  label: string;
  hint: string;
  icon: React.ReactNode;
  file: File | null;
  onSelect: (f: File | null) => void;
}> = ({ label, hint, icon, file, onSelect }) => {
  const ref = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : null;
  return (
    <button type="button" onClick={() => ref.current?.click()}
      className="w-full flex items-center gap-3 p-3 bg-lg-surface-2 border border-lg-surface-2 rounded-xl text-left hover:border-primary-300 transition-all">
      <div className="w-12 h-12 rounded-lg bg-lg-surface border border-lg-surface-2 flex items-center justify-center overflow-hidden shrink-0">
        {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-lg-text truncate">{file ? file.name : label}</p>
        <p className="text-[11px] text-lg-dim">{file ? 'Toca para cambiar' : hint}</p>
      </div>
      {file && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)} />
    </button>
  );
};

export default FilePicker;
