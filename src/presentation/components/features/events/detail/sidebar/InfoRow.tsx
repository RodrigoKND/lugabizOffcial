export function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-lg-surface-2 text-lg-accent [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      <div className="min-w-0 pt-0.5">
        <p className="text-xs font-bold text-lg-dim">{label}</p>
        <p className="break-words text-sm font-semibold text-lg-text">{value}</p>
      </div>
    </div>
  );
}
