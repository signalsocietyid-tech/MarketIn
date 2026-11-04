import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GlassBackdrop } from "@/components/layout/glass-backdrop";
import { GlassPointer } from "@/components/layout/glass-pointer";
import { getCurrentUser, toSessionUser } from "@/lib/auth/session";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  return (
    <>
      <GlassBackdrop />
      <GlassPointer />
      <Navbar user={user ? toSessionUser(user) : null} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
