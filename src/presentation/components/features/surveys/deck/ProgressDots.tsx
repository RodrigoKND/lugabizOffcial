interface ProgressDotsProps {
  total: number;
  current: number;
}

export default function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div className="flex gap-1 px-4 pt-3 pb-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= current ? 'bg-purple-500' : 'bg-stone-100'}`}
        />
      ))}
    </div>
  );
}
