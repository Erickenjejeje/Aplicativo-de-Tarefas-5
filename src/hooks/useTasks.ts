import { useState, useEffect } from "react";
import { useProfile } from "./useProfile";
import { db } from "../lib/firebase";
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, where, serverTimestamp } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firebaseError";

export type TaskPriority = "Baixa" | "Média" | "Alta";

export interface Subtask {
  title: string;
  description: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  startTime: string;
  duration: number;
  priority: TaskPriority;
  category: string;
  date: string;
  effort: string;
  location: string;
  subtasks: Subtask[];
  style?: string;
  completed?: boolean;
  completedAt?: string;
  createdAt?: any;
  reminderEnabled?: boolean;
  reminderTime?: string;
  reminderCustomMinutes?: string;
  endTime?: string;
  durationStr?: string;
}

// Global event target for local sync without context
const taskEventTarget = new EventTarget();

export function useTasks() {
  const { user } = useProfile();
  const [tasks, setTasksState] = useState<Task[]>(() => {
    const cached = localStorage.getItem("@app_tasks_cache");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    const handleSync = (e: any) => setTasksState(e.detail);
    taskEventTarget.addEventListener('tasksUpdated', handleSync);
    return () => taskEventTarget.removeEventListener('tasksUpdated', handleSync);
  }, []);

  useEffect(() => {
    if (!user) {
      setTasksState([]);
      localStorage.removeItem("@app_tasks_cache");
      setTimeout(() => {
        taskEventTarget.dispatchEvent(new CustomEvent('tasksUpdated', { detail: [] }));
      }, 0);
      return;
    }

    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('ownerId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();
      const docsToDelete: string[] = [];

      const newTasks = snapshot.docs.reduce((acc, docSnapshot) => {
        const data = docSnapshot.data();
        if (data.completed && data.completedAt) {
          const completedDate = new Date(data.completedAt);
          const diffTime = Math.abs(now.getTime() - completedDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 7) {
            docsToDelete.push(docSnapshot.id);
            return acc;
          }
        }
        
        acc.push({
          id: docSnapshot.id,
          ...data
        } as Task);
        return acc;
      }, [] as Task[]);

      // Asynchronously delete expired completed tasks from Firestore
      docsToDelete.forEach(id => {
        deleteDoc(doc(db, 'tasks', id)).catch(err => {
          console.error("Failed to delete expired task:", err);
        });
      });

      newTasks.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || parseInt(a.id) || 0;
        const timeB = b.createdAt?.toMillis?.() || parseInt(b.id) || 0;
        return timeB - timeA;
      });
      setTasksState(newTasks);
      localStorage.setItem("@app_tasks_cache", JSON.stringify(newTasks));
      setTimeout(() => {
        taskEventTarget.dispatchEvent(new CustomEvent('tasksUpdated', { detail: newTasks }));
      }, 0);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tasks');
    });

    return () => unsubscribe();
  }, [user]);

  const updateLocalTasks = (updater: (prev: Task[]) => Task[]) => {
    setTasksState((prev) => {
      const newTasks = updater(prev);
      localStorage.setItem("@app_tasks_cache", JSON.stringify(newTasks));
      setTimeout(() => {
        taskEventTarget.dispatchEvent(new CustomEvent('tasksUpdated', { detail: newTasks }));
      }, 0);
      return newTasks;
    });
  };

  const setTasks = (newTasks: Task[]) => {
    if (!user) return; // Do not save if not logged in
    updateLocalTasks(() => newTasks);
  };

  const addTask = async (task: Omit<Task, "id" | "createdAt">) => {
    if (!user) return; // Do not save if not logged in
    const taskId = Date.now().toString();
    const newTask = { ...task, id: taskId } as Task;
    
    // optimistic update
    updateLocalTasks((prev) => [newTask, ...prev]);
    
    try {
        await setDoc(doc(db, 'tasks', taskId), {
            ...task,
            ownerId: user.uid,
            createdAt: serverTimestamp()
        });
    } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `tasks/${taskId}`);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return;
    
    // optimistic update
    updateLocalTasks((prev) => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    
    try {
        await setDoc(doc(db, 'tasks', id), updates, { merge: true });
    } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    // optimistic update
    updateLocalTasks((prev) => prev.filter(t => t.id !== id));
    
    try {
        await deleteDoc(doc(db, 'tasks', id));
    } catch(err) {
        handleFirestoreError(err, OperationType.DELETE, `tasks/${id}`);
    }
  }

  return { tasks, setTasks, addTask, updateTask, deleteTask };
}
