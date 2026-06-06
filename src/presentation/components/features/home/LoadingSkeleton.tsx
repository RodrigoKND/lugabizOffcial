const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4 mt-4">
    <div className="h-48 bg-primary-100/50 rounded-2xl animate-pulse" />
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="shrink-0 w-40 aspect-3/4 bg-primary-100/50 rounded-xl animate-pulse" />
      ))}
    </div>
  </div>
);

export default LoadingSkeleton;
