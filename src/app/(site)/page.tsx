import { Hero } from "@/components/home/hero";
import { Segments } from "@/components/home/segments";
import { Categories } from "@/components/home/categories";
import { Workflow } from "@/components/home/workflow";
import { Why } from "@/components/home/why";
import { AgencySection } from "@/components/home/agency-section";
import { Trust } from "@/components/home/trust";
import { FaqTabs } from "@/components/home/faq-tabs";
import { FinalCta } from "@/components/home/final-cta";
import { PricingTable } from "@/components/pricing/pricing-table";
import { SectionHeading } from "@/components/ui/primitives";
import { getPlans, getProfileView } from "@/lib/data/queries";
import { getPricingViewer } from "@/lib/data/viewer";
import type { ProfileView } from "@/lib/data/queries";

// Sample profiles shown in the trust section (fictional seed accounts).
const SAMPLE_PROFILE_IDS = ["u_sales1", "u_cr1", "u_ag1", "u_biz1"];

export default async function HomePage() {
  const [plans, viewer, samples] = await Promise.all([
    getPlans(),
    getPricingViewer(),
    Promise.all(SAMPLE_PROFILE_IDS.map(getProfileView)),
  ]);

  return (
    <>
      <Hero />
      <Segments />
      <Categories />
      <Workflow />
      <Why />
      <AgencySection />

      <section className="border-y border-line bg-white py-20 sm:py-24" id="pricing">
        <div className="container-page">
          <SectionHeading
            eyebrow="Membership"
            title="Choose Your Growth Plan."
            description="Start for free. Unlock more opportunities as your business grows."
          />
          <div className="mt-10">
            <PricingTable plans={plans} viewer={viewer} />
          </div>
        </div>
      </section>

      <div className="bg-canvas">
        <Trust samples={samples.filter((s): s is ProfileView => !!s)} />
      </div>

      <section className="py-20 sm:py-24" id="faq">
        <div className="container-page">
          <SectionHeading eyebrow="FAQ" title="Questions, answered." description="Everything you need to know about getting started on MarketIn." />
          <div className="mt-10">
            <FaqTabs />
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
