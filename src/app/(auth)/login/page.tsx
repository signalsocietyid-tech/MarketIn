import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { DemoAccess } from "@/components/auth/demo-access";
import { getCurrentUser } from "@/lib/auth/session";
import { demoRoles } from "@/lib/demo";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");
  const demo = demoRoles();

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-[28px] font-bold text-navy-900">Welcome back</h1>
      <p className="mt-2 text-sm text-subtle">Log in to manage your opportunities and partnerships.</p>
      <div className="mt-8">
        <LoginForm next={next} />
      </div>
      <p className="mt-6 text-center text-sm text-subtle">
        New to MarketIn?{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:underline">
          Create a free account
        </Link>
      </p>
      {demo.length > 0 && <DemoAccess roles={demo} />}
    </div>
  );
}
