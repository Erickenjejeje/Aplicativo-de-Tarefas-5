import { useState, useEffect } from "react";
import { useProfile } from "./useProfile";
import { db } from "../lib/firebase";
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, where, serverTimestamp } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firebaseError";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  taskId: string;
  createdAt: any;
  ownerId: string;
  read: boolean;
}

export function useNotifications() {
  const { user } = useProfile();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const notifRef = collection(db, 'notifications');
    const q = query(notifRef, where('ownerId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();
      const docsToDelete: string[] = [];

      const newNotifs = snapshot.docs.reduce((acc, docSnapshot) => {
        const data = docSnapshot.data();
        let diffDays = 0;
        
        if (data.createdAt) {
          const createdAtDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          const diffTime = Math.abs(now.getTime() - createdAtDate.getTime());
          diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        if (diffDays > 2) {
          docsToDelete.push(docSnapshot.id);
          return acc;
        }
        
        acc.push({
          id: docSnapshot.id,
          ...data
        } as AppNotification);
        return acc;
      }, [] as AppNotification[]);

      docsToDelete.forEach(id => {
        deleteDoc(doc(db, 'notifications', id)).catch(err => {
          console.error("Failed to delete expired notification:", err);
        });
      });

      newNotifs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA; // Descending
      });
      setNotifications(newNotifs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notifications');
    });

    return () => unsubscribe();
  }, [user]);

  const addNotification = async (notification: Omit<AppNotification, "id" | "createdAt" | "ownerId">) => {
    if (!user) return;
    const notifId = Date.now().toString();
    try {
        await setDoc(doc(db, 'notifications', notifId), {
            ...notification,
            ownerId: user.uid,
            createdAt: serverTimestamp()
        });
    } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `notifications/${notifId}`);
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    try {
        await setDoc(doc(db, 'notifications', id), { read: true }, { merge: true });
    } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const clearAll = async () => {
    if (!user) return;
    for (const notif of notifications) {
      try {
        await deleteDoc(doc(db, 'notifications', notif.id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `notifications/${notif.id}`);
      }
    }
  }

  return { notifications, addNotification, markAsRead, clearAll };
}
