import type { Metadata } from "next";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/primitives";
import { AccountStatusBadge, VerificationBadge } from "@/components/shared/status-badge";
import { PasswordForm } from "@/components/dashboard/password-form";
import { requireUser } from "@/lib/auth/session";
import { getEffectivePlan } from "@/lib/data/queries";
import { logout } from "@/lib/actions/auth";
import { SEGMENT_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser("/settings");
  const plan = await getEffectivePlan(user);
  const isAdmin = user.role === "admin";

  return (
    <>
      <PageHeader title="Settings" description="Manage your account, security and subscription." />
      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader title="Account" />
          <dl className="grid gap-x-6 gap-y-4 p-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted">Email</dt>
              <dd className="mt-0.5 text-ink">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Account type</dt>
              <dd className="mt-0.5 text-ink">{SEGMENT_LABEL[user.role]}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Status</dt>
              <dd className="mt-1">
                <AccountStatusBadge status={user.status} />
              </dd>
            </div>
            {!isAdmin && (
              <div>
                <dt className="text-xs text-muted">Verification</dt>
                <dd className="mt-1">
                  <VerificationBadge status={user.verification} />
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted">Member since</dt>
              <dd className="mt-0.5 text-ink">{formatDate(user.createdAt)}</dd>
            </div>
            {!isAdmin && (
              <div>
                <dt className="text-xs text-muted">Plan</dt>
                <dd className="mt-0.5 text-ink">
                  {plan?.name ?? "Free"}{" "}
                  <Link href="/dashboard/billing" className="ml-1 text-[13px] font-medium text-brand-700 hover:underline">
                    Manage
                  </Link>
                </dd>
              </div>
            )}
          </dl>
          <p className="border-t border-line px-5 py-3 text-xs text-muted">
            To change your sign-in email or account type, contact{" "}
            <a href="mailto:support@marketin.id" className="font-medium text-brand-700 hover:underline">
              support@marketin.id
            </a>
            .
          </p>
        </Card>

        <Card>
          <CardHeader title="Password" description="Use a unique password you don't use elsewhere." />
          <div className="p-5">
            <PasswordForm />
          </div>
        </Card>

        {!isAdmin && (
          <Card>
            <CardHeader title="Profile" description="Your public details, portfolio and verification." />
            <div className="flex flex-wrap gap-2 p-5">
              <Button asChild variant="secondary">
                <Link href="/profile">Edit profile</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href={`/profiles/${user.id}`}>View public profile</Link>
              </Button>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader title="Session" />
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-subtle">Sign out of MarketIn on this device.</p>
            <form action={logout}>
              <Button type="submit" variant="secondary">
                <LogOut /> Log out
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
}
