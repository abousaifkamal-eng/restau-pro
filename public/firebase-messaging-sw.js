// KamEat - Service Worker pour notifications push
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBMOYHEHuM3TQ5mTRIRTU0vUQqtShA8JnY",
  authDomain: "restau-pro.firebaseapp.com",
  projectId: "restau-pro",
  storageBucket: "restau-pro.firebasestorage.app",
  messagingSenderId: "572122108168",
  appId: "1:572122108168:web:929919fb152a1183c4dcbd"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || '🔔 KamEat', {
    body: body || 'Nouvelle commande !',
    icon: icon || 'https://i.imgur.com/hAaiZjt.png',
    badge: 'https://i.imgur.com/hAaiZjt.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'kameat-order',
    renotify: true,
    data: payload.data || {}
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('restau-pro') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('https://restau-pro-opal.vercel.app');
    })
  );
});
