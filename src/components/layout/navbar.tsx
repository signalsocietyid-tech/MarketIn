"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { LayoutDashboard, LogOut, Menu, Settings, UserRound, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/primitives";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SheetContent,
} from "@/components/ui/overlays";
import { logout } from "@/lib/actions/auth";
import { SEGMENT_LABEL } from "@/lib/constants";
import type { SessionUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  { href: "/for-business", label: "For Business" },
  { href: "/for-sales-partners", label: "For Sales Partners" },
  { href: "/for-creators", label: "For Creators" },
  { href: "/for-agencies", label: "For Agencies" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const home = user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/register";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-[background-color,border-color,box-shadow] duration-200",
        scrolled ? "border-line bg-white/90 shadow-xs backdrop-blur-md" : "border-transparent bg-white/70 backdrop-blur-sm",
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-6">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active ? "text-brand-700" : "text-subtle hover:text-navy-900",
                  )}
                >
                  {l.label}
                  {active && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-brand-500" />}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild size="sm" variant="secondary" className="hidden sm:inline-flex">
                <Link href={home}>
                  <LayoutDashboard /> Dashboard
                </Link>
              </Button>
              <UserMenu user={user} />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}

          <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Trigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </DialogPrimitive.Trigger>
            <SheetContent title="Menu">
              <div className="flex h-16 items-center justify-between border-b border-line px-5">
                <Logo />
                <DialogPrimitive.Close className="rounded-md p-2 text-muted hover:bg-canvas" aria-label="Close menu">
                  <X className="size-5" />
                </DialogPrimitive.Close>
              </div>
              <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
                {[...NAV_LINKS, { href: "/marketplace", label: "Explore Marketplace" }].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-3 text-[15px] font-medium",
                      pathname === l.href ? "bg-brand-50 text-brand-800" : "text-ink hover:bg-canvas",
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
              <div className="space-y-2 border-t border-line p-4">
                {user ? (
                  <Button asChild className="w-full">
                    <Link href={home} onClick={() => setOpen(false)}>
                      Go to dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild className="w-full">
                      <Link href="/register" onClick={() => setOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" className="w-full">
                      <Link href="/login" onClick={() => setOpen(false)}>
                        Log In
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </DialogPrimitive.Root>
        </div>
      </nav>
    </header>
  );
}

export function UserMenu({ user, align = "end" }: { user: SessionUser; align?: "start" | "end" }) {
  const isAdmin = user.role === "admin";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full focus-visible:outline-2 focus-visible:outline-brand-400" aria-label="Account menu">
        <Avatar name={user.name} size={34} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-60">
        <DropdownMenuLabel>
          <span className="block truncate text-sm font-semibold text-ink">{user.name}</span>
          <span className="block truncate font-normal">{SEGMENT_LABEL[user.role]}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={isAdmin ? "/admin" : "/dashboard"}>
            <LayoutDashboard /> {isAdmin ? "Admin console" : "Dashboard"}
          </Link>
        </DropdownMenuItem>
        {!isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserRound /> My profile
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => logout()}>
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
