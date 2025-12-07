import { useEffect, useState } from "react";

// 1. SINGLE RESPONSIBILITY: Separar las responsabilidades en funciones puras
const NOTIFICATION_SUPPORTED = "Notification" in window;

const requestPermissionNotification = async (): Promise<NotificationPermission | undefined> => {
  try {
    if (!NOTIFICATION_SUPPORTED) return undefined;
    return await Notification.requestPermission();
  } catch (e) {
    console.log(e);
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

const localStorageService: StorageService = {
  save: (key: string, value: string) => {
    if (!key || !value) return;
    try {
      const data = {
        value,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  get: (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data).value : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }
};

const saveNotification = (key: string, value: string, storage: StorageService): void => {
  if (!key || !value) return;
  storage.save(key, value);
};

const getNotificationStatus = (key: string, storage: StorageService): string | null => {
  if (!key) return null;
  return storage.get(key);
};

const createNotificationService = (storage: StorageService) => {
  return {
    savePermission: (permission: string) => {
      saveNotification('notification_permission', permission, storage);
    },
    getPermission: (): string | null => {
      return getNotificationStatus('notification_permission', storage);
    },
    getMessage: (): string | null => {
      return getNotificationStatus('notification_message', storage);
    }
  };
};

const notificationService = createNotificationService(localStorageService);

export const useNotifications = () => {
  const [resultNotification, setResultNotification] = useState<string>("");
  const [savedPermission, setSavedPermission] = useState<string | null>(null);

  useEffect(() => {
    const previousPermission = notificationService.getPermission();
    if (previousPermission) {
      setSavedPermission(previousPermission);
      return;
    }

    const requestPermission = async () => {
      const permission = await requestPermissionNotification();
      
      if (permission) {
        const message = permissionMessage(permission);
        setResultNotification(message);
        
        notificationService.savePermission(permission);
        setSavedPermission(permission);
      }
    };

    requestPermission();
  }, []);

  return { 
    resultNotification, 
    savedPermission 
  };
};