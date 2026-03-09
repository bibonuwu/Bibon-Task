import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

// ── VAPID key ───────────────────────────────────────────
// You need to generate this in Firebase Console:
// Project Settings → Cloud Messaging → Web Push certificates → Generate key pair
// Then paste it here or use an env variable.
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

// ── Get FCM token ───────────────────────────────────────
// Registers the service worker, requests permission, and returns the FCM token.
// Stores the token in Firestore so your backend (Cloud Functions) can send push.

export async function requestFCMToken(userId: string): Promise<string | null> {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("FCM not supported in this browser");
      return null;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    const messaging = getMessaging();
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      // Save token to Firestore for Cloud Functions to use
      await setDoc(doc(db, "fcmTokens", userId), {
        token,
        userId,
        updatedAt: new Date().toISOString(),
        platform: detectPlatform(),
      });
      console.log("FCM token saved:", token.slice(0, 20) + "...");
    }

    return token;
  } catch (error) {
    console.error("Failed to get FCM token:", error);
    return null;
  }
}

// ── Remove token ────────────────────────────────────────

export async function removeFCMToken(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "fcmTokens", userId));
  } catch (error) {
    console.error("Failed to remove FCM token:", error);
  }
}

// ── Listen for foreground messages ──────────────────────
// When the app is open and focused, service worker doesn't show notifications.
// We handle them here instead.

export function onForegroundMessage(callback: (payload: any) => void): () => void {
  try {
    const messaging = getMessaging();
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message:", payload);
      callback(payload);
    });
    return unsubscribe;
  } catch {
    return () => {};
  }
}

// ── Detect platform ─────────────────────────────────────

function detectPlatform(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("android")) return "android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "ios";
  if (ua.includes("windows")) return "windows";
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux")) return "linux";
  return "unknown";
}
