import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser, toSessionUser } from "@/lib/auth/session";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  return (
    <>
      <Navbar user={user ? toSessionUser(user) : null} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
