export function StatusBlock({ icon, text, className }: { icon: React.ReactNode; text: string; className?: string }) {
  return (
    <div role="status" className={`flex h-14 w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg text-base font-bold [&>svg]:h-5 [&>svg]:w-5 ${className || 'bg-lg-surface-2 text-lg-dim'}`}>
      {icon} {text}
    </div>
  );
}
