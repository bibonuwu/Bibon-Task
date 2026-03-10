// BibonTask — Firebase Messaging Service Worker
// Runs in background on Android Chrome, Desktop Chrome, Edge, Firefox.
// Receives FCM push and shows native OS notifications.

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

// ── Handle background push (data-only messages) ─────────
// Cloud Functions sends data-only messages so this handler ALWAYS fires,
// both on Android Chrome and Desktop browsers.

messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  // Data comes in payload.data (data-only message from Cloud Functions)
  const data = payload.data || {};

  // Also support display messages (payload.notification) as fallback
  const title = data.title || payload.notification?.title || "BibonTask";
  const body = data.body || payload.notification?.body || "You have a task reminder";
  const taskId = data.taskId || "bibontask";
  const url = data.url || "/dashboard";

  const options = {
    body: body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: taskId,
    data: { url: url, taskId: taskId },
    actions: [
      { action: "open", title: "Open" },
      { action: "done", title: "Mark Done" },
    ],
    requireInteraction: true,
    vibrate: [100, 50, 100, 50, 200],
    silent: false,
    renotify: true,
  };

  return self.registration.showNotification(title, options);
});

// ── Handle raw push events (fallback for Android) ───────
// Some Android browsers skip onBackgroundMessage, so we also listen
// to the raw push event as a safety net.

self.addEventListener("push", (event) => {
  // If Firebase SDK already handled it, skip
  if (event.__handled) return;

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.warn("[SW] Could not parse push data:", e);
    return;
  }

  // Only handle if Firebase SDK didn't (no notification shown yet)
  // Check if this is a data-only message that needs manual display
  if (data.data && !data.notification) {
    const d = data.data;
    const title = d.title || "BibonTask";
    const body = d.body || "You have a task reminder";

    const options = {
      body: body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: d.taskId || "bibontask",
      data: { url: d.url || "/dashboard" },
      vibrate: [100, 50, 100, 50, 200],
      requireInteraction: true,
      renotify: true,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  }
});

// ── Notification click handler ──────────────────────────

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      // Try to focus existing window
      for (const client of list) {
        if (client.url.includes("/dashboard") && "focus" in client) {
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(url);
    })
  );
});
