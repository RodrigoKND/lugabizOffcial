import { useState, useEffect, useCallback } from 'react';
import { User } from '@domain/entities';
import { AppNotification } from '@domain/entities';
import { supabase, authService, savedPlacesService, notificationsService } from '@lib/supabase';
import { tracking, setTrackingUser } from '@infrastructure/utils/tracking';
import { sendBrowserPush } from '@lib/supabase/services/push/sendPush';
import { userActivityService } from '@lib/supabase/services/places/userActivity';
import { AuthContextType } from '@domain/entities/AuthContextTypes';
import toast from 'react-hot-toast';

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [banInfo, setBanInfo] = useState<{ reason: string } | null>(null);

  const loadUserDataAndRelated = async (userId: string) => {
    let userProfile: User;
    try {
      userProfile = await authService.getUserProfile(userId);
    } catch {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const name =
          currentUser?.user_metadata?.full_name ||
          currentUser?.user_metadata?.name ||
          currentUser?.email?.split('@')[0] ||
          'Usuario';
        const email = currentUser?.email || '';
        await authService.createUserProfile(userId, name, email);
      } catch (e) {
        console.error('Could not create user profile, may already exist:', e);
      }
      userProfile = await authService.getUserProfile(userId);
    }

    if (userProfile.banned) {
      // Registrar intento de acceso bloqueado en la DB (audit permanente)
      userActivityService.trackAction(userId, 'banned_login_blocked', {
        ban_reason: userProfile.banReason,
        blocked_at: new Date().toISOString(),
      }).catch(() => {});

      await authService.signOut();
      setUser(null);
      setTrackingUser(null);
      setIsLoading(false);
      setBanInfo({ reason: userProfile.banReason || 'Violación de términos' });
      return null;
    }

    setUser(userProfile);
    setTrackingUser(userId);

    try {
      const role = await authService.getUserRole(userId);
      setIsAdmin(role === 'admin');
    } catch (e) {
      console.error('Error loading role:', e);
    }

    try {
      const userSavedPlaces = await savedPlacesService.getSavedPlaces(userId);
      setSavedPlaces(userSavedPlaces);
    } catch (e) {
      console.error('Error loading saved places:', e);
    }

    try {
      const userNotifs = await notificationsService.getNotifications(userId);
      setNotifications(userNotifs);
      setUnreadCount(userNotifs.filter(n => !n.read).length);
    } catch (e) {
      console.error('Error loading notifications:', e);
    }

    // Show preferences only for truly new users: created < 10 min ago AND no saved preferences yet
    const prefsDone = sessionStorage.getItem('_lugabiz_prefs_done') === '1';
    if (!prefsDone) {
      const { count } = await supabase
        .from('user_category_preferences')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      if ((count ?? 0) > 0) {
        sessionStorage.setItem('_lugabiz_prefs_done', '1');
      } else {
        const tenMinAgo = Date.now() - 10 * 60 * 1000;
        if (userProfile.createdAt.getTime() > tenMinAgo) {
          setShowPreferences(true);
        }
      }
    }

    return userProfile;
  };

  const clearAuthState = useCallback(() => {
    setUser(null);
    setTrackingUser(null);
    setSavedPlaces([]);
    setIsAdmin(false);
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const dismissBan = useCallback(() => {
    setBanInfo(null);
    localStorage.clear();
    window.location.href = '/';
  }, []);

  useEffect(() => {
    let mounted = true;
    let userLoaded = false;

    const handleSupabaseUser = async (supaUser: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at: string }) => {
      if (userLoaded) return;
      userLoaded = true;

      // Verificar que la sesión sigue activa antes de cargar datos.
      // Si el usuario fue baneado durante el login, loadUserData ya hizo signOut
      // y esta sesión ya no existe — en ese caso no debemos sobrescribir el estado.
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      if (!activeSession || !mounted) {
        userLoaded = false;
        return;
      }

      try {
        await loadUserDataAndRelated(supaUser.id);
      } catch (e) {
        console.error('[Auth] loadUserDataAndRelated failed, fallback:', e);
        // Solo usar fallback si hay sesión activa y el usuario no está baneado
        const { data: { session: stillActive } } = await supabase.auth.getSession();
        if (mounted && stillActive) {
          setUser({
            id: supaUser.id,
            name: (supaUser.user_metadata?.full_name as string) || (supaUser.user_metadata?.name as string) || supaUser.email?.split('@')[0] || 'Usuario',
            email: supaUser.email || '',
            avatar: (supaUser.user_metadata?.avatar_url as string) || (supaUser.user_metadata?.picture as string),
            isOwner: false,
            banned: false,
            createdAt: new Date(supaUser.created_at),
          });
          setTrackingUser(supaUser.id);
        }
      }
    };

    // IMPORTANTE: No usar async/await directamente en este callback ni llamar
    // a supabase.from() aquí dentro. En Supabase 2.x el SDK mantiene un lock
    // interno durante el evento y cualquier query a la DB causa un deadlock.
    // La solución es diferir las llamadas con setTimeout(0).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          const u = session.user;
          setTimeout(() => { if (mounted) handleSupabaseUser(u).finally(() => { if (mounted) setIsLoading(false); }); }, 0);
        } else {
          setIsLoading(false);
        }
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        userLoaded = false;
        const u = session.user;
        setTimeout(() => { if (mounted) handleSupabaseUser(u); }, 0);
        return;
      }

      if (event === 'SIGNED_OUT') {
        userLoaded = false;
        clearAuthState();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user && !userLoaded) {
        handleSupabaseUser(session.user).finally(() => { if (mounted) setIsLoading(false); });
      } else {
        if (mounted) setIsLoading(false);
      }
    }).catch(() => { if (mounted) setIsLoading(false); });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [clearAuthState]);

  // Realtime notifications
  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationsService.subscribeToNotifications(user.id, (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Detección de baneo en tiempo real: cerrar sesión y mostrar modal
      if (notif.type === 'system' && notif.data?.ban_reason) {
        setTimeout(async () => {
          await authService.signOut();
          clearAuthState();
          localStorage.clear();
          setBanInfo({ reason: notif.data?.ban_reason as string || 'Violación de términos' });
        }, 800);
        return;
      }

      // Verificación resuelta por el admin (identidad o documentos de negocio) →
      // re-leemos el perfil EN TIEMPO REAL para que la insignia aparezca/cambie al
      // instante (la dorada "Negocio verificado" solo tras aprobar, nunca antes),
      // sin que el usuario tenga que recargar ni volver a iniciar sesión.
      if (notif.type === 'system' && (notif.data?.kind === 'identity' || notif.data?.kind === 'business_docs')) {
        authService.getUserProfile(user.id)
          .then(fresh => setUser(prev => (prev ? { ...prev, ...fresh } : fresh)))
          .catch(() => {});
      }

      // nearby_push es solo registro de deduplicación (read:true), no mostrar
      if ('Notification' in window && Notification.permission === 'granted' && notif.type !== 'nearby_push') {
        const url = (notif.data?.url as string) || '/';
        const prefix = notif.type === 'owner_announcement' ? '📢 ' : '';
        // sendBrowserPush usa el SW → notificationclick maneja el redirect correctamente
        sendBrowserPush(`${prefix}${notif.title}`, notif.body || '', url);
      }
    });

    return unsubscribe;
  }, [user]);

  // Usado solo por login con email/password donde el SIGNED_IN puede no re-cargar datos adicionales
  // Retorna true si el usuario estaba baneado (no se debe continuar el login)
  const loadUserData = async (userId: string): Promise<boolean> => {
    const userProfile = await authService.getUserProfile(userId);

    if (userProfile.banned) {
      userActivityService.trackAction(userId, 'banned_login_blocked', {
        ban_reason: userProfile.banReason,
        blocked_at: new Date().toISOString(),
      }).catch(() => {});

      await authService.signOut();
      setUser(null);
      setIsLoading(false);
      setBanInfo({ reason: userProfile.banReason || 'Violación de términos' });
      return true;
    }

    setUser(userProfile);
    try {
      const role = await authService.getUserRole(userId);
      setIsAdmin(role === 'admin');
    } catch (e) {
      console.error('Error loading role:', e);
    }
    try {
      const userSavedPlaces = await savedPlacesService.getSavedPlaces(userId);
      setSavedPlaces(userSavedPlaces);
    } catch (e) {
      console.error('Error loading saved places:', e);
    }
    try {
      const userNotifs = await notificationsService.getNotifications(userId);
      setNotifications(userNotifs);
      setUnreadCount(userNotifs.filter(n => !n.read).length);
    } catch (e) {
      console.error('Error loading notifications:', e);
    }
    const prefsDone = sessionStorage.getItem('_lugabiz_prefs_done') === '1';
    if (!prefsDone) {
      const { count } = await supabase
        .from('user_category_preferences')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      if ((count ?? 0) > 0) {
        sessionStorage.setItem('_lugabiz_prefs_done', '1');
      } else {
        const tenMinAgo = Date.now() - 10 * 60 * 1000;
        if (userProfile.createdAt.getTime() > tenMinAgo) {
          setShowPreferences(true);
        }
      }
    }
    return false;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { user: authUser } = await authService.signIn(email, password);
      if (authUser) {
        const wasBanned = await loadUserData(authUser.id);
        if (wasBanned) return false;
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    setIsLoading(false);
    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      // signInWithOAuth con redirect no retorna un usuario — redirige la página.
      // El usuario se carga cuando Supabase emite INITIAL_SESSION al volver del redirect.
      // Esta función solo inicia el flujo; no hay nada más que hacer aquí.
      const data = await authService.signInWithGoogle();
      return !!data;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean }> => {
    setIsLoading(true);
    try {
      const { user: authUser } = await authService.signUp(name, email, password);
      setIsLoading(false);
      if (!authUser) return { success: false };
      if (!authUser.email_confirmed_at) {
        window.location.href = '/confirmation';
        return { success: true };
      }
      tracking.trackAction('register', { userId: authUser.id });
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return { success: false };
    }
  };

  const resendConfirmation = async (email: string): Promise<boolean> => {
    try {
      return await authService.resendConfirmation(email);
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      clearAuthState();
      setIsNewUser(false);
      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const toggleSavedPlace = async (placeId: string) => {
    if (!user) return;
    try {
      const newIsSaved = await savedPlacesService.toggleSavePlace(user.id, placeId);
      setSavedPlaces(prev =>
        newIsSaved ? [...prev, placeId] : prev.filter(id => id !== placeId)
      );
    } catch (error) {
      console.error('Error toggling saved place:', error);
    }
  };

  const isSaved = (placeId: string) => savedPlaces.includes(placeId);

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    try {
      const updated = await authService.updateUserProfile(user.id, updates);
      setUser(prev => prev ? { ...prev, ...updated } : null);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }, [user]);

  // Re-lee el perfil desde la DB y actualiza el estado. Necesario para que las
  // banderas que solo cambia el backend (identity_verified, business_docs_verified,
  // is_owner) se reflejen sin tener que cerrar sesión — p. ej. la insignia dorada
  // que aparece cuando el admin aprueba los documentos de un negocio.
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!user) return;
    try {
      const fresh = await authService.getUserProfile(user.id);
      setUser(prev => prev ? { ...prev, ...fresh } : fresh);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, [user]);

  const uploadAvatar = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;
    try {
      const url = await authService.uploadAvatar(user.id, file);
      setUser(prev => prev ? { ...prev, avatar: url } : null);
      return url;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  }, [user]);

  const markNotifAsRead = async (id: string) => {
    await notificationsService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllNotifsAsRead = async () => {
    if (!user) return;
    await notificationsService.markAllAsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return {
    user,
    login,
    loginWithGoogle,
    register,
    logout,
    isLoading,
    savedPlaces,
    toggleSavedPlace,
    isSaved,
    isNewUser,
    showPreferences,
    setShowPreferences,
    isAdmin,
    resendConfirmation,
    updateProfile,
    refreshUser,
    uploadAvatar,
    notifications,
    unreadCount,
    markNotifAsRead,
    markAllNotifsAsRead,
    banInfo,
    dismissBan,
  };
}