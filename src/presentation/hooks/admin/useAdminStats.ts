import { useState, useEffect } from 'react';
import {
  Users, MapPin, CalendarDays, MessageSquare,
  ClipboardList, Bell
} from 'lucide-react';
import { adminService } from '@lib/supabase';
import type { AdminStats, StatCardItem } from '@domain/entities/AdminPanelTypes';

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (err) {
        console.error('Error loading admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const statCards: StatCardItem[] = [
    { label: 'Usuarios', value: stats?.users || 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Lugares', value: stats?.places || 0, icon: MapPin, color: 'bg-amber-50 text-amber-600' },
    { label: 'Eventos', value: stats?.events || 0, icon: CalendarDays, color: 'bg-green-50 text-green-600' },
    { label: 'Reseñas', value: stats?.reviews || 0, icon: MessageSquare, color: 'bg-purple-50 text-purple-600' },
    { label: 'Encuestas', value: stats?.surveys || 0, icon: ClipboardList, color: 'bg-teal-50 text-teal-600' },
    { label: 'Notificaciones', value: stats?.notifications || 0, icon: Bell, color: 'bg-rose-50 text-rose-600' },
  ];

  return { stats, loading, statCards };
}
