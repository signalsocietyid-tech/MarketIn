import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PlannedTopic = { title: string; description: string };

/**
 * "Coming soon" body for content sections that have not published anything yet.
 * Lists planned topics only — never present these as published articles.
 */
export function PlannedTopics({ topics, note }: { topics: PlannedTopic[]; note: string }) {
  return (
    <>
      <div className="flex gap-3 rounded-xl border border-line bg-white p-4 shadow-card">
        <Clock className="mt-0.5 size-4 shrink-0 text-brand-600" />
        <p className="text-sm leading-relaxed text-ink">{note}</p>
      </div>

      <h2 className="mt-10 text-xl font-bold text-navy-900">Topics we plan to cover</h2>
      <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-white shadow-card">
        {topics.map((t) => (
          <li key={t.title} className="px-5 py-4">
            <p className="text-[15px] font-semibold text-navy-900">{t.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-subtle">{t.description}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-xl border border-navy-100 bg-navy-50/60 p-5 sm:p-6">
        <p className="text-[15px] font-semibold text-navy-900">While you wait</p>
        <p className="mt-1 text-sm text-subtle">See how partnerships work on MarketIn, or browse what is live today.</p>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <Button asChild>
            <Link href="/marketplace">
              Explore the marketplace
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/how-it-works">How it works</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
