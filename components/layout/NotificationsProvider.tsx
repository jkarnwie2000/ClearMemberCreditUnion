"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { notifications as initialNotifications } from "@/data/notifications";
import type { Notification } from "@/types";

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({
  children,
  initial = initialNotifications,
}: {
  children: ReactNode;
  initial?: Notification[];
}) {
  const [items, setItems] = useState<Notification[]>(initial);
  const [isPanelOpen, setPanelOpen] = useState(false);

  const markRead = useCallback((id: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }, []);
  const markAllRead = useCallback(() => {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
  }, []);
  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  const value = useMemo(
    () => ({
      notifications: items,
      unreadCount: items.filter((item) => !item.read).length,
      isPanelOpen,
      openPanel,
      closePanel,
      markRead,
      markAllRead,
    }),
    [items, isPanelOpen, openPanel, closePanel, markRead, markAllRead],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used inside NotificationsProvider");
  return context;
}
