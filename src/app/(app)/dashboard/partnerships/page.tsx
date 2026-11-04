import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, CheckCircle2, Eye, FileText, Handshake, Info, Target, Wallet, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/primitives";
import { StatCard } from "@/components/dashboard/widgets";
import { PartnershipList } from "@/components/dashboard/partnership-list";
import type { PartnershipItem } from "@/components/dashboard/partnership-card";
import { requireRole } from "@/lib/auth/session";
import { getPartnershipsForUser } from "@/lib/data/queries";
import type { PartnershipMetrics, Segment } from "@/lib/types";
import { formatCompact, formatIDRShort } from "@/lib/utils";

export const metadata: Metadata = { title: "Partnerships" };

const TITLE: Record<Segment, string> = {
  business: "Partnerships",
  sales: "Active partnerships",
  creator: "Active collaborations",
  agency: "Active partnerships",
};

type MetricCard = { key: keyof PartnershipMetrics; label: string; icon: LucideIcon; format: (n: number) => string };

const revenue: MetricCard = { key: "revenue", label: "Revenue", icon: Wallet, format: formatIDRShort };
const leads: MetricCard = { key: "leads", label: "Leads", icon: Target, format: (n) => n.toLocaleString("id-ID") };
const conversions: MetricCard = { key: "conversions", label: "Conversions", icon: BarChart3, format: (n) => n.toLocaleString("id-ID") };
const reach: MetricCard = { key: "reach", label: "Reach", icon: Eye, format: formatCompact };
const content: MetricCard = { key: "contentPieces", label: "Content pieces", icon: FileText, format: (n) => n.toLocaleString("id-ID") };

/** The two result metrics that matter most for each role's summary row. */
const ROLE_METRICS: Record<Segment, [MetricCard, MetricCard]> = {
  business: [revenue, leads],
  sales: [revenue, conversions],
  creator: [reach, content],
  agency: [revenue, reach],
};

export default async function PartnershipsPage() {
  const user = await requireRole(["business", "sales", "creator", "agency"], "/dashboard/partnerships");
  const role = user.role as Segment;
  const all = await getPartnershipsForUser(user.id);

  const items: PartnershipItem[] = all
    .filter((p) => !!p.opportunity)
    .map(({ opportunity: o, ...rest }) => ({
      ...rest,
      opportunity: { id: o.id, title: o.title, companyName: o.companyName, category: o.category },
    }));

  const active = items.filter((p) => p.status === "active").length;
  const paused = items.filter((p) => p.status === "paused").length;
  const completed = items.filter((p) => p.status === "completed").length;
  const total = (key: keyof PartnershipMetrics) => items.reduce((s, p) => s + p.metrics[key], 0);
  const isBusiness = role === "business";

  return (
    <div>
      <PageHeader
        title={TITLE[role]}
        description={
          isBusiness
            ? "Partners you're working with and the results they've reported."
            : "Brands you're working with and the results you've reported."
        }
        actions={
          <Button asChild variant="secondary">
            <Link href="/dashboard/applications">{isBusiness ? "Applications received" : role === "agency" ? "Proposals" : "My applications"}</Link>
          </Button>
        }
      />

      {items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Handshake}
            title="No partnerships yet"
            description={
              isBusiness
                ? "When you accept an application, a partnership starts here so you can follow its results."
                : "When a business accepts your application, the partnership appears here."
            }
            action={
              <Button asChild>
                <Link href={isBusiness ? "/dashboard/applications" : "/marketplace"}>
                  {isBusiness ? "Review applications" : "Find opportunities"}
                </Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Active" value={active} hint={paused ? `${paused} paused` : "Running now"} icon={Handshake} tone="success" />
            <StatCard label="Completed" value={completed} hint={`${items.length} in total`} icon={CheckCircle2} tone="neutral" />
            {ROLE_METRICS[role].map((m) => (
              <StatCard
                key={m.key}
                label={isBusiness ? `${m.label} from partners` : `${m.label} delivered`}
                value={m.format(total(m.key))}
                hint="Reported figures, all partnerships"
                icon={m.icon}
                tone={m.key === "revenue" ? "brand" : "blue"}
              />
            ))}
          </div>

          <PartnershipList partnerships={items} />

          <p className="mt-6 flex gap-2 text-xs text-muted">
            <Info className="size-3.5 shrink-0 translate-y-px" />
            Metrics are figures reported by the partners involved. Automatic tracking integrations (e-commerce, affiliate links, CRM) aren&apos;t connected yet.
          </p>
        </>
      )}
    </div>
  );
}
