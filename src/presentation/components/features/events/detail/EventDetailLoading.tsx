import { Loader2 } from 'lucide-react';

export default function EventDetailLoading() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
    </div>
  );
}
