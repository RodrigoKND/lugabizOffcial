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
    // Verificar si ya está instalada la PWA
    const checkIfInstalled = () => {
      // Método 1: Verificar si está en standalone mode
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      
      // Método 2: Verificar la propiedad navigator (para iOS)
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }

      // Método 3: Verificar localStorage para trackear instalación manual
      const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
      if (wasInstalled) {
        setIsInstalled(true);
        return true;
      }

      return false;
    };

    // Si ya está instalada, no hacer nada más
    if (checkIfInstalled()) {
      return;
    }

    // Verificar si el usuario ya descartó el prompt recientemente
    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      // No mostrar el prompt si fue descartado hace menos de 7 días
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Listener para el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);

      // Mostrar el prompt después de 3 segundos
      // (para no interrumpir inmediatamente la experiencia)
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    // Listener para cuando la app es instalada
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
      console.log('PWA instalada exitosamente');
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
      console.warn('No hay prompt de instalación disponible');
      return;
    }

    try {
      // Mostrar el prompt nativo de instalación
      await deferredPrompt.prompt();
      
      // Esperar la respuesta del usuario
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Usuario aceptó instalar la PWA');
        localStorage.setItem('pwa-installed', 'true');
        setIsInstalled(true);
      } else {
        console.log('Usuario rechazó instalar la PWA');
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
      }
      
      // Limpiar el prompt
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error al instalar PWA:', error);
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