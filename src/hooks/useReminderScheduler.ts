import { useEffect, useRef } from "react";
import { useTasks } from "./useTasks";
import { useNotifications } from "./useNotifications";

export function useReminderScheduler() {
  const { tasks } = useTasks();
  const { addNotification } = useNotifications();
  const notifiedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Request permission on mount if not already granted/denied
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeInMinutes = currentHours * 60 + currentMinutes;

      tasks.forEach((task) => {
        if (task.completed) return;
        if (!task.reminderEnabled || !task.reminderTime || !task.startTime) return;

        // Parse start time (e.g. "12:00")
        const [startHours, startMinutes] = task.startTime.split(":").map(Number);
        if (isNaN(startHours) || isNaN(startMinutes)) return;
        
        let taskTimeInMinutes = startHours * 60 + startMinutes;
        let reminderTimeInMinutes = taskTimeInMinutes;

        let customMin = 0;
        if (task.reminderTime === "1 minuto antes") {
          customMin = 1;
        } else if (task.reminderTime === "5 minutos antes") {
          customMin = 5;
        } else if (task.reminderTime === "10 minutos antes") {
          customMin = 10;
        } else if (task.reminderTime === "Personalizado" && task.reminderCustomMinutes) {
          const parsedMin = parseInt(task.reminderCustomMinutes);
          if (!isNaN(parsedMin)) {
            customMin = parsedMin;
          }
        }
        
        reminderTimeInMinutes -= customMin;

        // Handle negative times (previous day)
        if (reminderTimeInMinutes < 0) {
          reminderTimeInMinutes += 24 * 60;
        }

        const isTimeToNotify = currentTimeInMinutes === reminderTimeInMinutes;
        // Also check if task date is today if date is set
        if (task.date) {
            const taskDate = new Date(task.date);
            const today = new Date();
            if (taskDate.getDate() !== today.getDate() || taskDate.getMonth() !== today.getMonth() || taskDate.getFullYear() !== today.getFullYear()) {
                return;
            }
        }

        const notificationKey = `${task.id}-${task.date || 'no-date'}-${reminderTimeInMinutes}`;

        if (isTimeToNotify && !notifiedTasks.current.has(notificationKey)) {
          notifiedTasks.current.add(notificationKey);
          
          const title = task.title;
          const body = customMin === 0 
            ? "Você tem uma tarefa agora"
            : `Está quase na hora! Sua próxima tarefa começa em ${customMin} minutos.`;

          // Add to firestore
          addNotification({
            title,
            body,
            taskId: task.id,
            read: false,
          });

          // Show system notification via Service Worker
          if ("serviceWorker" in navigator && "Notification" in window && Notification.permission === "granted") {
            navigator.serviceWorker.ready.then((registration) => {
              registration.showNotification(title, {
                body,
                icon: "/icon-192.png",
                badge: "/icon-192.png",
                // @ts-ignore
                vibrate: [200, 100, 200, 100, 200, 100, 200],
                data: "/",
              });
            });
          } else if ("Notification" in window && Notification.permission === "granted") {
             // @ts-ignore
             new Notification(title, { body, icon: "/icon-192.png", vibrate: [200, 100, 200, 100, 200, 100, 200] });
          }
        }
      });
    };

    const intervalId = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Initial check

    return () => clearInterval(intervalId);
  }, [tasks, addNotification]);
}
