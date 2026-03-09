/**
 * BibonTask Cloud Functions
 *
 * checkReminders — runs every minute via Cloud Scheduler.
 * Checks all tasks with upcoming reminders and sends push notifications
 * to the user's device via FCM.
 *
 * Deploy: firebase deploy --only functions
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

const db = getFirestore();
const messaging = getMessaging();

// Reminder offsets in minutes
const REMINDER_OFFSETS = {
  at_time: 0,
  "10min": 10,
  "30min": 30,
  "1hour": 60,
  "1day": 1440,
};

// ── Scheduled function: runs every minute ───────────────

exports.checkReminders = onSchedule("every 1 minutes", async () => {
  const now = new Date();
  const nowMs = now.getTime();

  // Get all non-done tasks with reminders
  const tasksSnap = await db
    .collection("tasks")
    .where("status", "in", ["todo", "in_progress"])
    .get();

  for (const taskDoc of tasksSnap.docs) {
    const task = taskDoc.data();

    // Skip tasks without date, time, or reminder
    if (!task.dueDate || !task.dueTime || !task.reminder || task.reminder === "none") {
      continue;
    }

    // Skip if already notified
    if (task.reminderSent) continue;

    // Calculate when reminder should fire
    const dueMs = new Date(`${task.dueDate}T${task.dueTime}`).getTime();
    const offsetMin = REMINDER_OFFSETS[task.reminder] ?? -1;
    if (offsetMin < 0) continue;

    const triggerMs = dueMs - offsetMin * 60 * 1000;

    // Check if it's time (within 90 second window)
    if (nowMs >= triggerMs && nowMs < triggerMs + 90 * 1000) {
      // Get user's FCM token
      const tokenDoc = await db.collection("fcmTokens").doc(task.userId).get();
      if (!tokenDoc.exists) continue;

      const { token } = tokenDoc.data();
      if (!token) continue;

      // Build notification
      const reminderText =
        task.reminder === "at_time"
          ? "is due now!"
          : `is due in ${formatOffset(task.reminder)}`;

      const message = {
        token,
        notification: {
          title: `⏰ ${task.title}`,
          body: `This task ${reminderText} (${task.dueTime})`,
        },
        data: {
          taskId: taskDoc.id,
          url: "/dashboard",
        },
        // Android-specific: high priority + notification channel
        android: {
          priority: "high",
          notification: {
            channelId: "task-reminders",
            icon: "ic_notification",
            color: "#4c6ef5",
            sound: "default",
            clickAction: "OPEN_DASHBOARD",
          },
        },
        // Windows/Web: needs no extra config, uses service worker
        webpush: {
          headers: { Urgency: "high" },
          notification: {
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            requireInteraction: true,
            actions: [
              { action: "open", title: "Open" },
              { action: "done", title: "Mark Done" },
            ],
          },
        },
      };

      try {
        await messaging.send(message);
        console.log(`Notification sent for task: ${task.title} → user: ${task.userId}`);

        // Mark as sent so we don't spam
        await taskDoc.ref.update({ reminderSent: true });
      } catch (err) {
        console.error(`Failed to send to ${task.userId}:`, err.message);

        // If token is invalid, clean it up
        if (
          err.code === "messaging/registration-token-not-registered" ||
          err.code === "messaging/invalid-registration-token"
        ) {
          await db.collection("fcmTokens").doc(task.userId).delete();
        }
      }
    }
  }
});

// ── Reset reminderSent when task is updated ─────────────
// So if user changes the due time, reminder fires again.

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");

exports.resetReminderOnUpdate = onDocumentUpdated("tasks/{taskId}", (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  // If dueDate, dueTime, or reminder changed → reset reminderSent
  if (
    before.dueDate !== after.dueDate ||
    before.dueTime !== after.dueTime ||
    before.reminder !== after.reminder
  ) {
    return event.data.after.ref.update({ reminderSent: false });
  }

  return null;
});

function formatOffset(reminder) {
  switch (reminder) {
    case "10min": return "10 minutes";
    case "30min": return "30 minutes";
    case "1hour": return "1 hour";
    case "1day": return "1 day";
    default: return "";
  }
}
