import { Loader2 } from 'lucide-react';

export default function EventDetailLoading() {
  return (
    <div role="status" aria-label="Cargando evento" className="flex min-h-screen items-center justify-center bg-lg-ground">
      <Loader2 className="h-8 w-8 animate-spin text-lg-accent" />
    </div>
  );
}
