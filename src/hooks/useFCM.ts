"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import { requestFCMToken, removeFCMToken, onForegroundMessage } from "@/lib/fcm";
import toast from "react-hot-toast";

export function useFCM() {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);

  // Check saved preference on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("bibontask-push-enabled");
    if (saved === "true") setEnabled(true);
  }, []);

  // Auto-register when enabled + user is logged in
  useEffect(() => {
    if (!user || !enabled || initialized.current) return;
    initialized.current = true;

    requestFCMToken(user.uid).then((token) => {
      if (token) {
        console.log("FCM registered");
      }
    });

    // Listen for foreground messages → show toast
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title || "BibonTask";
      const body = payload.notification?.body || "";
      toast(body, {
        icon: "🔔",
        duration: 6000,
        style: { fontWeight: 500 },
      });
    });

    return () => {
      unsubscribe();
      initialized.current = false;
    };
  }, [user, enabled]);

  // ── Toggle push on/off ────────────────────────────────

  const togglePush = async () => {
    if (!user) return;
    setLoading(true);

    try {
      if (enabled) {
        // Disable
        await removeFCMToken(user.uid);
        localStorage.setItem("bibontask-push-enabled", "false");
        setEnabled(false);
        initialized.current = false;
        toast.success("Push notifications disabled");
      } else {
        // Enable
        const token = await requestFCMToken(user.uid);
        if (token) {
          localStorage.setItem("bibontask-push-enabled", "true");
          setEnabled(true);
          toast.success("Push notifications enabled!");
        } else {
          toast.error("Could not enable notifications. Check browser permissions.");
        }
      }
    } catch {
      toast.error("Failed to update notification settings");
    } finally {
      setLoading(false);
    }
  };

  return { enabled, loading, togglePush };
}
