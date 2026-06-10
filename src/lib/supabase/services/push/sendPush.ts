export async function sendBrowserPush(title: string, body: string, url?: string, data?: Record<string, unknown>) {
  if (!('serviceWorker' in navigator)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      icon: '/L.ico',
      badge: '/L.ico',
      vibrate: [200, 100, 200],
      data: { url: url || '/', ...data },
    });
  } catch {}
}

export async function sendSurveyPushNotification(surveyId: string, surveyTitle: string) {
  const title = 'Nueva encuesta disponible';
  const body = `"${surveyTitle}" — danos tu opinión`;
  const url = '/';
  await sendBrowserPush(title, body, url, { surveyId });
}

export async function sendAnnouncementPushNotification(announcementTitle: string, announcementBody: string) {
  const title = `📢 ${announcementTitle}`;
  const body = announcementBody;
  await sendBrowserPush(title, body, '/');
}
