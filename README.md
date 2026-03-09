# BibonTask — Premium Minimal Task Planner

A fast, beautiful, and modern task planner web app with adaptive design for mobile and desktop devices.

Built with **Next.js**, **TypeScript**, **Tailwind CSS**, **Firebase Auth**, and **Cloud Firestore**.

---

## Features

- **Authentication** — Email/Password and Google Login
- **Task Management** — Full CRUD with real-time sync via Firestore
- **Task Fields** — Title, description, due date & time, priority (low/medium/high), status (todo/in_progress/done), reminder
- **Swipe Gestures** — Swipe task cards left/right to change status (mobile)
- **Push Notifications** — Native OS notifications via Firebase Cloud Messaging (Windows, Android)
- **Deadline Reminders** — Banner on dashboard + browser push for overdue, today, and tomorrow tasks
- **Dark / Light Theme** — Toggle with system preference detection
- **Responsive Design** — Mobile-first, comfortable for finger on phone, clean workspace on desktop
- **Security** — Firestore rules isolate each user's data, route protection for unauthorized users
- **Cloud Functions** — Scheduled reminder checks every minute, sends FCM push to user devices

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 14 (App Router)           |
| Language    | TypeScript                        |
| Styling     | Tailwind CSS                      |
| Auth        | Firebase Authentication           |
| Database    | Cloud Firestore                   |
| Push        | Firebase Cloud Messaging (FCM)    |
| Backend     | Firebase Cloud Functions (v2)     |
| Hosting     | Vercel / Firebase Hosting         |

---

## Project Structure

```
bibontask/
├── public/
│   ├── firebase-messaging-sw.js    # Service Worker for background push
│   └── icon-192.png                # App icon for notifications
├── functions/
│   ├── index.js                    # Cloud Functions (checkReminders, resetReminderOnUpdate)
│   └── package.json
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with providers (Auth, Theme, Toaster)
│   │   ├── page.tsx                # Landing / hero page
│   │   ├── globals.css             # Tailwind + custom styles
│   │   ├── auth/
│   │   │   ├── login/page.tsx      # Sign in page
│   │   │   └── register/page.tsx   # Sign up page
│   │   ├── dashboard/page.tsx      # Main task manager
│   │   └── profile/page.tsx        # User profile, push toggle, theme settings
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthGuard.tsx       # Route protection for unauthorized users
│   │   ├── layout/
│   │   │   └── Header.tsx          # Responsive header with mobile menu
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx        # Task card with swipe-to-change-status
│   │   │   ├── TaskForm.tsx        # Create/edit form (date, time, reminder, priority)
│   │   │   ├── StatsBar.tsx        # Dashboard stats + progress bar
│   │   │   └── DeadlineBanner.tsx  # Overdue / today / tomorrow warning badges
│   │   └── ui/
│   │       ├── Button.tsx          # Button component (primary, secondary, ghost, danger)
│   │       ├── Input.tsx           # Input component with label and error
│   │       ├── Modal.tsx           # Bottom sheet (mobile) / centered (desktop)
│   │       ├── Badge.tsx           # Priority and status badges
│   │       ├── ConfirmDialog.tsx   # Delete confirmation dialog
│   │       ├── EmptyState.tsx      # Empty state with icon and CTA
│   │       └── Spinner.tsx         # Loading spinner
│   ├── hooks/
│   │   ├── useAuth.tsx             # Auth context provider + hook
│   │   ├── useTheme.tsx            # Theme context provider + hook
│   │   ├── useTasks.ts             # Real-time task subscription + filtering
│   │   ├── useNotifications.ts     # In-app deadline checker + browser Notification API
│   │   └── useFCM.ts              # FCM token management + foreground message handler
│   ├── lib/
│   │   ├── firebase.ts            # Firebase app initialization
│   │   ├── tasks.ts               # Firestore CRUD operations for tasks
│   │   └── fcm.ts                 # FCM token registration + foreground listener
│   └── types/
│       └── index.ts               # TypeScript types (Task, Priority, Status, Filters)
├── firestore.rules                 # Security rules (tasks + fcmTokens)
├── firestore.indexes.json          # Composite indexes
├── .env.local                      # Firebase config + VAPID key
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── package.json
```

---

## Getting Started

### 1. Install dependencies

```bash
cd bibontask
npm install
```

### 2. Firebase Console setup

**Authentication:**
- Go to Authentication → Sign-in method
- Enable **Email/Password**
- Enable **Google**

**Firestore Database:**
- Create a Firestore database
- Go to Rules tab and paste contents of `firestore.rules`

**Cloud Messaging:**
- Go to Project Settings → Cloud Messaging
- Under Web Push certificates → Generate key pair
- Copy the key and paste into `.env.local` as `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy Cloud Functions (requires Blaze plan)

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

This deploys `checkReminders` (runs every minute) and `resetReminderOnUpdate` (resets reminder flag when task is edited).

---

## Firestore Collections

### `tasks`
| Field        | Type   | Description                                |
|--------------|--------|--------------------------------------------|
| title        | string | Task title                                 |
| description  | string | Task description                           |
| dueDate      | string | Due date (YYYY-MM-DD)                      |
| dueTime      | string | Due time (HH:MM)                           |
| priority     | string | `low` \| `medium` \| `high`                |
| status       | string | `todo` \| `in_progress` \| `done`          |
| reminder     | string | `none` \| `at_time` \| `10min` \| `30min` \| `1hour` \| `1day` |
| reminderSent | bool   | Flag to prevent duplicate push             |
| userId       | string | Owner's Firebase UID                       |
| createdAt    | string | ISO timestamp                              |
| updatedAt    | string | ISO timestamp                              |

### `fcmTokens`
| Field     | Type   | Description                   |
|-----------|--------|-------------------------------|
| token     | string | FCM device token              |
| userId    | string | Owner's Firebase UID          |
| platform  | string | `windows` \| `android` \| ... |
| updatedAt | string | ISO timestamp                 |

---

## Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, update, delete: if request.auth != null
                                   && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;
    }
    match /fcmTokens/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Deploy

### Vercel (recommended for Next.js)

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard (same as `.env.local`).

### Firebase Hosting

```bash
firebase init hosting
npm run build
firebase deploy --only hosting
```

---

## Environment Variables

| Variable                               | Description                    |
|----------------------------------------|--------------------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY`         | Firebase API key               |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`     | Firebase auth domain           |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`      | Firebase project ID            |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`  | Firebase storage bucket        |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID              |
| `NEXT_PUBLIC_FIREBASE_APP_ID`          | Firebase app ID                |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY`       | Web Push VAPID key             |

---

## License

MIT
