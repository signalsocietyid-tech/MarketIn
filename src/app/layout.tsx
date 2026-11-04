import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["500", "600", "700", "800"] });

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
    <html lang="en" className={`${inter.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast: "!rounded-lg !border-line !shadow-lift !font-sans",
              title: "!text-ink !font-medium",
              description: "!text-subtle",
            },
          }}
        />
      </body>
    </html>
  );
}
