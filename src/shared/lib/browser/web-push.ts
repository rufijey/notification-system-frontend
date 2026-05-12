import { $api } from '../../api/base';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerAndSubscribePush(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Web Push] This browser does not support Service Workers or Push Notifications.');
    return;
  }

  try {
    const env = import.meta.env.MODE;
    const cacheEnabled = import.meta.env.VITE_SW_CACHE_ENABLED === 'true';
    const registration = await navigator.serviceWorker.register(`/sw.js?env=${env}&cache_enabled=${cacheEnabled}`);
    console.log(`[Web Push] Service Worker registered successfully (Env: ${env}, Cache Enabled: ${cacheEnabled}):`, registration);

    await navigator.serviceWorker.ready;

    const vapidResponse = await $api('/notifications/push/vapid-key');
    if (!vapidResponse.ok) {
      throw new Error(`Failed to load VAPID public key: ${vapidResponse.statusText}`);
    }

    const { publicKey } = await vapidResponse.json();

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      console.log('[Web Push] Subscription not found. Requesting a new subscription...');
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as unknown as BufferSource,
      });
    }

    const subscribeResponse = await $api('/notifications/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!subscribeResponse.ok) {
      throw new Error(`Failed to save subscription on backend: ${subscribeResponse.statusText}`);
    }

    console.log('[Web Push] User successfully subscribed to Web Push notifications!');
  } catch (error) {
    console.error('[Web Push] Error during registration/subscription process:', error);
  }
}
