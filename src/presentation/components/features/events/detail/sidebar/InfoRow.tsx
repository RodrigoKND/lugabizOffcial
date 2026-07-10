export function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="bg-amber-50 p-2.5 rounded-xl">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-stone-400 uppercase">{label}</p>
        <p className="text-sm font-medium text-stone-700 break-words">{value}</p>
      </div>
    </div>
  );
}
