import { useEffect, useState, useRef } from "react";

const NOTIFICATION_SUPPORTED = "Notification" in window;

const requestPermissionNotification = async (): Promise<NotificationPermission | undefined> => {
  try {
    if (!NOTIFICATION_SUPPORTED) return undefined;
    return await Notification.requestPermission();
  } catch {
    return undefined;
  }
};

const MESSAGE_NOTIFICATIONS_SUPPORTED = {
  granted: "¡Gracias por permitir las notificaciones! Te mantendremos informado.",
  denied: "Entendemos que prefieres no recibir notificaciones. Puedes activarlas luego en la configuración de tu navegador.",
  default: "No has decidido sobre las notificaciones. Puedes cambiarlo cuando quieras en la configuración",
} as const;

const permissionMessage = (permission: NotificationPermission): string => {
  if (!permission) throw new Error("Permission is undefined");
  return MESSAGE_NOTIFICATIONS_SUPPORTED[permission];
};

interface StorageService {
  save(key: string, value: string): void;
  get(key: string): string | null;
}

const sessionStorageService: StorageService = {
  save: (key: string, value: string) => {
    if (!key || !value) return;
    try {
      const data = {
        value,
        timestamp: new Date().toISOString()
      };
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  },
  get: (key: string) => {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data).value : null;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return null;
    }
  }
};

const createNotificationService = (storage: StorageService) => {
  return {
    savePermission: (permission: string) => {
      storage.save('notification_permission', permission);
    },
    getPermission: (): string | null => {
      return storage.get('notification_permission');
    },
    saveMessageShown: () => {
      storage.save('notification_message_shown', 'true');
    },
    wasMessageShown: (): boolean => {
      return storage.get('notification_message_shown') === 'true';
    }
  };
};

const notificationService = createNotificationService(sessionStorageService);

export function useNotifications() {
  const [resultNotification, setResultNotification] = useState<string>("");
  const [savedPermission, setSavedPermission] = useState<string | null>(null);
  const hasRequestedPermission = useRef(false);

  useEffect(() => {
    if (notificationService.wasMessageShown()) {
      const savedPerm = notificationService.getPermission();
      if (savedPerm) {
        setSavedPermission(savedPerm);
      }
      return;
    }

    if (hasRequestedPermission.current) return;
    hasRequestedPermission.current = true;

    const requestPermission = async () => {
      const previousPermission = notificationService.getPermission();
      if (previousPermission) {
        setSavedPermission(previousPermission);
        notificationService.saveMessageShown();
        return;
      }

      if (Notification.permission !== "default") {
        setSavedPermission(Notification.permission);
        notificationService.savePermission(Notification.permission);
        notificationService.saveMessageShown();
        return;
      }

      const permission = await requestPermissionNotification();
      
      if (permission) {
        const message = permissionMessage(permission);
        setResultNotification(message);
        notificationService.savePermission(permission);
        notificationService.saveMessageShown();
        setSavedPermission(permission);

        setTimeout(() => {
          setResultNotification("");
        }, 5000);
      }
    };

    requestPermission();
  }, []);

  return { 
    resultNotification, 
    savedPermission 
  };
}