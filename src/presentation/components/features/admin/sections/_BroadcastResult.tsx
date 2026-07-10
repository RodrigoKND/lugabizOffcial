import { Bell, BellRing, Smartphone, AlertTriangle } from 'lucide-react';
import type { BroadcastResult } from '@lib/supabase';

export function BroadcastResultDisplay({ result }: { result: BroadcastResult }) {
  return (
    <div className="rounded-xl border border-stone-200 p-4 space-y-2 bg-stone-50">
      <p className="text-sm font-semibold text-stone-700">Resultado del envío</p>
      <p className="text-xs text-stone-500">Audiencia: <b>{result.recipients}</b> destinatario(s).</p>
      <p className="text-xs text-green-600 flex items-center gap-1"><Bell className="w-3 h-3" /> {result.inApp} aviso(s) en la campana.</p>
      <p className="text-xs flex items-center gap-1">
        <BellRing className="w-3 h-3 text-stone-400" />
        <span className="text-green-600 font-semibold">{result.pushSent} push entregado(s)</span>
        {result.push && result.push.failed > 0 && <span className="text-red-500 font-semibold"> · {result.push.failed} fallaron</span>}
        {result.push && <span className="text-stone-400"> · {result.push.subscriptions} suscripción(es) hallada(s)</span>}
      </p>
      {result.push && result.push.subscriptions === 0 && (
        <p className="text-[11px] text-stone-400">No hay suscripciones push para esta audiencia. El usuario debe entrar a Lugabiz y aceptar las notificaciones del navegador (en iPhone, además, agregar la app a la pantalla de inicio).</p>
      )}
      <p className="text-xs flex items-center gap-1">
        <Smartphone className="w-3 h-3 text-stone-400" />
        <span className="text-green-600 font-semibold">{result.fcmSent} push a la app móvil</span>
        {result.fcm && result.fcm.failed > 0 && <span className="text-red-500 font-semibold"> · {result.fcm.failed} fallaron</span>}
        {result.fcm && <span className="text-stone-400"> · {result.fcm.tokens} token(s) FCM hallado(s)</span>}
      </p>
      {result.fcm && result.fcm.errors.length > 0 && (
        <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg p-2 space-y-1">
          <p className="font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Push de la app móvil (FCM):</p>
          {result.fcm.errors.map((e, i) => <p key={i} className="font-mono leading-snug">{e}</p>)}
          <p className="text-stone-500 mt-1">Falta el secret <b>FIREBASE_SERVICE_ACCOUNT</b> en Supabase, o el token está vencido (se limpia solo).</p>
        </div>
      )}
      {result.push && result.push.errors.length > 0 && (
        <div className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg p-2 space-y-1">
          <p className="font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> El navegador rechazó el push:</p>
          {result.push.errors.map((e, i) => <p key={i} className="font-mono leading-snug">{e}</p>)}
          <p className="text-stone-500 mt-1">Un <b>403</b> casi siempre significa que las claves <b>VAPID</b> del servidor no coinciden con la pública que usa la app. Un <b>410/404</b> = suscripción vencida (se limpia sola).</p>
        </div>
      )}
    </div>
  );
}
