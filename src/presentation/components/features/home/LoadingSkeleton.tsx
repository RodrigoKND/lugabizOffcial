const Pulse = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-xl bg-white/6 ${className}`} />
);

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-8 mt-2">

    {/* Welcome section skeleton */}
    <div className="px-1 space-y-3">
      <Pulse className="h-3 w-20 rounded-full" />
      <Pulse className="h-8 w-3/4 rounded-xl" />
      <Pulse className="h-8 w-1/2 rounded-xl" />
      <div className="h-14 animate-pulse rounded-2xl bg-white/5 border border-white/5 mt-1" />
      <div className="flex gap-2 mt-1">
        {[80, 72, 68, 76, 64].map((w, i) => (
          <div key={i} className={`animate-pulse h-8 rounded-full bg-white/5 border border-white/5 shrink-0`} style={{ width: w }} />
        ))}
      </div>
    </div>

    {/* Stories skeleton */}
    <div className="flex gap-4 -mx-4 px-4 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="shrink-0 flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full animate-pulse bg-white/6" />
          <div className="h-2 w-12 animate-pulse rounded-full bg-white/5" />
        </div>
      ))}
    </div>

    {/* Hero banner skeleton */}
    <Pulse className="h-48 sm:h-56 rounded-2xl" />

    {/* Card row skeleton */}
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-4 h-4 animate-pulse rounded-full bg-white/8" />
        <Pulse className="h-4 w-32 rounded-lg" />
      </div>
      <div className="flex gap-3 -mx-4 px-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="shrink-0 w-36 aspect-[3/4] animate-pulse rounded-xl bg-white/6" />
        ))}
      </div>
    </div>

    {/* Second card row skeleton */}
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-4 h-4 animate-pulse rounded-full bg-white/8" />
        <Pulse className="h-4 w-28 rounded-lg" />
      </div>
      <div className="flex gap-3 -mx-4 px-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="shrink-0 w-36 aspect-[3/4] animate-pulse rounded-xl bg-white/6" />
        ))}
      </div>
    </div>
  </div>
);

export default LoadingSkeleton;
