interface IconProps {
  size?: number;
  className?: string;
}

export function MapPinIcon({ size = 48, className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" width={size} height={size} className={className}>
      <path d="M24 2C15.164 2 8 9.164 8 18c0 12 16 28 16 28s16-16 16-28C40 9.164 32.836 2 24 2z" fill="#D4785C" />
      <path d="M24 2c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z" fill="white" />
      <circle cx="24" cy="10" r="4" fill="#D4785C" />
    </svg>
  );
}

export function MapPinIconDetailed({ size = 48, className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" width={size} height={size} className={className}>
      <path d="M24 2C15.164 2 8 9.164 8 18c0 12 16 28 16 28s16-16 16-28C40 9.164 32.836 2 24 2z" fill="#D4785C" />
      <path d="M24 2c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z" fill="white" />
      <path d="M24 6c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4z" fill="#D4785C" />
      <circle cx="24" cy="10" r="1.5" fill="white" />
    </svg>
  );
}
