"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  Activity,
  BarChart3,
  Bell,
  Bookmark,
  Briefcase,
  CreditCard,
  FileText,
  FolderKanban,
  Handshake,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  Tags,
  UserRound,
  Users,
  UsersRound,
  Flag,
  type LucideIcon,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SheetContent } from "@/components/ui/overlays";
import { Badge } from "@/components/ui/primitives";
import { UserMenu } from "./navbar";
import type { SessionUser } from "@/lib/auth/session";
import type { Role } from "@/lib/types";
import { SEGMENT_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };
type NavSection = { title?: string; items: NavItem[] };

const NAV: Record<Role, NavSection[]> = {
  business: [
    {
      items: [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
        { href: "/dashboard/opportunities", label: "Opportunities", icon: Briefcase },
        { href: "/dashboard/applications", label: "Applications received", icon: ListChecks },
        { href: "/dashboard/partnerships", label: "Partnerships", icon: Handshake },
        { href: "/dashboard/saved", label: "Saved partners", icon: Bookmark },
        { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      ],
    },
  ],
  sales: [
    {
      items: [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
        { href: "/dashboard/recommended", label: "Recommended", icon: Sparkles },
        { href: "/dashboard/applications", label: "My applications", icon: ListChecks },
        { href: "/dashboard/partnerships", label: "Active partnerships", icon: Handshake },
        { href: "/dashboard/saved", label: "Saved", icon: Bookmark },
        { href: "/dashboard/analytics", label: "Profile performance", icon: Activity },
      ],
    },
  ],
  creator: [
    {
      items: [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
        { href: "/dashboard/recommended", label: "Recommended campaigns", icon: Sparkles },
        { href: "/dashboard/applications", label: "My applications", icon: ListChecks },
        { href: "/dashboard/partnerships", label: "Active collaborations", icon: Handshake },
        { href: "/dashboard/saved", label: "Saved", icon: Bookmark },
        { href: "/dashboard/analytics", label: "Campaign performance", icon: BarChart3 },
      ],
    },
  ],
  agency: [
    {
      items: [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
        { href: "/dashboard/talents", label: "Talent management", icon: UsersRound },
        { href: "/dashboard/inbox", label: "Opportunity inbox", icon: Inbox },
        { href: "/dashboard/applications", label: "Proposals", icon: ListChecks },
        { href: "/dashboard/partnerships", label: "Active partnerships", icon: Handshake },
        { href: "/dashboard/team", label: "Team", icon: Users },
        { href: "/dashboard/analytics", label: "Agency analytics", icon: BarChart3 },
      ],
    },
  ],
  admin: [
    {
      items: [
        { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
        { href: "/admin/users", label: "Users & verification", icon: Users },
        { href: "/admin/opportunities", label: "Opportunities", icon: Briefcase },
        { href: "/admin/applications", label: "Applications", icon: ListChecks },
        { href: "/admin/reports", label: "Reports", icon: Flag },
      ],
    },
    {
      title: "Monetization",
      items: [
        { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
        { href: "/admin/plans", label: "Plans & pricing", icon: FolderKanban },
        { href: "/admin/categories", label: "Categories", icon: Tags },
      ],
    },
  ],
};

const ACCOUNT_NAV: NavItem[] = [
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "My profile", icon: UserRound },
  { href: "/dashboard/billing", label: "Subscription", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SidebarNav({ role, unread, onNavigate }: { role: Role; unread: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  const sections: NavSection[] =
    role === "admin"
      ? [
          ...NAV.admin,
          {
            title: "Account",
            items: [
              { href: "/admin/notifications", label: "Notifications", icon: Bell },
              { href: "/settings", label: "Settings", icon: Settings },
            ],
          },
        ]
      : [...NAV[role], { title: "Account", items: ACCOUNT_NAV }];

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
      {sections.map((section, i) => (
        <div key={i}>
          {section.title && <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{section.title}</p>}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active ? "bg-brand-50 text-brand-800" : "text-subtle hover:bg-canvas hover:text-ink",
                    )}
                  >
                    <Icon className={cn("size-4", active ? "text-brand-600" : "text-muted")} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.href.endsWith("/notifications") && unread > 0 && (
                      <span className="rounded-full bg-brand-500 px-1.5 text-[11px] font-semibold text-white">{unread}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="mt-auto">
        <Link
          href={role === "admin" ? "/" : "/marketplace"}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-subtle hover:bg-canvas hover:text-ink"
        >
          {role === "admin" ? <ExternalLink className="size-4 text-muted" /> : <Store className="size-4 text-muted" />}
          {role === "admin" ? "View public site" : "Browse marketplace"}
        </Link>
      </div>
    </nav>
  );
}

export function AppShell({
  user,
  unread,
  planLabel,
  children,
}: {
  user: SessionUser;
  unread: number;
  planLabel?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const home = user.role === "admin" ? "/admin" : "/dashboard";

  const identity = (
    <div className="mx-3 mb-3 flex items-center gap-2 rounded-lg border border-line bg-canvas/60 px-3 py-2.5">
      {user.role === "admin" ? <ShieldCheck className="size-4 text-navy-700" /> : <FileText className="size-4 text-muted" />}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-subtle">{SEGMENT_LABEL[user.role]}</p>
        {planLabel && <p className="truncate text-[13px] font-semibold text-ink">{planLabel}</p>}
      </div>
      {planLabel && user.role !== "admin" && (
        <Link href="/dashboard/billing" className="text-xs font-semibold text-brand-700 hover:underline">
          Manage
        </Link>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-line px-5">
          <Logo href={home} />
        </div>
        <SidebarNav role={user.role} unread={unread} />
        {identity}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2">
            <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
              <DialogPrimitive.Trigger className="rounded-md p-2 text-subtle hover:bg-canvas lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </DialogPrimitive.Trigger>
              <SheetContent title="Navigation" side="left">
                <div className="flex h-16 items-center border-b border-line px-5">
                  <Logo href={home} />
                </div>
                <SidebarNav role={user.role} unread={unread} onNavigate={() => setOpen(false)} />
                {identity}
              </SheetContent>
            </DialogPrimitive.Root>
            <div className="lg:hidden">
              <Logo href={home} className="[&>span]:hidden sm:[&>span]:inline" />
            </div>
            {user.role === "admin" && <Badge tone="navy" className="hidden sm:inline-flex">Admin console</Badge>}
          </div>
          <div className="flex items-center gap-1.5">
            {(
              <Link
                href={user.role === "admin" ? "/admin/notifications" : "/dashboard/notifications"}
                className="relative rounded-md p-2 text-subtle hover:bg-canvas hover:text-ink"
                aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
              >
                <Bell className="size-5" />
                {unread > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-brand-500 ring-2 ring-white" />}
              </Link>
            )}
            <UserMenu user={user} />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

