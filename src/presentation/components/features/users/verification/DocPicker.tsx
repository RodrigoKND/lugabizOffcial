import { useRef } from 'react';
import { FileCheck2 } from 'lucide-react';

const DocPicker: React.FC<{ label: string; hint: string; file: File | null; onSelect: (f: File | null) => void }> = ({ label, hint, file, onSelect }) => {
  const ref = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : null;
  return (
    <button type="button" onClick={() => ref.current?.click()}
      className="w-full flex items-center gap-3 p-3 bg-lg-surface-2 border border-lg-surface-2 rounded-xl text-left hover:border-primary-300 transition-all">
      <div className="w-11 h-11 rounded-lg bg-lg-surface border border-lg-surface-2 flex items-center justify-center overflow-hidden shrink-0">
        {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : <FileCheck2 className="w-5 h-5 text-lg-accent" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-lg-text truncate">{file ? file.name : label}</p>
        <p className="text-[11px] text-lg-dim">{file ? 'Toca para cambiar' : hint}</p>
      </div>
      <input ref={ref} type="file" accept="image/*,application/pdf" className="hidden"
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)} />
    </button>
  );
};

export default DocPicker;
