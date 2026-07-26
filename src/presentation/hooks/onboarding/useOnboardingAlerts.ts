import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@presentation/context';
import { authService } from '@lib/supabase';

const LS_LOGIN_KEY = '_lugabiz_login_dismissed';

type OnboardingStep = 'login' | 'notifications' | 'geolocation' | 'done';

// For unauthenticated users we only track whether they dismissed the login popup
function getLoginDismissed(): boolean {
  try { return localStorage.getItem(LS_LOGIN_KEY) === '1'; } catch { return false; }
}
function setLoginDismissed() {
  try { localStorage.setItem(LS_LOGIN_KEY, '1'); } catch { /* intentional */ }
}

export function useOnboardingAlerts() {
  const { user, isLoading, showPreferences } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [ready, setReady] = useState(false);
  const [localStep, setLocalStep] = useState<OnboardingStep>('login');
  // En memoria, NO persistido: una vez descartado/completado un paso, evita que
  // se re-muestre por eventos de auth (ej. refresh de token) MIENTRAS la página
  // sigue montada. Al recargar la página se resetea solo (es una variable JS
  // nueva), así cada carga vuelve a evaluar el estado real (DB para
  // notif/geoDismissed, localStorage solo para el paso de login).
  const sessionDoneRef = useRef(false);

  // Wait for auth to resolve + small buffer before showing popups
  useEffect(() => {
    if (isLoading) return;
    const t = setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(t);
  }, [isLoading]);

  // Sync local step from user profile (DB) or localStorage for unauthenticated
  useEffect(() => {
    if (isLoading) return;

    // If already dismissed in this session, never override localStep back to a popup
    if (sessionDoneRef.current) {
      setLocalStep('done');
      return;
    }

    if (!user) {
      setLocalStep(getLoginDismissed() ? 'done' : 'login');
      return;
    }

    // Authenticated: compute step from DB columns
    const dbStep = (user.onboardingStep ?? 'login') as OnboardingStep;
    let step = dbStep;

    // Advance past login since user is authenticated
    if (step === 'login') step = 'notifications';

    // Skip notifications if already granted or dismissed in DB
    if (step === 'notifications') {
      const notifAvailable = typeof window !== 'undefined' && 'Notification' in window;
      if (!notifAvailable || Notification.permission === 'granted' || user.notifDismissed) {
        step = 'geolocation';
      }
    }

    // Skip geolocation if already dismissed in DB
    if (step === 'geolocation' && user.geoDismissed) {
      step = 'done';
    }

    setLocalStep(step);
  }, [user, isLoading]);

  const saveToDb = useCallback((step: OnboardingStep, notifDismissed: boolean, geoDismissed: boolean) => {
    if (user) {
      authService.updateOnboardingState(user.id, step, notifDismissed, geoDismissed).catch(() => {});
    }
  }, [user]);

  const handleAction = useCallback(() => {
    if (localStep === 'login') {
      setLoginDismissed();
      sessionDoneRef.current = true;
      setLocalStep('done');
      setShowAuthModal(true);
      return;
    }

    if (localStep === 'notifications') {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        Notification.requestPermission().then(() => {
          const next = 'geolocation' as OnboardingStep;
          setLocalStep(next);
          saveToDb(next, true, user?.geoDismissed ?? false);
        });
      } else {
        const next = 'geolocation' as OnboardingStep;
        setLocalStep(next);
        saveToDb(next, true, user?.geoDismissed ?? false);
      }
      return;
    }

    if (localStep === 'geolocation') {
      sessionDoneRef.current = true;
      setLocalStep('done');
      saveToDb('done', user?.notifDismissed ?? false, true);
      // Request permission in background after popup closes
      if (typeof window !== 'undefined' && navigator.geolocation) {
        sessionStorage.setItem('_lugabiz_geo_started', 'true');
        navigator.geolocation.getCurrentPosition(() => {}, () => {}, { timeout: 10000 });
      }
      return;
    }
  }, [localStep, user, saveToDb]);

  const handleDismiss = useCallback(() => {
    if (localStep === 'login') {
      setLoginDismissed();
      sessionDoneRef.current = true;
      setLocalStep('done');
      return;
    }
    if (localStep === 'notifications') {
      const next = 'geolocation' as OnboardingStep;
      setLocalStep(next);
      saveToDb(next, true, user?.geoDismissed ?? false);
      return;
    }
    if (localStep === 'geolocation') {
      sessionDoneRef.current = true;
      setLocalStep('done');
      saveToDb('done', user?.notifDismissed ?? false, true);
      return;
    }
  }, [localStep, user, saveToDb]);

  // Determine which step to actually show
  const effectiveStep = (() => {
    if (!ready || localStep === 'done') return null;
    if (localStep === 'login' && user) return null;
    if ((localStep === 'notifications' || localStep === 'geolocation') && !user) return null;
    // Block onboarding while the preferences modal is still open (new-user flow)
    if (showPreferences) return null;
    return localStep;
  })();

  return {
    currentStep: effectiveStep,
    showAuthModal,
    setShowAuthModal,
    handleAction,
    handleDismiss,
  };
}
