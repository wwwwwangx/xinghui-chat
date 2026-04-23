self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '沈星回';
  const options = {
    body: data.body || '他发消息了，快去看看',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'xinghui-msg',
    renotify: true,
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes('/chat/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/chat/1');
      }
    })
  );
});