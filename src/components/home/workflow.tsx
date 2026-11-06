import { Icon3D, type Icon3DName } from "@/components/brand/icon-3d";
import { SectionHeading } from "@/components/ui/primitives";

const STEPS: { icon: Icon3DName; title: string; body: string }[] = [
  { icon: "memo", title: "Create Your Profile", body: "Register as a business, sales partner, creator, or agency." },
  { icon: "magnifying_glass_tilted_left", title: "Discover Opportunities", body: "Browse relevant opportunities or find suitable partners." },
  { icon: "handshake", title: "Connect & Collaborate", body: "Apply, review applications, communicate, and negotiate." },
  { icon: "rocket", title: "Grow Together", body: "Manage partnerships and monitor your performance." },
];

export function Workflow() {
  return (
    <section className="px-4 py-20 sm:py-28" id="how-it-works">
      <div className="container-page">
        <SectionHeading eyebrow="How MarketIn works" title="Your Next Partnership Starts Here." />
        <ol className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-10 hidden h-px bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 lg:block" />
          {STEPS.map((s, i) => {
            return (
              <li key={s.title} className="group relative flex flex-col items-center text-center">
                <span className="glass-strong relative z-10 flex size-20 items-center justify-center rounded-full">
                  <Icon3D name={s.icon} size={52} delay={i * 1.1} />
                  <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-gradient-to-b from-brand-400 to-brand-500 text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-6 text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-subtle">{s.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
