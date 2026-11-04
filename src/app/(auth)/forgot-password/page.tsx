import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <Link href="/login" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-subtle hover:text-ink">
        <ArrowLeft className="size-4" /> Back to log in
      </Link>
      <h1 className="mt-6 text-[28px] font-bold text-navy-900">Reset your password</h1>
      <p className="mt-2 text-sm text-subtle">Enter the email you registered with and we&apos;ll send you a reset link.</p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
