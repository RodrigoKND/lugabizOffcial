import { CheckCircle2, AlertTriangle } from 'lucide-react';

export const verdictStyles = {
  ok:   { wrap: 'bg-green-50 border-green-200', icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, text: 'text-green-700' },
  warn: { wrap: 'bg-amber-50 border-amber-200', icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, text: 'text-amber-700' },
  fail: { wrap: 'bg-red-50 border-red-200', icon: <AlertTriangle className="w-5 h-5 text-red-500" />, text: 'text-red-700' },
} as const;
