import { useState, useEffect } from 'react';

export type FocusSession = {
  id: string;
  taskId: string;
  taskTitle: string;
  focusTime: number; // minutes
  breakTime: number; // minutes
  totalCycles: number;
  currentCycle: number; // 1 to totalCycles
  phase: 'focus' | 'break';
  timeLeft: number; // seconds
  timerState: 'idle' | 'running' | 'paused' | 'finished';
};

// Global state to persist timers across tab changes (since tabs unmount)
let globalSessions: FocusSession[] = [];
let listeners: (() => void)[] = [];

// Avoid multiple intervals on hot reloads
if (!(window as any).__focusTimerInterval) {
  (window as any).__focusTimerInterval = setInterval(() => {
    let changed = false;
    globalSessions = globalSessions.map(s => {
      if (s.timerState === 'running' && s.timeLeft > 0) {
        changed = true;
        const newTimeLeft = s.timeLeft - 1;
        if (newTimeLeft === 0) {
          if (s.phase === 'focus') {
            return {
              ...s,
              phase: 'break',
              timeLeft: s.breakTime * 60,
            };
          } else {
            if (s.currentCycle < s.totalCycles) {
              return {
                ...s,
                currentCycle: s.currentCycle + 1,
                phase: 'focus',
                timeLeft: s.focusTime * 60,
              };
            } else {
              return {
                ...s,
                timerState: 'finished',
                timeLeft: 0,
              };
            }
          }
        }
        return { ...s, timeLeft: newTimeLeft };
      }
      return s;
    });
    if (changed) {
      listeners.forEach(l => l());
    }
  }, 1000);
}

export function useFocusSessions() {
  const [sessions, setSessions] = useState<FocusSession[]>(globalSessions);

  useEffect(() => {
    const handleUpdate = () => setSessions(globalSessions);
    listeners.push(handleUpdate);
    return () => {
      listeners = listeners.filter(l => l !== handleUpdate);
    };
  }, []);

  const addSession = (session: FocusSession) => {
    globalSessions = [...globalSessions, session];
    listeners.forEach(l => l());
  };

  const removeSession = (id: string) => {
    globalSessions = globalSessions.filter(s => s.id !== id);
    listeners.forEach(l => l());
  };

  const updateSession = (id: string, updates: Partial<FocusSession>) => {
    globalSessions = globalSessions.map(s => s.id === id ? { ...s, ...updates } : s);
    listeners.forEach(l => l());
  };

  return { sessions, addSession, removeSession, updateSession };
}
