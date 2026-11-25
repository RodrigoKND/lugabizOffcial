import type { CapacitorConfig } from '@capacitor/cli';

// La app nativa empaqueta el build de la web (carpeta dist). La web en Vercel no cambia.
const config: CapacitorConfig = {
  appId: 'com.lugabiz.app',
  appName: 'Lugabiz',
  webDir: 'dist',
  android: {
    // Sin esto Android corta las actualizaciones de ubicación a los 5 minutos en segundo plano
    // (requisito de @capacitor-community/background-geolocation).
    useLegacyBridge: true,
    allowMixedContent: false,
  },
  plugins: {
    // Las peticiones salen por la capa HTTP nativa: Android frena las del WebView tras 5 min en segundo plano
    // (por ejemplo, registrar un check-in cuando el usuario llega a un lugar con la app cerrada).
    CapacitorHttp: { enabled: true },
    PushNotifications: {
      // Cómo se muestran los push cuando la app está abierta: aviso, sonido y contador.
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
