export interface NotificationOptions {
  vibrate?: number[];
  badge?: string;
  image?: string;
}

export interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  badge?: string;
  image?: string;
}

export interface NearbyPlace {
  emoji: string;
  name: string;
  distance: number;
  place: OverpassElement;
}

export interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
}