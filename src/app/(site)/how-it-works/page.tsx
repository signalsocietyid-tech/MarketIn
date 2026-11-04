import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronRight, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, SectionHeading } from "@/components/ui/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlays";
import { ApplicationStatusBadge } from "@/components/shared/status-badge";
import { CtaBand } from "@/components/marketing/cta-band";
import { StepFlow } from "@/components/marketing/step-flow";
import {
  COMPENSATION_MODELS,
  LIFECYCLE,
  PAYMENT_NOTE,
  PLATFORM_STEPS,
  REJECTED_NOTE,
  SEGMENT_JOURNEYS,
  TRUST_POINTS,
} from "@/content/how-it-works";
import { COMPENSATION_LABEL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "How MarketIn works for businesses, sales partners, creators and agencies: create a profile, discover opportunities, connect and collaborate, and grow together.",
};

export default function HowItWorksPage() {
  const PaymentIcon = PAYMENT_NOTE.icon;
  return (
    <>
      {/* Hero + platform flow */}
      <section className="relative overflow-hidden border-b border-line bg-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="container-page relative py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-700">How it works</p>
            <h1 className="text-[34px] font-bold leading-[1.1] text-navy-900 sm:text-[44px]">
              From first profile to a growing partnership
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-subtle sm:text-lg">
              MarketIn follows the same four steps for every account type. What changes is what you are looking for, and
              who is looking for you.
            </p>
          </div>
          <StepFlow steps={PLATFORM_STEPS} className="mx-auto mt-14 max-w-5xl" />
        </div>
      </section>

      {/* Journey per segment */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Your journey"
            title="What it looks like for you"
            description="Pick your account type to see the steps in detail."
          />
          <Tabs defaultValue={SEGMENT_JOURNEYS[0].segment} className="mt-10">
            <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
              <div className="flex sm:justify-center">
                <TabsList aria-label="Account type">
                  {SEGMENT_JOURNEYS.map((j) => (
                    <TabsTrigger key={j.segment} value={j.segment}>
                      {j.tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>
            {SEGMENT_JOURNEYS.map((j) => (
              <TabsContent key={j.segment} value={j.segment} className="mt-8 focus-visible:outline-none">
                <Card className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12">
                  <div>
                    <h3 className="text-xl font-bold text-navy-900">For {j.tab.toLowerCase()}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-subtle">{j.summary}</p>
                    <div className="mt-6 flex flex-col gap-2.5">
                      <Button asChild>
                        <Link href={j.primary.href}>
                          {j.primary.label}
                          <ArrowRight />
                        </Link>
                      </Button>
                      <Button asChild variant="secondary">
                        <Link href={j.secondary.href}>{j.secondary.label}</Link>
                      </Button>
                      <Link href={j.learnMore} className="mt-1 text-sm font-medium text-brand-700 hover:underline">
                        Learn more about MarketIn for {j.tab.toLowerCase()}
                      </Link>
                    </div>
                  </div>
                  <ol className="space-y-4">
                    {j.steps.map((step, i) => (
                      <li key={step} className="flex gap-4">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-navy-50 text-[13px] font-semibold text-navy-800">
                          {i + 1}
                        </span>
                        <p className="pt-0.5 text-[15px] leading-relaxed text-ink">{step}</p>
                      </li>
                    ))}
                  </ol>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Application lifecycle */}
      <section className="border-y border-line bg-white py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow="Application lifecycle"
            title="Know exactly where every application stands"
            description="Each application carries one status at a time. Businesses move it forward; applicants see every change on their dashboard and get notified."
          />
          <ol className="mt-12 grid gap-3 lg:grid-cols-5 lg:gap-4">
            {LIFECYCLE.map((stage, i) => (
              <li key={stage.status} className="relative">
                <div className="h-full rounded-xl border border-line bg-canvas/60 p-5">
                  <ApplicationStatusBadge status={stage.status} />
                  <p className="mt-3 text-sm leading-relaxed text-subtle">{stage.description}</p>
                </div>
                {i < LIFECYCLE.length - 1 && (
                  <>
                    <ChevronDown aria-hidden className="mx-auto my-1 size-4 text-muted lg:hidden" />
                    <ChevronRight
                      aria-hidden
                      className="absolute -right-[18px] top-1/2 z-10 hidden size-5 -translate-y-1/2 rounded-full border border-line bg-white p-0.5 text-muted lg:block"
                    />
                  </>
                )}
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-line-strong p-5 sm:flex-row sm:items-start">
            <XCircle className="size-5 shrink-0 text-danger-500" />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <ApplicationStatusBadge status="rejected" />
              <p className="text-sm leading-relaxed text-subtle">{REJECTED_NOTE}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Compensation models */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Compensation"
            title="Compensation models, explained"
            description="Every opportunity states which model it uses, so you can judge the offer before applying."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMPENSATION_MODELS.map(({ model, icon: Icon, description, typical }) => (
              <Card key={model} className="flex flex-col p-5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="size-[18px]" />
                </span>
                <h3 className="mt-4 font-sans text-[15px] font-semibold tracking-normal text-navy-900">{COMPENSATION_LABEL[model]}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-subtle">{description}</p>
                <p className="mt-auto pt-4 text-[13px] text-muted">
                  <span className="font-medium text-subtle">Typical for:</span> {typical}
                </p>
              </Card>
            ))}
            <div className="flex flex-col rounded-xl border border-navy-100 bg-navy-50/60 p-5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-white text-navy-700 ring-1 ring-navy-100">
                <PaymentIcon className="size-[18px]" />
              </span>
              <h3 className="mt-4 font-sans text-[15px] font-semibold tracking-normal text-navy-900">{PAYMENT_NOTE.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-subtle">{PAYMENT_NOTE.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & safety */}
      <section className="border-y border-line bg-white py-16 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Trust & safety"
              title="Built for partnerships you can rely on"
              description="Clear information and accountability on both sides make it easier to say yes to a new partner."
            />
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
              <Link href="/terms" className="text-brand-700 hover:underline">
                Terms & Conditions
              </Link>
              <Link href="/help" className="text-brand-700 hover:underline">
                Help Center
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {TRUST_POINTS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-xl border border-line p-5">
                <Icon className="size-5 text-navy-700" />
                <h3 className="mt-3 font-sans text-[15px] font-semibold tracking-normal text-navy-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-subtle">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Ready to find your next partner?"
        description="Create a free account in minutes, or explore the marketplace first."
        primary={{ label: "Get started free", href: "/register" }}
        secondary={{ label: "Explore the marketplace", href: "/marketplace" }}
      />
    </>
  );
}
