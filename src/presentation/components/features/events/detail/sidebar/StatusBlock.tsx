export function StatusBlock({ icon, text, className }: { icon: React.ReactNode; text: string; className?: string }) {
  return (
    <div className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 cursor-not-allowed ${className || 'bg-lg-surface-2 text-lg-dim border border-lg-surface-2'}`}>
      {icon} {text}
    </div>
  );
}
