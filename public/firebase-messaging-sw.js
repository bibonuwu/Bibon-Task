// BibonTask — Firebase Messaging Service Worker
// Runs in background, receives FCM push, shows native OS notifications.

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBqWMZyJX5Cf2lrzbLAkMRsWtxwdjWNajY",
  authDomain: "bibonappx.firebaseapp.com",
  projectId: "bibonappx",
  storageBucket: "bibonappx.firebasestorage.app",
  messagingSenderId: "356833015902",
  appId: "1:356833015902:web:75a43f8a33f24f25a11ccf",
});

const messaging = firebase.messaging();

// ── Background push notifications ───────────────────────

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = payload.notification?.title || "BibonTask";
  const body = payload.notification?.body || "You have a task reminder";

  // Priority emoji for the notification
  const priorityIcon =
    data.priority === "high" ? "🔴 "
    : data.priority === "medium" ? "🟡 "
    : data.priority === "low" ? "🟢 "
    : "";

  const options = {
    body: `${body}`,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.taskId || "bibontask-reminder",
    data: { url: data.url || "/dashboard" },
    actions: [
      { action: "open", title: "Open" },
      { action: "done", title: "Mark Done" },
    ],
    requireInteraction: true,
    vibrate: [100, 50, 100, 50, 200],
    silent: false,
  };

  self.registration.showNotification(`${priorityIcon}${title}`, options);
});

// ── Notification click handler ──────────────────────────

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes("/dashboard") && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
