"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, CheckCheck, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, EmptyState } from "@/components/ui/primitives";
import { markNotificationsRead } from "@/lib/actions/marketplace";
import { useAction } from "@/lib/use-action";
import type { Notification } from "@/lib/types";
import { cn, formatDate, timeAgo } from "@/lib/utils";

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  const router = useRouter();
  const markAll = useAction();
  const [opening, startOpening] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const unread = notifications.filter((n) => !n.read).length;
  const shown = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const open = (n: Notification) => {
    setActiveId(n.id);
    startOpening(async () => {
      if (!n.read) {
        const result = await markNotificationsRead(n.id);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
      }
      if (n.href) router.push(n.href);
      else router.refresh();
    });
  };

  if (notifications.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="Updates about applications, partnerships, reviews and your plan will appear here."
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={unread ? `${unread} unread` : "All read"}
        description={`${notifications.length} notifications`}
        action={
          <div className="flex items-center gap-2">
            <div role="group" aria-label="Filter notifications" className="hidden items-center gap-1 rounded-lg border border-line bg-canvas p-0.5 sm:inline-flex">
              {(["all", "unread"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[13px] font-medium capitalize transition-colors",
                    filter === f ? "bg-white text-navy-900 shadow-xs" : "text-subtle hover:text-ink",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              disabled={!unread}
              loading={markAll.pending}
              onClick={() =>
                markAll.run(() => markNotificationsRead(), {
                  onSuccess: () => {
                    toast.success("All notifications marked as read.");
                    router.refresh();
                  },
                })
              }
            >
              {!markAll.pending && <CheckCheck />} Mark all as read
            </Button>
          </div>
        }
      />
      {shown.length === 0 ? (
        <EmptyState icon={CheckCheck} title="No unread notifications" description="You've read everything." className="py-10" />
      ) : (
        <ul className="divide-y divide-line">
          {shown.map((n) => {
            const busy = opening && activeId === n.id;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => open(n)}
                  disabled={busy}
                  className={cn(
                    "group flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-canvas/70 focus-visible:bg-canvas focus-visible:outline-none",
                    !n.read && "bg-brand-50/40",
                  )}
                >
                  <span className="mt-1.5 flex size-2 shrink-0 items-center justify-center" aria-hidden>
                    {!n.read && <span className="size-2 rounded-full bg-brand-500" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      <span className={cn("text-sm text-ink", !n.read ? "font-semibold" : "font-medium")}>
                        {n.title}
                        {!n.read && <span className="sr-only"> (unread)</span>}
                      </span>
                      <time dateTime={n.createdAt} title={formatDate(n.createdAt)} className="shrink-0 text-xs text-muted">
                        {timeAgo(n.createdAt)}
                      </time>
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-subtle">{n.body}</span>
                  </span>
                  {busy ? (
                    <Loader2 className="mt-1 size-4 shrink-0 animate-spin text-muted" />
                  ) : n.href ? (
                    <ChevronRight className="mt-1 size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
