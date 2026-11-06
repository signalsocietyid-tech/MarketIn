"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ArrowRight, ChevronDown, LayoutDashboard, LogOut, Menu, Settings, UserRound, X } from "lucide-react";
import { Icon3D, type Icon3DName } from "@/components/brand/icon-3d";
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

type ProductLink = { href: string; label: string; body: string; icon: Icon3DName };

export const PRODUCT_LINKS: ProductLink[] = [
  { href: "/for-business", label: "For Business", body: "Find sales partners, distributors, affiliates and KOLs.", icon: "office_building" },
  { href: "/for-sales-partners", label: "For Sales Partners", body: "Commission-based deals and products to distribute.", icon: "chart_increasing" },
  { href: "/for-creators", label: "For KOL & Creators", body: "Paid campaigns, affiliate programs and UGC work.", icon: "video_camera" },
  { href: "/for-agencies", label: "For Agencies", body: "Manage your talents and win client partnerships.", icon: "busts_in_silhouette" },
];

const MARKETPLACE_LINK: ProductLink = { href: "/marketplace", label: "Explore Marketplace", body: "Browse every open opportunity and partner.", icon: "department_store" };

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const home = user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/register";
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  const productActive = PRODUCT_LINKS.some((l) => isActive(l.href));

  return (
    <header className="sticky top-0 z-40 w-full px-3 pt-3 sm:px-4">
      <nav
        className={cn(
          "mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 rounded-full pl-4 pr-2 transition-all duration-300",
          scrolled ? "glass-strong" : "glass",
        )}
      >
        <Logo className="shrink-0" />

        <ul className="hidden items-center gap-0.5 lg:flex">
          <li>
            <NavLink href="/" active={isActive("/")}>
              Home
            </NavLink>
          </li>
          <li>
            <ProductMenu active={productActive} />
          </li>
          {LINKS.slice(1).map((l) => (
            <li key={l.href}>
              <NavLink href={l.href} active={isActive(l.href)}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
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
              <Button asChild size="sm" className="hidden px-4 sm:inline-flex">
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
            <SheetContent title="Menu" className="bg-white/85 backdrop-blur-2xl">
              <div className="flex h-16 items-center justify-between border-b border-black/5 px-5">
                <Logo />
                <DialogPrimitive.Close className="rounded-full p-2 text-muted hover:bg-black/5" aria-label="Close menu">
                  <X className="size-5" />
                </DialogPrimitive.Close>
              </div>
              <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
                <MobileLink href="/" label="Home" active={isActive("/")} onClick={() => setOpen(false)} />
                <p className="mt-4 px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Our Product</p>
                {[...PRODUCT_LINKS, MARKETPLACE_LINK].map((l) => {
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-2xl px-3 py-2.5",
                        isActive(l.href) ? "bg-brand-50 text-brand-800" : "text-ink hover:bg-black/[0.03]",
                      )}
                    >
                      <Icon3D name={l.icon} size={36} float={false} />
                      <span className="text-[15px] font-medium">{l.label}</span>
                    </Link>
                  );
                })}
                <div className="mt-4 border-t border-black/5 pt-3">
                  {LINKS.slice(2).map((l) => (
                    <MobileLink key={l.href} href={l.href} label={l.label} active={isActive(l.href)} onClick={() => setOpen(false)} />
                  ))}
                </div>
              </div>
              <div className="space-y-2 border-t border-black/5 p-4">
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

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors",
        active ? "bg-white/80 text-brand-700 shadow-[inset_0_1px_0_white,0_2px_8px_-2px_rgb(244_119_53/0.25)]" : "text-ink/70 hover:bg-white/60 hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}

function MobileLink({ href, label, active, onClick }: { href: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("block rounded-2xl px-3 py-3 text-[15px] font-medium", active ? "bg-brand-50 text-brand-800" : "text-ink hover:bg-black/[0.03]")}
    >
      {label}
    </Link>
  );
}

/** "Our Product" dropdown: opens on hover or click; Escape and outside clicks close it. */
function ProductMenu({ active }: { active: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const wrap = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // A click right after a hover-open shouldn't immediately close the menu.
  const openedByHover = useRef(false);

  // Close whenever the route changes (adjusting state during render, per React docs).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    if (!open) openedByHover.current = true;
    setOpen(true);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 140);
  };

  return (
    <div ref={wrap} className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => {
          if (openedByHover.current) {
            openedByHover.current = false;
            setOpen(true);
          } else setOpen((o) => !o);
        }}
        className={cn(
          "flex items-center gap-1 rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors",
          active || open ? "bg-white/80 text-brand-700" : "text-ink/70 hover:bg-white/60 hover:text-ink",
        )}
      >
        Our Product
        <ChevronDown className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>

      <div
        className={cn(
          "absolute left-1/2 top-full z-50 w-[560px] -translate-x-1/2 pt-3 transition-all duration-200",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
      >
        {/* Nested inside the blurred navbar, so backdrop blur can't reach the page: use a near-opaque surface. */}
        <div className="glass-strong rounded-3xl !bg-white/[0.96] p-2">
          <div className="grid grid-cols-2 gap-1">
            {PRODUCT_LINKS.map((l) => (
              <ProductItem key={l.href} link={l} onNavigate={() => setOpen(false)} />
            ))}
          </div>
          <Link
            href={MARKETPLACE_LINK.href}
            onClick={() => setOpen(false)}
            className="group mt-1 flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-brand-50 to-white/40 px-4 py-3 transition-colors hover:from-brand-100"
          >
            <span className="flex items-center gap-3">
              <Icon3D name={MARKETPLACE_LINK.icon} size={30} float={false} />
              <span>
                <span className="block text-sm font-semibold text-ink">{MARKETPLACE_LINK.label}</span>
                <span className="block text-xs text-subtle">{MARKETPLACE_LINK.body}</span>
              </span>
            </span>
            <ArrowRight className="size-4 text-brand-600 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProductItem({ link, onNavigate }: { link: ProductLink; onNavigate: () => void }) {
  return (
    <Link href={link.href} onClick={onNavigate} className="group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-white/80">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-white to-brand-50 shadow-[inset_0_1px_0_white,0_6px_14px_-8px_rgb(244_119_53/0.5)]">
        <Icon3D name={link.icon} size={36} float={false} />
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink">{link.label}</span>
        <span className="mt-0.5 block text-xs leading-snug text-subtle">{link.body}</span>
      </span>
    </Link>
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
