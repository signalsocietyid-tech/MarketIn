import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterWizard } from "@/components/onboarding/register-wizard";
import { getCurrentUser } from "@/lib/auth/session";
import { getCategoryNames } from "@/lib/data/queries";
import { SEGMENTS } from "@/lib/constants";
import type { Segment } from "@/lib/types";

export const metadata: Metadata = { title: "Create your account" };

export default async function RegisterPage(props: PageProps<"/register">) {
  const sp = await props.searchParams;
  if (await getCurrentUser()) redirect("/dashboard");

  const type = SEGMENTS.includes(sp.type as Segment) ? (sp.type as Segment) : undefined;
  const plan = typeof sp.plan === "string" ? sp.plan : undefined;
  const cycle = sp.cycle === "yearly" ? "yearly" : "monthly";
  const redirectTo = plan ? `/checkout?plan=${encodeURIComponent(plan)}&cycle=${cycle}` : "/dashboard?welcome=1";

  const [industries, niches, locations] = await Promise.all([
    getCategoryNames("industry"),
    getCategoryNames("niche"),
    getCategoryNames("location"),
  ]);

  return <RegisterWizard taxonomies={{ industries, niches, locations }} initialType={type} redirectTo={redirectTo} />;
}
