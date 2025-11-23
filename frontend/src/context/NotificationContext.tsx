import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { NotificationType, Notification } from "../types/Notification";

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
  currentNotification: Notification | null;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    const id = Math.random().toString(36).substring(2, 9);
    const notification: Notification = { id, message, type };
    
    setQueue((prev) => [...prev, notification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setCurrentNotification((current) => {
      if (current?.id === id) {
        return null;
      }
      return current;
    });
  }, []);

  useEffect(() => {
    if (!currentNotification && queue.length > 0) {
      const [next, ...rest] = queue;
      setCurrentNotification(next);
      setQueue(rest);
    }
  }, [currentNotification, queue]);

  return (
    <NotificationContext.Provider value={{ showNotification, currentNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within NotificationProvider");
  return context;
};

