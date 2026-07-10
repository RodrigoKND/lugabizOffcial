import type React from 'react';
import { LayoutDashboard, MapPin, Calendar, MessageSquare, Users, Flag, ShieldAlert, BadgeCheck, Store, Activity, Megaphone } from 'lucide-react';
import type { Section } from './types';

export const C = {
  users: '#3b82f6',
  places: '#a855f7',
  events: '#10b981',
  reviews: '#8b5cf6',
  surveys: '#06b6d4',
  banned: '#ef4444',
  online: '#22c55e',
  owners: '#7c22ce',
};

export const PIE_COLORS = ['#3b82f6', '#a855f7', '#10b981', '#8b5cf6', '#06b6d4', '#7c22ce', '#ec4899'];

export const BAN_REASONS = [
  'Contenido inapropiado', 'Spam', 'Comportamiento abusivo', 'Información falsa',
  'Violación de términos', 'Suplantación de identidad', 'Publicaciones ofensivas', 'Otro',
];

export const SIDEBAR_GROUPS: { label: string; items: { id: Section; label: string; icon: React.ReactNode }[] }[] = [
  { label: 'PRINCIPAL', items: [{ id: 'dashboard' as Section, label: 'Dashboard', icon: LayoutDashboard }] },
  {
    label: 'CONTENIDO',
    items: [
      { id: 'places' as Section, label: 'Lugares', icon: MapPin },
      { id: 'events' as Section, label: 'Eventos', icon: Calendar },
      { id: 'reviews' as Section, label: 'Reseñas', icon: MessageSquare },
    ],
  },
  {
    label: 'GESTIÓN',
    items: [
      { id: 'users' as Section, label: 'Usuarios', icon: Users },
      { id: 'reports' as Section, label: 'Reportes', icon: Flag },
      { id: 'moderation' as Section, label: 'Moderación IA', icon: ShieldAlert },
      { id: 'verifications' as Section, label: 'Verificaciones', icon: BadgeCheck },
      { id: 'businesses' as Section, label: 'Negocios', icon: Store },
      { id: 'system' as Section, label: 'Sistema', icon: Activity },
    ],
  },
  {
    label: 'CRECIMIENTO',
    items: [
      { id: 'marketing' as Section, label: 'Marketing', icon: Megaphone },
    ],
  },
];

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  place: 'Lugar',
  event: 'Evento',
  post: 'Post de negocio',
  survey: 'Encuesta',
  announcement: 'Anuncio',
};

export const DOCS_BADGE: Record<string, { label: string; cls: string }> = {
  approved: { label: 'Verificado', cls: 'bg-gradient-to-r from-amber-400 to-amber-500 text-white' },
  pending:  { label: 'En revisión', cls: 'bg-blue-100 text-blue-700' },
  rejected: { label: 'Rechazado', cls: 'bg-stone-100 text-stone-500' },
  none:     { label: 'Emergente', cls: 'bg-stone-100 text-stone-500' },
};

export const AUDIENCES: { id: string; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Todos', desc: 'Toda la base de usuarios', icon: Users },
  { id: 'owners', label: 'Dueños de negocio', desc: 'Cuentas con rol de dueño', icon: Store },
  { id: 'non_owners', label: 'Usuarios (no dueños)', desc: 'Clientes / exploradores', icon: Users },
  { id: 'identity_verified', label: 'Identidad verificada', desc: 'Persona real confirmada', icon: BadgeCheck },
  { id: 'business_verified', label: 'Negocios verificados', desc: 'Con insignia dorada', icon: BadgeCheck },
  { id: 'specific', label: 'Específicos', desc: 'Elegís a mano', icon: Users },
];
