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
}

export default function AddressAutocomplete({
  value, onChange, onSelect, onBlur,
  placeholder = 'Buscar dirección…',
  hasError, className = '', icon,
}: Props) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<GeoResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
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

  function handleInput(val: string) {
    setQuery(val)
    setSelected(false)
    onChange(val)
    clearTimeout(timerRef.current)
    if (val.trim().length < 3) { setResults([]); setOpen(false); return }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      const res = await searchAddress(val)
      setResults(res)
      setOpen(res.length > 0)
      setLoading(false)
    }, 400)
  }

  function handlePick(r: GeoResult) {
    setQuery(r.displayName)
    setSelected(true)
    setOpen(false)
    onChange(r.displayName)
    onSelect(r)
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        {icon ?? <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />}
        <input
          type="text"
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          onBlur={() => { onBlur?.() }}
          placeholder={placeholder}
          className={`w-full pl-11 pr-10 py-3.5 bg-stone-50 border rounded-xl focus:ring-0 text-sm outline-none transition-all ${
            hasError ? 'border-red-300' : 'border-stone-200 focus:border-amber-400'
          } ${className}`}
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-stone-400" />
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {results.map((r, i) => (
            <li
              key={i}
              onMouseDown={() => handlePick(r)}
              className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-amber-50 border-b border-stone-100 last:border-0 transition-colors"
            >
              <MapPin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <span className="text-sm text-stone-700 line-clamp-2">{r.displayName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
