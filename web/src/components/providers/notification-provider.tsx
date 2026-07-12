"use client";

import { Bell } from "lucide-react";
import {
  createContext,
  memo,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Z_INDEX } from "@/constants";
import { cn } from "@/lib/utils";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read?: boolean;
};

type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  pushNotification: (input: { title: string; body: string }) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

const SEED: AppNotification[] = [
  {
    id: "n1",
    title: "Welcome to Dream Wave",
    body: "Explore AI Studio, Learn, and Books from your dashboard.",
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: "n2",
    title: "Tip: Global search",
    body: "Press Ctrl/⌘ + K to jump across platform modules.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
];

/** Isolate notification state updates from the app tree. */
const StableTree = memo(function StableTree({
  children,
}: {
  children: ReactNode;
}) {
  return children;
});

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      notifications: [] as AppNotification[],
      unreadCount: 0,
      pushNotification: () => undefined,
      markAllRead: () => undefined,
      clearNotifications: () => undefined,
    };
  }
  return ctx;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED);

  const pushNotification = useCallback(
    (input: { title: string; body: string }) => {
      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: input.title,
          body: input.body,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ].slice(0, 20));
    },
    [],
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      pushNotification,
      markAllRead,
      clearNotifications,
    }),
    [clearNotifications, markAllRead, notifications, pushNotification, unreadCount],
  );

  return (
    <NotificationContext.Provider value={value}>
      <StableTree>{children}</StableTree>
    </NotificationContext.Provider>
  );
}

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAllRead,
    clearNotifications,
  } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label={
          unreadCount
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        className="relative"
        onClick={() => {
          setOpen(true);
          markAllRead();
        }}
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span
            className="bg-primary text-primary-foreground fade-in absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px]"
            style={{ zIndex: Z_INDEX.toast }}
          >
            {unreadCount}
          </span>
        ) : null}
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Notifications"
        description="Platform updates and learning tips."
      >
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-sm">You&apos;re all caught up.</p>
          ) : (
            notifications.map((item) => (
              <article
                key={item.id}
                className={cn(
                  "border-border interactive-surface rounded-xl border px-3 py-2",
                  !item.read && "bg-muted/40",
                )}
              >
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-muted-foreground mt-1 text-xs text-pretty">
                  {item.body}
                </p>
              </article>
            ))
          )}
          {notifications.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="mt-2 h-9 w-full"
              onClick={() => clearNotifications()}
            >
              Clear all
            </Button>
          ) : null}
        </div>
      </Dialog>
    </>
  );
}
