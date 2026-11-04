import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// SF Pro is used on Apple devices via the system font stack (see globals.css);
// Inter is the fallback everywhere else.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "MarketIn — Where Businesses Meet Growth Opportunities",
    template: "%s · MarketIn",
  },
  description:
    "MarketIn connects businesses with independent sales partners, distributors, affiliates, KOLs, content creators and agencies — all in one growth marketplace.",
  applicationName: "MarketIn",
};

export const viewport: Viewport = {
  themeColor: "#F47735",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast: "!rounded-2xl !border-white/80 !bg-white/85 !backdrop-blur-xl !shadow-lift !font-sans",
              title: "!text-ink !font-medium",
              description: "!text-subtle",
            },
          }}
        />
      </body>
    </html>
  );
}
