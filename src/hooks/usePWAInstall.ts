import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface UsePWAInstallReturn {
  showPrompt: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  handleInstall: () => Promise<void>;
  dismissPrompt: () => void;
  deferredPrompt: BeforeInstallPromptEvent | null;
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }

      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }

      const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
      if (wasInstalled) {
        setIsInstalled(true);
        return true;
      }

      return false;
    };

    if (checkIfInstalled()) {
      return;
    }

    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);

      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
        setIsInstalled(true);
      } else {
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  return {
    showPrompt,
    isInstallable,
    isInstalled,
    handleInstall,
    dismissPrompt,
    deferredPrompt
  };
}