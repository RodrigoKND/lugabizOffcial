import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@presentation/context';
import { authService } from '@lib/supabase';

const LS_LOGIN_KEY = '_lugabiz_login_dismissed';
const SS_DONE_KEY = '_lugabiz_onboarding_done';

type OnboardingStep = 'login' | 'notifications' | 'geolocation' | 'done';

// For unauthenticated users we only track whether they dismissed the login popup
function getLoginDismissed(): boolean {
  try { return localStorage.getItem(LS_LOGIN_KEY) === '1'; } catch { return false; }
}
function setLoginDismissed() {
  try { localStorage.setItem(LS_LOGIN_KEY, '1'); } catch {}
}
// Session-level flag: prevents the popup from re-showing after dismissal even if user
// object is refreshed by auth events (e.g. token renewal) during the same session
function getSessionDone(): boolean {
  try { return sessionStorage.getItem(SS_DONE_KEY) === '1'; } catch { return false; }
}
function setSessionDone() {
  try { sessionStorage.setItem(SS_DONE_KEY, '1'); } catch {}
}

export function useOnboardingAlerts() {
  const { user, isLoading, showPreferences } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [ready, setReady] = useState(false);
  const [localStep, setLocalStep] = useState<OnboardingStep>('login');
  // Once the user dismisses any step in this session, lock to 'done' so auth
  // token-refresh events don't cause the popup to reappear
  const sessionDoneRef = useRef(getSessionDone());

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
      setShowAuthModal(true);
      return;
    }

    if (localStep === 'notifications') {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        Notification.requestPermission().then(perm => {
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
      setSessionDone();
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
      setSessionDone();
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
      setSessionDone();
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
