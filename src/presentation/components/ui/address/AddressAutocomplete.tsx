import React, { useState, useRef, useEffect } from 'react'
import { MapPin, Search, Loader2 } from 'lucide-react'
import { searchAddress, type GeoResult } from '@lib/geocoding/geocodingService'

interface Props {
  value: string
  onChange: (value: string) => void
  onSelect: (result: GeoResult) => void
  onBlur?: () => void
  placeholder?: string
  hasError?: boolean
  className?: string
  icon?: React.ReactNode
  /** Sesga las sugerencias hacia este punto (ej. ubicación del usuario o el pin del mapa) */
  near?: { lat: number; lng: number }
}

export default function AddressAutocomplete({
  value, onChange, onSelect, onBlur,
  placeholder = 'Buscar dirección…',
  hasError, className = '', icon, near,
}: Props) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<GeoResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const abortRef = useRef<AbortController>()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (!selected) setQuery(value) }, [value])
  useEffect(() => { setSelected(false) }, [value])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Limpieza al desmontar: cancela timers y peticiones pendientes.
  useEffect(() => () => { clearTimeout(timerRef.current); abortRef.current?.abort() }, [])

  function handleInput(val: string) {
    setQuery(val)
    setSelected(false)
    setHighlight(-1)
    onChange(val)
    clearTimeout(timerRef.current)
    abortRef.current?.abort()
    if (val.trim().length < 3) { setResults([]); setOpen(false); setLoading(false); return }
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      const ctrl = new AbortController()
      abortRef.current = ctrl
      const res = await searchAddress(val, { near, signal: ctrl.signal })
      if (ctrl.signal.aborted) return
      setResults(res)
      setOpen(res.length > 0)
      setLoading(false)
    }, 250)
  }

  function handlePick(r: GeoResult) {
    setQuery(r.displayName)
    setSelected(true)
    setOpen(false)
    setHighlight(-1)
    onChange(r.displayName)
    onSelect(r)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight(h => (h + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight(h => (h - 1 + results.length) % results.length)
    } else if (e.key === 'Enter' && highlight >= 0) {
      e.preventDefault()
      handlePick(results[highlight])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        {icon ?? <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />}
        <input
          type="text"
          value={query}
          onChange={e => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          onBlur={() => { onBlur?.() }}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full pl-11 pr-10 py-3.5 bg-stone-50 border rounded-xl focus:ring-0 text-sm outline-none transition-all ${
            hasError ? 'border-red-300' : 'border-stone-200 focus:border-amber-400'
          } ${className}`}
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-stone-400" />
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="address-suggest-panel absolute z-50 left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {results.map((r, i) => (
            <li
              key={i}
              onMouseDown={() => handlePick(r)}
              onMouseEnter={() => setHighlight(i)}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-stone-100 last:border-0 transition-colors ${
                highlight === i ? 'bg-amber-50' : 'hover:bg-amber-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-stone-800 truncate">{r.mainText}</span>
                {r.secondaryText && (
                  <span className="block text-xs text-stone-500 truncate">{r.secondaryText}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
