import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

// ── VAPID key ───────────────────────────────────────────
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

// ── Result type ─────────────────────────────────────────
export type FCMResult =
  | { success: true; token: string }
  | { success: false; error: string };

// ── Get FCM token ───────────────────────────────────────

export async function requestFCMToken(userId: string): Promise<FCMResult> {
  try {
    const supported = await isSupported();
    if (!supported) {
      return { success: false, error: "FCM not supported in this browser" };
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, error: `Notification permission: ${permission}` };
    }

    // Check VAPID key
    if (!VAPID_KEY) {
      return { success: false, error: "VAPID_KEY missing. Add NEXT_PUBLIC_FIREBASE_VAPID_KEY to env." };
    }

    // Register service worker
    let registration;
    try {
      registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      // Wait for the service worker to become active
      if (registration.installing) {
        await new Promise<void>((resolve) => {
          const sw = registration!.installing!;
          sw.addEventListener("statechange", () => {
            if (sw.state === "activated") resolve();
          });
        });
      } else if (registration.waiting) {
        await new Promise<void>((resolve) => {
          const sw = registration!.waiting!;
          sw.addEventListener("statechange", () => {
            if (sw.state === "activated") resolve();
          });
        });
      }
    } catch (swError: any) {
      return { success: false, error: `Service worker failed: ${swError.message}` };
    }

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

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
      return { success: true, token };
    } else {
      return { success: false, error: "getToken returned empty. Check Firebase project config." };
    }
  } catch (error: any) {
    return { success: false, error: `FCM error: ${error.message || error}` };
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

export function onForegroundMessage(callback: (payload: any) => void): () => void {
  try {
    const messaging = getMessaging();
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message:", payload);
      const normalized = {
        ...payload,
        notification: payload.notification || {
          title: payload.data?.title || "BibonTask",
          body: payload.data?.body || "",
        },
      };
      callback(normalized);
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
