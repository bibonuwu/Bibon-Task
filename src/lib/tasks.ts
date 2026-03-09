import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Task, TaskFormData } from "@/types";

const COLLECTION = "tasks";

// ── Create ──────────────────────────────────────────────

export async function createTask(userId: string, data: TaskFormData): Promise<string> {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

// ── Update ──────────────────────────────────────────────

export async function updateTask(taskId: string, data: Partial<TaskFormData>): Promise<void> {
  const ref = doc(db, COLLECTION, taskId);
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

// ── Delete ──────────────────────────────────────────────

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, taskId));
}

// ── Real-time listener ──────────────────────────────────

export function subscribeTasks(
  userId: string,
  callback: (tasks: Task[]) => void,
  onError?: (error: Error) => void
): () => void {
  // Simple query — only filter by userId, sort client-side
  // This avoids needing a composite index in Firestore
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Task[];
      // Sort client-side by createdAt descending
      tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      callback(tasks);
    },
    (error) => {
      console.error("Firestore subscription error:", error);
      onError?.(error);
    }
  );

  return unsubscribe;
}
