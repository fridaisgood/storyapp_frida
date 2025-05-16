import CONFIG from '../config.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export async function subscribeUserToPush(registration, token) {
  try {
    const convertedVapidKey = urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    const { endpoint, keys } = subscription.toJSON();
    const body = JSON.stringify({ endpoint, keys });

    const res = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!res.ok) {
      console.error('❌ Gagal subscribe:', res.status);
      await subscription.unsubscribe();
      return false;
    }

    console.log('✅ Push subscription sent to server.');
    return true;
  } catch (error) {
    console.error('❌ Push subscription error:', error);
    return false;
  }
}

export async function unsubscribeUserFromPush(registration, token) {
  try {
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return true;

    const res = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    if (!res.ok) {
      console.error('❌ Gagal unsubscribe:', res.status);
      return false;
    }

    await subscription.unsubscribe();
    console.log('🚫 Unsubscribed');
    return true;
  } catch (error) {
    console.error('❌ Unsubscribe error:', error);
    return false;
  }
}

export async function isUserSubscribed() {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  return !!subscription;
}
