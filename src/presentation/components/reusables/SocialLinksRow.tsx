import React from 'react';
import { Instagram, Music2, Facebook, Globe } from 'lucide-react';
import type { SocialLinks } from '@domain/entities';

interface SocialLinksRowProps {
  links?: SocialLinks;
  className?: string;
  variant?: 'light' | 'dark';
}

const ICON_MAP: Record<keyof SocialLinks, React.ReactNode> = {
  instagram: <Instagram className="w-4 h-4" />,
  tiktok: <Music2 className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  website: <Globe className="w-4 h-4" />,
};

const linkCls = {
  light: 'bg-white border border-stone-100 shadow-xs text-stone-500 hover:text-primary-600 hover:border-primary-200',
  dark: 'bg-white/6 border border-white/10 text-white/55 hover:bg-white/10 hover:text-white/80',
};

const SocialLinksRow: React.FC<SocialLinksRowProps> = ({ links, className, variant = 'light' }) => {
  const entries = (Object.keys(ICON_MAP) as (keyof SocialLinks)[]).filter(key => links?.[key]);
  if (entries.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      {entries.map(key => (
        <a
          key={key}
          href={links![key]}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${linkCls[variant]}`}
        >
          {ICON_MAP[key]}
        </a>
      ))}
    </div>
  );
};

export default SocialLinksRow;
