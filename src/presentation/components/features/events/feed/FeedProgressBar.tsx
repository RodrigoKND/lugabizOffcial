interface FeedProgressBarProps {
  total: number;
  currentIndex: number;
}

export function FeedProgressBar({ total, currentIndex }: FeedProgressBarProps) {
  const visible = Math.min(total, 8);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
      {Array.from({ length: visible }).map((_, idx) => (
        <div
          key={idx}
          className={`h-1 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/30'}`}
        />
      ))}
      {total > 8 && (
        <span className="text-white/40 text-[11px] ml-1 font-medium">+{total - 8}</span>
      )}
    </div>
  );
}
