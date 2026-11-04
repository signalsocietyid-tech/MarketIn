import { BadgeCheck, Handshake, LineChart } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const POINTS = [
  { icon: Handshake, title: "Four ways to grow", body: "Businesses, sales partners, creators & affiliates, and agencies on one platform." },
  { icon: BadgeCheck, title: "Built on trust", body: "Verification, reviews and transparent opportunity details." },
  { icon: LineChart, title: "Track what matters", body: "Applications, partnerships and performance in one dashboard." },
];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(420px,38%)]">
      <div className="flex flex-col bg-white">
        <header className="flex h-16 items-center px-5 sm:px-8">
          <Logo />
        </header>
        <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-6 sm:px-8 sm:pt-10">{children}</main>
      </div>
      <aside className="relative hidden overflow-hidden bg-navy-900 lg:block">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative flex h-full flex-col justify-center px-12 py-16 text-white">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-300">MarketIn</p>
          <h2 className="mt-3 max-w-sm text-[30px] font-bold leading-tight">Where Businesses Meet Growth Opportunities.</h2>
          <ul className="mt-10 space-y-6">
            {POINTS.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.title} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="size-[18px] text-brand-300" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{p.title}</p>
                    <p className="mt-0.5 max-w-xs text-[13px] leading-relaxed text-navy-200">{p.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}
