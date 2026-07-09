import type { SocialLinks } from '@domain/entities';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const DANGEROUS_EXTENSIONS = ['.exe', '.apk', '.zip', '.msi', '.dmg', '.bat', '.scr', '.cmd', '.sh'];

function isIpLiteral(hostname: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':'); // IPv4 or IPv6 literal
}

function parseHttpsUrl(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return null;
    if (url.username || url.password) return null;
    if (isIpLiteral(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

function validateDomainUrl(raw: string, label: string, allowedHosts: string[]): ValidationResult {
  const trimmed = raw.trim();
  if (!trimmed) return { valid: true };
  const url = parseHttpsUrl(trimmed);
  if (!url) return { valid: false, error: `El link de ${label} debe ser una URL https:// válida` };
  const host = url.hostname.toLowerCase();
  if (!allowedHosts.includes(host)) {
    return { valid: false, error: `El link de ${label} debe ser un dominio de ${label} (${allowedHosts[0]})` };
  }
  return { valid: true };
}

export function validateInstagramUrl(raw: string): ValidationResult {
  return validateDomainUrl(raw, 'Instagram', ['instagram.com', 'www.instagram.com']);
}

export function validateFacebookUrl(raw: string): ValidationResult {
  return validateDomainUrl(raw, 'Facebook', ['facebook.com', 'www.facebook.com']);
}

export function validateTikTokUrl(raw: string): ValidationResult {
  return validateDomainUrl(raw, 'TikTok', ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com']);
}

export function validateWebsiteUrl(raw: string): ValidationResult {
  const trimmed = raw.trim();
  if (!trimmed) return { valid: true };
  const url = parseHttpsUrl(trimmed);
  if (!url) return { valid: false, error: 'La página web debe ser una URL https:// válida' };
  const pathLower = url.pathname.toLowerCase();
  if (DANGEROUS_EXTENSIONS.some(ext => pathLower.endsWith(ext))) {
    return { valid: false, error: 'Ese link no parece ser una página web válida' };
  }
  return { valid: true };
}

export function extractTikTokVideoId(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const url = parseHttpsUrl(raw.trim());
  if (!url) return null;
  const host = url.hostname.toLowerCase();
  if (host !== 'tiktok.com' && host !== 'www.tiktok.com') return null;
  const match = url.pathname.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

export function validateSocialLinks(links: SocialLinks): string | null {
  const checks: [string | undefined, (v: string) => ValidationResult][] = [
    [links.instagram, validateInstagramUrl],
    [links.tiktok, validateTikTokUrl],
    [links.facebook, validateFacebookUrl],
    [links.website, validateWebsiteUrl],
  ];
  for (const [value, validator] of checks) {
    if (!value) continue;
    const result = validator(value);
    if (!result.valid) return result.error ?? 'Link inválido';
  }
  return null;
}
