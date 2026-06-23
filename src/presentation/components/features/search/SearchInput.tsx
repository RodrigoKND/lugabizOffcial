import { LegacyRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  inputRef: LegacyRef<HTMLInputElement> | undefined;
}

export function SearchInput({ value, onChange, onClear, inputRef }: SearchInputProps) {
  return (
    <search role="search" aria-label="Buscar lugares">
      <div className="relative border-b border-white/8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar lugares, categorías..."
          aria-label="Buscar lugares, categorías"
          className="w-full pl-11 pr-12 py-4 text-base text-white outline-none bg-transparent placeholder:text-white/25"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {value && (
            <button onClick={onClear} aria-label="Limpiar búsqueda" className="p-1 hover:bg-white/8 rounded-lg transition-colors">
              <X className="w-4 h-4 text-white/40" aria-hidden="true" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/8 text-[10px] text-white/25 rounded border border-white/10 font-mono" aria-label="Tecla Escape para cerrar">
            ESC
          </kbd>
        </div>
      </div>
    </search>
  );
}
