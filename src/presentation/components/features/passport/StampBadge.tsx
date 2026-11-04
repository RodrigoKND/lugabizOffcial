interface StampBadgeProps {
  label?: string;
  tilt?: number;
  size?: 'sm' | 'lg';
}

// Sello de texto (sin ilustraciones): lleno si hay lugar sellado, punteado apagado si está por ganar.
const StampBadge: React.FC<StampBadgeProps> = ({ label, tilt = 0, size = 'sm' }) => (
  <span
    style={{ transform: `rotate(${tilt}deg)` }}
    className={`grid place-items-center rounded-full border-dashed text-center font-display font-black uppercase leading-tight ${
      size === 'lg' ? 'w-24 h-24 border-[3px] text-[11px] px-2' : 'w-11 h-11 border-2 text-[8px] px-0.5'
    } ${label ? 'border-lg-accent text-lg-accent' : 'border-lg-surface-2 text-lg-surface-2'}`}
  >
    <span className="line-clamp-3">{label ?? '?'}</span>
  </span>
);

export default StampBadge;
