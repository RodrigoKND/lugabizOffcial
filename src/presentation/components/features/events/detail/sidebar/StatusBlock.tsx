export function StatusBlock({ icon, text, className }: { icon: React.ReactNode; text: string; className?: string }) {
  return (
    <div className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 cursor-not-allowed ${className || 'bg-stone-100 text-stone-400 border border-stone-200'}`}>
      {icon} {text}
    </div>
  );
}
