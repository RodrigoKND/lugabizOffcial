interface IconProps {
  size?: number;
  className?: string;
}

export function CheckCircleIcon({ size = 32, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
